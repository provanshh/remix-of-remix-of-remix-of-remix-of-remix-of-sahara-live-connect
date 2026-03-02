import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type MatchStatus = "idle" | "queued" | "matched" | "connected" | "ended";

interface MatchInfo {
  sessionId: string;
  partnerId: string;
  partnerUsername: string;
  partnerAvatar?: string;
  partnerGender?: string;
  partnerCountry?: string;
}

interface UseRealtimeMatchOptions {
  onMatched?: (match: MatchInfo) => void;
  onMessage?: (msg: { text: string; senderId: string }) => void;
  onSignal?: (signal: RTCSessionDescriptionInit | RTCIceCandidateInit, type: string) => void;
  onPartnerDisconnected?: () => void;
}

export function useRealtimeMatch(options: UseRealtimeMatchOptions = {}) {
  const { user } = useAuth();
  const [status, setStatus] = useState<MatchStatus>("idle");
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Heartbeat to keep presence alive + get online count
  useEffect(() => {
    if (!user) return;

    const beat = async () => {
      try {
        const { data } = await supabase.functions.invoke("match-users", {
          body: { action: "heartbeat", status: status === "idle" ? "online" : status === "queued" ? "matching" : "in_chat" },
        });
        if (data?.online_count !== undefined) {
          setOnlineCount(data.online_count);
        }
      } catch (e) {
        console.error("Heartbeat error:", e);
      }
    };

    beat();
    heartbeatRef.current = setInterval(beat, 30000);
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [user, status]);

  // Listen for match_queue changes (when someone matches with us)
  useEffect(() => {
    if (!user || status !== "queued") return;

    const channel = supabase
      .channel("match-queue-" + user.id)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_queue",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const row = payload.new as any;
          if (row.status === "matched" && row.session_id && row.matched_with) {
            // Get partner profile (actual location & gender)
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, avatar_url, gender, country")
              .eq("id", row.matched_with)
              .single();

            const match: MatchInfo = {
              sessionId: row.session_id,
              partnerId: row.matched_with,
              partnerUsername: profile?.username || "Anonymous",
              partnerAvatar: profile?.avatar_url || undefined,
              partnerGender: (profile as any)?.gender || undefined,
              partnerCountry: (profile as any)?.country || undefined,
            };

            setMatchInfo(match);
            setStatus("matched");
            joinSessionChannel(match.sessionId);
            options.onMatched?.(match);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, status]);

  // Join a session-specific Realtime channel for signaling + messaging
  const joinSessionChannel = useCallback(
    (sessionId: string) => {
      if (!user) return;

      // Clean up existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel(`session-${sessionId}`, {
          config: { broadcast: { self: false } },
        })
        .on("broadcast", { event: "signal" }, ({ payload }) => {
          if (payload.senderId !== user.id) {
            options.onSignal?.(payload.data, payload.signalType);
          }
        })
        .on("broadcast", { event: "message" }, ({ payload }) => {
          if (payload.senderId !== user.id) {
            options.onMessage?.({ text: payload.text, senderId: payload.senderId });
          }
        })
        .on("broadcast", { event: "disconnect" }, ({ payload }) => {
          if (payload.senderId !== user.id) {
            options.onPartnerDisconnected?.();
          }
        })
        .subscribe();

      channelRef.current = channel;
    },
    [user, options]
  );

  // Join queue
  const joinQueue = useCallback(
    async (preferredGender?: string, preferredCountry?: string) => {
      if (!user) return;

      setStatus("queued");

      try {
        const { data, error } = await supabase.functions.invoke("match-users", {
          body: {
            action: "join_queue",
            preferred_gender: preferredGender || null,
            preferred_country: preferredCountry || null,
          },
        });

        if (error) throw error;

        if (data?.matched) {
          const match: MatchInfo = {
            sessionId: data.session_id,
            partnerId: data.partner_id,
            partnerUsername: data.partner_username,
            partnerAvatar: data.partner_avatar,
            partnerGender: data.partner_gender,
            partnerCountry: data.partner_country,
          };
          setMatchInfo(match);
          setStatus("matched");
          joinSessionChannel(match.sessionId);
          options.onMatched?.(match);
        }
        // If not matched, we're queued and listening for real-time updates
      } catch (e) {
        console.error("Join queue error:", e);
        setStatus("idle");
      }
    },
    [user, joinSessionChannel, options]
  );

  // Leave queue
  const leaveQueue = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.functions.invoke("match-users", {
        body: { action: "leave_queue" },
      });
    } catch (e) {
      console.error("Leave queue error:", e);
    }
    setStatus("idle");
    setMatchInfo(null);
  }, [user]);

  // End session
  const endSession = useCallback(async () => {
    if (!user) return;

    // Notify partner
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "disconnect",
        payload: { senderId: user.id },
      });
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    try {
      await supabase.functions.invoke("match-users", {
        body: { action: "end_session", session_id: matchInfo?.sessionId },
      });
    } catch (e) {
      console.error("End session error:", e);
    }

    setStatus("idle");
    setMatchInfo(null);
  }, [user, matchInfo]);

  // Send signaling data (WebRTC offer/answer/ICE)
  const sendSignal = useCallback(
    (data: RTCSessionDescriptionInit | RTCIceCandidateInit, signalType: string) => {
      if (!channelRef.current || !user) return;
      channelRef.current.send({
        type: "broadcast",
        event: "signal",
        payload: { senderId: user.id, data, signalType },
      });
    },
    [user]
  );

  // Send chat message
  const sendMessage = useCallback(
    (text: string) => {
      if (!channelRef.current || !user) return;
      channelRef.current.send({
        type: "broadcast",
        event: "message",
        payload: { senderId: user.id, text },
      });
    },
    [user]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return {
    status,
    setStatus,
    matchInfo,
    onlineCount,
    joinQueue,
    leaveQueue,
    endSession,
    sendSignal,
    sendMessage,
    joinSessionChannel,
  };
}
