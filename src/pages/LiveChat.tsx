import { useState, useRef, useCallback, useEffect } from "react";
import { Video, VideoOff, Mic, MicOff, PhoneOff, SkipForward, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { filterMessage } from "@/lib/profanityFilter";

type ChatMessage = { text: string; sender: "me" | "them" | "system" };
type ConnectionState = "idle" | "searching" | "connected";

export default function LiveChat() {
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [searchDots, setSearchDots] = useState("");
  const [matched, setMatched] = useState(false);

  useEffect(() => {
    if (connectionState !== "searching") return;
    const interval = setInterval(() => {
      setSearchDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [connectionState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch {
      setMessages((m) => [...m, { text: "Camera access denied.", sender: "system" }]);
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const handleStart = useCallback(async () => {
    setMatched(false);
    const stream = await startCamera();
    if (!stream) return;
    setConnectionState("searching");
    setMessages([{ text: "Looking for someone…", sender: "system" }]);

    setTimeout(() => {
      setConnectionState("connected");
      setMatched(true);
      setMessages((m) => [...m, { text: "Connected! Say hello 👋", sender: "system" }]);
      if (remoteVideoRef.current && streamRef.current) {
        remoteVideoRef.current.srcObject = streamRef.current;
      }
    }, 3000);
  }, [startCamera]);

  const handleNext = useCallback(() => {
    setMatched(false);
    setConnectionState("searching");
    setMessages((m) => [...m, { text: "Looking for a new connection…", sender: "system" }]);
    setTimeout(() => {
      setConnectionState("connected");
      setMatched(true);
      setMessages((m) => [...m, { text: "Connected to someone new! 🎉", sender: "system" }]);
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
      setMessages((m) => [...m, { text: "Blocked: inappropriate language.", sender: "system" }]);
    } else {
      setMessages((m) => [...m, { text: result.filtered, sender: "me" }]);
    }
    setInput("");
  }, [input]);

  const toggleCamera = useCallback(() => {
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOn((v) => !v);
  }, []);

  const toggleMic = useCallback(() => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((v) => !v);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Auto-start on mount
  useEffect(() => {
    handleStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* Video Section — ~78% height */}
      <div className="flex-1 flex relative min-h-0" style={{ maxHeight: "78vh" }}>
        {/* Remote Video (Left) */}
        <div className="w-1/2 relative bg-muted/20 overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-700 ${matched ? "opacity-100" : "opacity-0"}`}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-background/10 pointer-events-none" />
          {!matched && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-border/30 flex items-center justify-center">
                <Video className="w-6 h-6 text-muted-foreground/40" />
              </div>
            </div>
          )}
          {matched && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 glass rounded-full px-2.5 py-1 text-[10px] text-primary font-medium tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-border/30" />

        {/* Local Video (Right) */}
        <div className="w-1/2 relative bg-muted/20 overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="absolute inset-0 bg-background/10 pointer-events-none" />
          {!cameraOn && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-3 right-3 glass rounded-full px-2.5 py-1 text-[10px] text-muted-foreground tracking-wide uppercase">
            You
          </div>
        </div>

        {/* Searching Overlay */}
        {connectionState === "searching" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm transition-opacity duration-500">
            <div className="relative mb-5">
              <div className="w-14 h-14 rounded-full border border-primary/30 animate-pulse-ring absolute -inset-1" />
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <p className="text-foreground font-display font-semibold text-base tracking-tight">
              Searching for connection{searchDots}
            </p>
            <p className="text-muted-foreground text-xs mt-1">Stay on screen</p>
          </div>
        )}
      </div>

      {/* Controls Bar — slim */}
      <div className="flex items-center justify-center py-2.5 border-t border-border/20">
        <div className="glass-strong rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <ControlBtn
            onClick={handleNext}
            active={false}
            accent
            title="Next"
          >
            <SkipForward className="w-4 h-4" />
          </ControlBtn>
          <ControlBtn
            onClick={toggleCamera}
            active={!cameraOn}
            title={cameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </ControlBtn>
          <ControlBtn
            onClick={toggleMic}
            active={!micOn}
            title={micOn ? "Mute" : "Unmute"}
          >
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </ControlBtn>
          <ControlBtn
            onClick={handleEnd}
            active={false}
            danger
            title="Stop"
          >
            <PhoneOff className="w-4 h-4" />
          </ControlBtn>
        </div>
      </div>

      {/* Chat Section — compact ~12-15% */}
      <div className="border-t border-border/20 flex flex-col" style={{ height: "14vh" }}>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 min-h-0">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`text-xs leading-relaxed ${
                msg.sender === "system"
                  ? "text-muted-foreground/60 italic"
                  : msg.sender === "me"
                  ? "text-right"
                  : "text-left"
              }`}
            >
              {msg.sender !== "system" ? (
                <span
                  className={`inline-block px-2.5 py-1 rounded-xl max-w-[70%] ${
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
          <div ref={chatEndRef} />
        </div>
        <div className="px-4 pb-2 pt-1">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Write a message…"
              className="flex-1 bg-muted/50 border-none rounded-full px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring/30"
            />
            <button
              onClick={handleSend}
              className="w-8 h-8 rounded-full gradient-primary text-primary-foreground flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlBtn({
  children,
  onClick,
  active,
  accent,
  danger,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  accent?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
        danger
          ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
          : accent
          ? "text-primary hover:bg-primary/10"
          : active
          ? "bg-destructive/20 text-destructive"
          : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {children}
    </button>
  );
}
