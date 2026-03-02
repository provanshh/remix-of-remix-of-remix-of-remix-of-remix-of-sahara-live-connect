import { useCallback, useEffect, useRef } from "react";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

interface UseWebRTCOptions {
  localStream: MediaStream | null;
  onRemoteStream: (stream: MediaStream) => void;
  sendSignal: (data: RTCSessionDescriptionInit | RTCIceCandidateInit, type: string) => void;
  isInitiator: boolean;
  enabled: boolean;
}

export function useWebRTC({ localStream, onRemoteStream, sendSignal, isInitiator, enabled }: UseWebRTCOptions) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const hasCreatedOfferRef = useRef(false);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.onnegotiationneeded = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    pendingCandidatesRef.current = [];
    hasCreatedOfferRef.current = false;
  }, []);

  const createPeerConnection = useCallback(() => {
    cleanup();
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(event.candidate.toJSON(), "ice-candidate");
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
    };

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    pcRef.current = pc;
    return pc;
  }, [cleanup, localStream, onRemoteStream, sendSignal]);

  // Create connection when enabled
  useEffect(() => {
    if (!enabled || !localStream) return;

    const pc = createPeerConnection();

    // Initiator creates offer
    if (isInitiator) {
      hasCreatedOfferRef.current = true;
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (pc.localDescription) {
            sendSignal(pc.localDescription.toJSON(), "offer");
          }
        })
        .catch((err) => console.error("Error creating offer:", err));
    }

    return () => {
      cleanup();
    };
  }, [enabled, localStream, isInitiator, createPeerConnection, sendSignal, cleanup]);

  // Handle incoming signals
  const handleSignal = useCallback(
    async (data: RTCSessionDescriptionInit | RTCIceCandidateInit, type: string) => {
      let pc = pcRef.current;

      if (type === "offer") {
        // If we receive an offer, create PC if needed and respond
        if (!pc) {
          pc = createPeerConnection();
        }
        await pc.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));

        // Process pending candidates
        for (const candidate of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        if (pc.localDescription) {
          sendSignal(pc.localDescription.toJSON(), "answer");
        }
      } else if (type === "answer") {
        if (pc && pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));
          // Process pending candidates
          for (const candidate of pendingCandidatesRef.current) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingCandidatesRef.current = [];
        }
      } else if (type === "ice-candidate") {
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(data as RTCIceCandidateInit));
        } else {
          pendingCandidatesRef.current.push(data as RTCIceCandidateInit);
        }
      }
    },
    [createPeerConnection, sendSignal]
  );

  return { handleSignal, cleanup };
}
