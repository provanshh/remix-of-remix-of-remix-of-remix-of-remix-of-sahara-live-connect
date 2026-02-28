import { useState, useRef, useCallback, useEffect } from "react";
import { Video, VideoOff, Mic, MicOff, PhoneOff, SkipForward, MessageSquare, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { filterMessage } from "@/lib/profanityFilter";

type ChatMessage = { text: string; sender: "me" | "them" | "system" };
type ConnectionState = "idle" | "searching" | "connected" | "disconnected";

export default function LiveChat() {
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [searchDots, setSearchDots] = useState("");

  // Animated searching dots
  useEffect(() => {
    if (connectionState !== "searching") return;
    const interval = setInterval(() => {
      setSearchDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [connectionState]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch {
      setMessages((m) => [...m, { text: "Camera access denied. Please allow camera permissions.", sender: "system" }]);
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const handleStart = useCallback(async () => {
    const stream = await startCamera();
    if (!stream) return;
    setConnectionState("searching");
    setMessages([{ text: "Searching for someone to connect with...", sender: "system" }]);

    // Simulate match (in production, this uses WebRTC signaling via backend)
    setTimeout(() => {
      setConnectionState("connected");
      setMessages((m) => [...m, { text: "Connected! Say hello 👋", sender: "system" }]);
      // Mirror local video as "remote" for demo
      if (remoteVideoRef.current && streamRef.current) {
        remoteVideoRef.current.srcObject = streamRef.current;
      }
    }, 3000);
  }, [startCamera]);

  const handleNext = useCallback(() => {
    setConnectionState("searching");
    setMessages((m) => [...m, { text: "Looking for a new connection...", sender: "system" }]);
    setTimeout(() => {
      setConnectionState("connected");
      setMessages((m) => [...m, { text: "Connected to a new person! 🎉", sender: "system" }]);
    }, 2500);
  }, []);

  const handleEnd = useCallback(() => {
    stopCamera();
    setConnectionState("idle");
    navigate("/");
  }, [stopCamera, navigate]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const result = filterMessage(input.trim());
    if (!result.clean) {
      setMessages((m) => [...m, { text: "Message blocked: inappropriate language detected.", sender: "system" }]);
    } else {
      setMessages((m) => [...m, { text: result.filtered, sender: "me" }]);
    }
    setInput("");
  }, [input]);

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      setCameraOn((v) => !v);
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      setMicOn((v) => !v);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  if (connectionState === "idle") {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground glow-text mb-4">
          Ready to Connect?
        </h1>
        <p className="text-muted-foreground mb-10 text-center max-w-md">
          Your camera and microphone will be activated. You'll be matched with a random person instantly.
        </p>
        <Button
          onClick={handleStart}
          size="lg"
          className="px-10 py-7 text-lg rounded-full font-semibold gradient-primary text-primary-foreground glow-primary animate-glow-pulse hover:scale-105 transition-transform"
        >
          Start Matching
        </Button>
        <button
          onClick={() => navigate("/")}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Video Area */}
      <div className="flex-1 relative flex flex-col md:flex-row">
        {/* Remote Video */}
        <div className="flex-1 relative bg-muted/30">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {connectionState === "searching" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-primary animate-pulse-ring absolute inset-0" />
                <div className="w-16 h-16 rounded-full border-2 border-primary/50 animate-pulse-ring absolute inset-0" style={{ animationDelay: "0.5s" }} />
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                  <Video className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>
              <p className="text-foreground font-display font-semibold text-lg">
                Searching for connection{searchDots}
              </p>
              <p className="text-muted-foreground text-sm mt-1">This won't take long</p>
            </div>
          )}
          {connectionState === "connected" && (
            <div className="absolute top-4 left-4 flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Connected
            </div>
          )}
        </div>

        {/* Local Video (PIP) */}
        <div className="absolute bottom-20 right-4 md:bottom-4 md:right-4 w-36 md:w-48 aspect-video rounded-xl overflow-hidden border border-border shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
          {!cameraOn && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:right-auto flex items-center justify-center gap-3 p-4">
          <div className="glass-strong rounded-full px-4 py-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCamera}
              className={`rounded-full w-11 h-11 ${!cameraOn ? "bg-destructive/20 text-destructive" : "text-foreground hover:bg-muted"}`}
            >
              {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMic}
              className={`rounded-full w-11 h-11 ${!micOn ? "bg-destructive/20 text-destructive" : "text-foreground hover:bg-muted"}`}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="rounded-full w-11 h-11 text-primary hover:bg-primary/10"
              title="Next person"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatOpen((o) => !o)}
              className={`rounded-full w-11 h-11 md:hidden ${chatOpen ? "text-primary" : "text-foreground hover:bg-muted"}`}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEnd}
              className="rounded-full w-11 h-11 bg-destructive/20 text-destructive hover:bg-destructive/30"
              title="End call"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div
        className={`${
          chatOpen ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-80 lg:w-96 border-l border-border bg-card`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-semibold text-sm text-foreground">Chat</h2>
          <button
            className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" /> Report
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`text-sm ${
                msg.sender === "system"
                  ? "text-muted-foreground text-center text-xs italic"
                  : msg.sender === "me"
                  ? "text-right"
                  : "text-left"
              }`}
            >
              {msg.sender !== "system" ? (
                <span
                  className={`inline-block px-3 py-2 rounded-2xl max-w-[85%] ${
                    msg.sender === "me"
                      ? "gradient-primary text-primary-foreground"
                      : "glass text-foreground"
                  }`}
                >
                  {msg.text}
                </span>
              ) : (
                msg.text
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-muted border-none rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="rounded-full w-10 h-10 gradient-primary text-primary-foreground shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
