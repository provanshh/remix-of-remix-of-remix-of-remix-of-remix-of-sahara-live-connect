import { useState, useRef, useCallback, useEffect } from "react";
import { Video, VideoOff, Mic, MicOff, Send, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { filterMessage } from "@/lib/profanityFilter";
import ThemeToggle from "@/components/ThemeToggle";
import MatchRevealOverlay from "@/components/MatchRevealOverlay";

const COUNTRIES = [
  { code: "US", name: "USA", flag: "🇺🇸" },
  { code: "GB", name: "UK", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "Korea", flag: "🇰🇷" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "XX", name: "Any", flag: "🌍" },
];

type Country = (typeof COUNTRIES)[number];
type Gender = "boy" | "girl";
type ChatMessage = { text: string; sender: "me" | "them" | "system" };
type ConnectionState = "searching" | "revealing" | "connected";

export default function LiveChat() {
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>("searching");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [searchDots, setSearchDots] = useState("");
  const [remoteVisible, setRemoteVisible] = useState(false);
  const [gender, setGender] = useState<Gender>("boy");
  const [country, setCountry] = useState<Country>(COUNTRIES[COUNTRIES.length - 1]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [matchCountry, setMatchCountry] = useState<Country>(COUNTRIES[0]);
  const [matchGender, setMatchGender] = useState<"boy" | "girl" | null>(null);

  const chatEnabled = connectionState === "connected";

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Animated dots
  useEffect(() => {
    if (connectionState !== "searching") return;
    const interval = setInterval(() => setSearchDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
    return () => clearInterval(interval);
  }, [connectionState]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startLocalCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return true;
    } catch {
      setMessages((m) => [...m, { text: "Camera access denied.", sender: "system" }]);
      return false;
    }
  }, []);

  const stopLocalCamera = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  }, []);

  const clearRemote = useCallback(() => {
    setRemoteVisible(false);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  const handleRevealComplete = useCallback(() => {
    setConnectionState("connected");
    setRemoteVisible(true);
  }, []);

  const simulateMatch = useCallback(() => {
    setConnectionState("searching");
    clearRemote();
    setMessages([{ text: "Looking for someone…", sender: "system" }]);
    const randomCountry = COUNTRIES[Math.floor(Math.random() * (COUNTRIES.length - 1))];
    const randomGender = Math.random() > 0.5 ? ("boy" as const) : ("girl" as const);
    setTimeout(() => {
      setMatchCountry(randomCountry);
      setMatchGender(randomGender);
      setConnectionState("revealing");
    }, 3000);
  }, [clearRemote]);

  useEffect(() => {
    const init = async () => {
      const ok = await startLocalCamera();
      if (ok) simulateMatch();
    };
    init();
    return () => stopLocalCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = useCallback(() => {
    clearRemote();
    setConnectionState("searching");
    setMessages([]);
    setInput("");
    simulateMatch();
  }, [clearRemote, simulateMatch]);

  const handleEnd = useCallback(() => {
    clearRemote();
    stopLocalCamera();
    navigate("/");
  }, [clearRemote, stopLocalCamera, navigate]);

  const handleSend = useCallback(() => {
    if (!chatEnabled || !input.trim()) return;
    const result = filterMessage(input.trim());
    if (!result.clean) {
      setMessages((m) => [...m, { text: "Blocked: inappropriate language.", sender: "system" }]);
    } else {
      setMessages((m) => [...m, { text: result.filtered, sender: "me" }]);
    }
    setInput("");
  }, [input, chatEnabled]);

  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOn((v) => !v);
  }, []);

  const toggleMic = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((v) => !v);
  }, []);

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden transition-colors duration-500">
      {/* Theme toggle */}
      <div className="absolute top-3 right-3 z-50">
        <ThemeToggle />
      </div>

      {/* Video section — reduced height for chat bar */}
      <div className="flex relative" style={{ height: "calc(100vh - 13rem)" }}>
        {/* Match Reveal Overlay */}
        <MatchRevealOverlay
          visible={connectionState === "revealing"}
          country={matchCountry}
          gender={matchGender}
          onRevealComplete={handleRevealComplete}
        />

        {/* LEFT — Stranger */}
        <div className="w-1/2 relative bg-background overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              connectionState === "connected" && remoteVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Searching state */}
          {connectionState === "searching" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-full border border-primary/30 animate-pulse-ring absolute -inset-1" />
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                  <Video className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <p className="text-foreground/60 font-display font-medium text-sm tracking-tight">
                Searching{searchDots}
              </p>
            </div>
          )}

          {/* Waiting for video */}
          {connectionState === "connected" && !remoteVideoRef.current?.srcObject && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <Video className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground/40 text-xs">Waiting for video…</p>
            </div>
          )}

          {/* Stranger label */}
          <div className="absolute top-4 left-4 z-20">
            <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
              {connectionState === "connected" && (
                <span className="w-2 h-2 rounded-full bg-[hsl(142_70%_45%)] animate-pulse shrink-0" />
              )}
              <span className={connectionState === "connected" ? "text-foreground" : ""}>
                Stranger
              </span>
            </div>
          </div>
        </div>

        {/* Divider — ultra subtle */}
        <div className="w-px bg-border/10" />

        {/* RIGHT — You */}
        <div className="w-1/2 relative bg-background overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          {!cameraOn && (
            <div className="absolute inset-0 bg-background flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}

          {/* You label */}
          <div className="absolute top-4 right-14 z-20">
            <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
              You
              {!cameraOn && <VideoOff className="w-3 h-3" />}
              {!micOn && <MicOff className="w-3 h-3" />}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Control Dock ═══ */}
      <div className="absolute bottom-16 left-0 z-40 px-2 w-auto">
        <div className="flex items-stretch gap-1.5">
          {/* Start/Next */}
          <button
            onClick={handleNext}
            className="h-16 w-28 rounded-xl font-display font-bold text-base tracking-tight flex flex-col items-center justify-center
              bg-primary text-primary-foreground
              shadow-[0_2px_16px_hsl(var(--primary)/0.5),0_0_24px_hsl(var(--primary)/0.25)]
              hover:-translate-y-0.5 hover:shadow-[0_6px_28px_hsl(var(--primary)/0.6),0_0_40px_hsl(var(--primary)/0.3)] hover:brightness-110
              active:translate-y-0 active:scale-[0.97] active:shadow-[0_2px_10px_hsl(var(--primary)/0.3)]
              transition-all duration-200 ease-out"
          >
            {chatEnabled ? "Next" : "Start"}
          </button>

          {/* Stop */}
          <button
            onClick={handleEnd}
            className="h-16 w-28 rounded-xl font-display font-bold text-base tracking-tight flex flex-col items-center justify-center
              bg-primary text-primary-foreground
              shadow-[0_2px_16px_hsl(var(--primary)/0.5),0_0_24px_hsl(var(--primary)/0.25)]
              hover:-translate-y-0.5 hover:shadow-[0_6px_28px_hsl(var(--primary)/0.6),0_0_40px_hsl(var(--primary)/0.3)] hover:brightness-110
              active:translate-y-0 active:scale-[0.97] active:shadow-[0_2px_10px_hsl(var(--primary)/0.3)]
              transition-all duration-200 ease-out"
          >
            Stop
          </button>

          {/* Country */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="h-16 w-28 rounded-xl bg-primary text-primary-foreground flex flex-col items-center justify-center gap-1
                shadow-[0_2px_16px_hsl(var(--primary)/0.5),0_0_24px_hsl(var(--primary)/0.25)] border border-primary/30
                hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_6px_28px_hsl(var(--primary)/0.6),0_0_40px_hsl(var(--primary)/0.3)]
                active:translate-y-0 active:scale-[0.97] active:shadow-[0_2px_10px_hsl(var(--primary)/0.3)]
                transition-all duration-200 ease-out"
            >
              <span className="text-2xl leading-none">{country.flag}</span>
              <span className="text-[11px] font-medium text-primary-foreground/70">Country</span>
            </button>
            {dropdownOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-40 max-h-52 overflow-y-auto rounded-xl glass-strong shadow-lg z-50 py-1 animate-fade-in">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCountry(c); setDropdownOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-muted/50 transition-colors ${
                      c.code === country.code ? "bg-primary/10 text-primary" : "text-foreground"
                    }`}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="font-medium text-xs">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Gender */}
          <button
            onClick={() => setGender(gender === "boy" ? "girl" : "boy")}
            className="h-16 w-28 rounded-xl bg-primary text-primary-foreground flex flex-col items-center justify-center gap-1
              shadow-[0_2px_16px_hsl(var(--primary)/0.5),0_0_24px_hsl(var(--primary)/0.25)] border border-primary/30
              hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_6px_28px_hsl(var(--primary)/0.6),0_0_40px_hsl(var(--primary)/0.3)]
              active:translate-y-0 active:scale-[0.97] active:shadow-[0_2px_10px_hsl(var(--primary)/0.3)]
              transition-all duration-200 ease-out"
          >
            <span className="text-2xl leading-none">{gender === "boy" ? "👦" : "👧"}</span>
            <span className="text-[11px] font-medium text-primary-foreground/70">I am</span>
          </button>

          {/* Camera */}
          <button
            onClick={toggleCamera}
            title={cameraOn ? "Turn off camera" : "Turn on camera"}
            className={`h-16 w-16 rounded-xl flex flex-col items-center justify-center gap-1
              border transition-all duration-200 ease-out
              ${!cameraOn
                ? "bg-destructive/20 text-destructive border-destructive/30"
                : "bg-primary text-primary-foreground border-primary/30 shadow-[0_2px_16px_hsl(var(--primary)/0.5),0_0_24px_hsl(var(--primary)/0.25)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_6px_28px_hsl(var(--primary)/0.6),0_0_40px_hsl(var(--primary)/0.3)] active:translate-y-0 active:scale-[0.97]"
              }`}
          >
            {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Mic */}
          <button
            onClick={toggleMic}
            title={micOn ? "Mute" : "Unmute"}
            className={`h-16 w-16 rounded-xl flex flex-col items-center justify-center gap-1
              border transition-all duration-200 ease-out
              ${!micOn
                ? "bg-destructive/20 text-destructive border-destructive/30"
                : "bg-primary text-primary-foreground border-primary/30 shadow-[0_2px_16px_hsl(var(--primary)/0.5),0_0_24px_hsl(var(--primary)/0.25)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_6px_28px_hsl(var(--primary)/0.6),0_0_40px_hsl(var(--primary)/0.3)] active:translate-y-0 active:scale-[0.97]"
              }`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ═══ Full-Width Horizontal Chat Bar ═══ */}
      <div
        className={`h-52 shrink-0 w-full flex flex-col overflow-hidden
          bg-background/95 backdrop-blur-2xl transition-all duration-500
          neon-chat-box ${messages.length > 0 ? "neon-pulse" : ""}`}
      >
        {/* Chat header */}
        <div className="px-5 py-2 border-b border-primary/15 flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Chat</span>
        </div>

        {/* Scrollable messages */}
        <div className="flex-1 min-h-0 overflow-y-auto chat-scrollbar px-5 py-2 space-y-1.5">
          {messages.length === 0 && (
            <p className="text-[11px] text-muted-foreground/30 text-center mt-6 italic">No messages yet</p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex chat-msg-enter ${msg.sender === "me" ? "justify-end" : msg.sender === "them" ? "justify-start" : "justify-center"}`}
            >
              {msg.sender === "system" ? (
                <span className="text-[10px] text-muted-foreground/40 italic">{msg.text}</span>
              ) : (
                <span
                  className={`text-[12px] px-3 py-1.5 rounded-2xl max-w-[40%] break-words ${
                    msg.sender === "me"
                      ? "bg-[hsl(330_90%_60%)] text-[hsl(0_0%_100%)] rounded-br-sm"
                      : "bg-muted/60 text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </span>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Pinned input — neon orange */}
        <div className="px-5 py-2.5 border-t border-primary/25 flex items-center gap-3 shrink-0">
          <input
            value={input}
            onChange={(e) => chatEnabled && setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={!chatEnabled}
            placeholder={chatEnabled ? "Type a message…" : "Connect to chat…"}
            className={`flex-1 rounded-full px-5 py-2.5 text-sm font-medium focus:outline-none transition-all duration-300 ${
              chatEnabled
                ? "bg-[hsl(180_50%_8%)] text-[hsl(180_80%_85%)] border-2 border-primary/70 placeholder:text-primary/60 shadow-[inset_0_0_10px_hsl(var(--primary)/0.15),0_0_8px_hsl(var(--primary)/0.2)] focus:border-primary focus:shadow-[0_0_18px_hsl(var(--primary)/0.45),inset_0_0_10px_hsl(var(--primary)/0.15)]"
                : "bg-muted/15 text-muted-foreground/20 border-2 border-muted/20 placeholder:text-muted-foreground/20 opacity-40 cursor-not-allowed"
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!chatEnabled}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
              chatEnabled
                ? "bg-primary text-primary-foreground hover:scale-110 shadow-[0_0_16px_hsl(var(--primary)/0.5)]"
                : "bg-muted/20 text-muted-foreground/20 cursor-not-allowed"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
