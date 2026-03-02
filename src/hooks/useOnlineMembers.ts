import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OnlineMember {
  user_id: string;
  username: string;
  avatar_url: string | null;
  gender: string | null;
  country: string | null;
}

export function useOnlineMembers() {
  const [members, setMembers] = useState<OnlineMember[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      // Get online user IDs (active in last 5 min)
      const { data: presenceData } = await supabase
        .from("online_presence")
        .select("user_id")
        .gte("last_seen", new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (!presenceData || presenceData.length === 0) {
        setMembers([]);
        setOnlineCount(0);
        setLoading(false);
        return;
      }

      const userIds = presenceData.map((p) => p.user_id);
      setOnlineCount(userIds.length);

      // Get profiles for online users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, gender, country")
        .in("id", userIds);

      if (profiles) {
        setMembers(
          profiles.map((p) => ({
            user_id: p.id,
            username: p.username,
            avatar_url: p.avatar_url,
            gender: (p as any).gender ?? null,
            country: (p as any).country ?? null,
          }))
        );
      }
    } catch (e) {
      console.error("Error fetching online members:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();

    // Subscribe to presence changes for real-time updates
    const channel = supabase
      .channel("online-presence-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "online_presence" },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    // Also poll every 30s as fallback
    const interval = setInterval(fetchMembers, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return { members, onlineCount, loading, refetch: fetchMembers };
}
