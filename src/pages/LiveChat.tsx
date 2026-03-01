import { useState, useRef, useCallback, useEffect } from "react";
import { Video, VideoOff, Mic, MicOff, Send, ArrowRight, MessageCircle, X, ChevronDown, Filter, Crown } from "lucide-react";
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
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>("searching");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [searchDots, setSearchDots] = useState("");
  const [remoteVisible, setRemoteVisible] = useState(false);
  const [gender, setGender] = useState<Gender>("boy");
  const [country, setCountry] = useState<Country>(COUNTRIES[COUNTRIES.length - 1]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [onlineCount] = useState(() => Math.floor(Math.random() * 15000) + 20000);

  const [matchCountry, setMatchCountry] = useState<Country>(COUNTRIES[0]);
  const [matchGender, setMatchGender] = useState<"boy" | "girl" | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [idle, setIdle] = useState(true);

  const chatEnabled = connectionState === "connected";

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) setCountryDropdownOpen(false);
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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleEnd();
      if (e.key === "ArrowRight" && !chatOpen) handleStartMatch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen]);

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
    startLocalCamera();
    return () => stopLocalCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartMatch = useCallback(async () => {
    if (idle) {
      const ok = localStreamRef.current || (await startLocalCamera());
      if (!ok) return;
      setIdle(false);
      setHasStarted(true);
    }
    clearRemote();
    setConnectionState("searching");
    setMessages([]);
    setInput("");
    setChatOpen(false);
    simulateMatch();
  }, [idle, clearRemote, simulateMatch, startLocalCamera]);

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
      {/* ═══ Top Navigation Bar ═══ */}
      <nav className="flex items-center justify-between px-5 lg:px-8 py-3 shrink-0 z-50 border-b border-border/30">
        <div className="flex items-center gap-6 lg:gap-10">
          <button onClick={() => navigate("/")} className="text-2xl font-display font-bold sahara-shine tracking-tight">
            Sahara
          </button>
          <div className="hidden sm:flex items-center gap-6">
            <span className="text-sm font-semibold text-foreground border-b-2 border-primary pb-0.5 uppercase tracking-wider">Video Chat</span>
            <button onClick={() => navigate("/history")} className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">Message</button>
            <button onClick={() => navigate("/history")} className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">History</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/buy-coins")} className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
            FreeMatch
          </button>
          <button onClick={() => navigate("/buy-coins")} className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-primary/40 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
            Store
          </button>
          <button onClick={() => navigate("/buy-coins")} className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-primary/40 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
            <Crown className="w-3.5 h-3.5" /> PLUS
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* ═══ Main Content: Videos + Sidebar ═══ */}
      <div className="flex-1 flex min-h-0 p-3 gap-3">
        {/* LEFT — Local Camera (You) */}
        <div className="flex-[1.1] relative rounded-2xl overflow-hidden bg-black border border-border/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          {!cameraOn && (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <VideoOff className="w-16 h-16 text-muted-foreground/40" />
            </div>
          )}

          {/* Camera/Mic controls overlay */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <button onClick={toggleCamera} className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-muted/40 transition-colors" title={cameraOn ? "Turn off camera" : "Turn on camera"}>
              {cameraOn ? <Video className="w-4 h-4 text-foreground" /> : <VideoOff className="w-4 h-4 text-destructive" />}
            </button>
            <button onClick={toggleMic} className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-muted/40 transition-colors" title={micOn ? "Mute" : "Unmute"}>
              {micOn ? <Mic className="w-4 h-4 text-foreground" /> : <MicOff className="w-4 h-4 text-destructive" />}
            </button>
          </div>

          {/* You label */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              You
            </div>
          </div>
        </div>

        {/* CENTER — Stranger */}
        <div className="flex-[1.1] relative rounded-2xl overflow-hidden bg-card border border-border/20">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              connectionState === "connected" && remoteVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Match Reveal Overlay */}
          <MatchRevealOverlay
            visible={connectionState === "revealing"}
            country={matchCountry}
            gender={matchGender}
            onRevealComplete={handleRevealComplete}
          />

          {/* Searching state — with online count */}
          {(connectionState === "searching" || idle) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-card">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                <Video className="w-7 h-7 text-primary-foreground" />
              </div>
              {idle ? (
                <>
                  <p className="text-xl font-display font-bold text-foreground mb-1">Ready to Connect</p>
                  <p className="text-muted-foreground text-sm">Press "Start Match" to begin</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-display font-bold text-primary mb-1">{onlineCount.toLocaleString()}</p>
                  <p className="text-muted-foreground text-sm">+ Online</p>
                  <p className="text-muted-foreground/60 text-xs mt-4">Searching{searchDots}</p>
                </>
              )}
            </div>
          )}

          {/* Connected but no video */}
          {connectionState === "connected" && !remoteVideoRef.current?.srcObject && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <VideoOff className="w-12 h-12 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground/40 text-xs">Waiting for video…</p>
            </div>
          )}

          {/* Stranger info badge */}
          {connectionState === "connected" && (
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
              <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
                <span className="text-sm">{matchCountry.flag}</span>
                <span className="text-xs font-semibold text-foreground">Stranger</span>
                <span className="text-[10px] text-muted-foreground">{matchCountry.name}</span>
              </div>
              <button
                onClick={() => setChatOpen((o) => !o)}
                className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-primary" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — Sidebar */}
        <div className="hidden lg:flex w-72 shrink-0 flex-col rounded-2xl border border-border/20 bg-card p-5 gap-4">
          <p className="text-foreground text-sm leading-relaxed">
            Ready to chat with new friends worldwide? Start matching for an enjoyable and fun communication experience! 🌍 💬
          </p>
          <button
            onClick={handleStartMatch}
            className="w-fit px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 active:scale-95 transition-all"
          >
            New Chat
          </button>

          {/* Quick chat panel in sidebar */}
          {chatEnabled && (
            <div className="flex-1 flex flex-col mt-2 border-t border-border/30 pt-3 min-h-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live Chat</span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto chat-scrollbar space-y-1.5 pr-1">
                {messages.length === 0 && (
                  <p className="text-[11px] text-muted-foreground/30 text-center mt-8 italic">No messages yet</p>
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
                        className={`text-xs px-3 py-1.5 rounded-2xl max-w-[85%] break-words ${
                          msg.sender === "me"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
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
              <div className="flex items-center gap-2 mt-2">
                <input
                  value={input}
                  onChange={(e) => chatEnabled && setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full px-3 py-1.5 text-xs bg-muted/30 text-foreground border border-border/40 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={handleSend}
                  className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:brightness-110 transition-all"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Chat Overlay for mobile ═══ */}
      {chatOpen && (
        <div className="lg:hidden absolute bottom-20 right-4 z-50 w-80 h-96 rounded-2xl glass-strong shadow-2xl flex flex-col overflow-hidden border border-primary/20 animate-fade-in">
          <div className="px-4 py-2.5 border-b border-border/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Chat</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto chat-scrollbar px-4 py-2 space-y-1.5">
            {messages.length === 0 && (
              <p className="text-[11px] text-muted-foreground/30 text-center mt-12 italic">No messages yet</p>
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
                    className={`text-xs px-3 py-1.5 rounded-2xl max-w-[80%] break-words ${
                      msg.sender === "me"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
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
          <div className="px-3 py-2.5 border-t border-border/30 flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => chatEnabled && setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={!chatEnabled}
              placeholder={chatEnabled ? "Type a message…" : "Connect to chat…"}
              className="flex-1 rounded-full px-4 py-2 text-sm bg-muted/30 text-foreground border border-border/40 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-40"
            />
            <button
              onClick={handleSend}
              disabled={!chatEnabled}
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:brightness-110 transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ═══ Bottom Action Bar ═══ */}
      <div className="shrink-0 flex items-center gap-3 px-3 lg:px-5 py-3 border-t border-border/30">
        {/* Country / Preferences */}
        <div className="relative flex-1 max-w-[200px]" ref={countryDropdownRef}>
          <button
            onClick={() => setCountryDropdownOpen((o) => !o)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 active:scale-[0.98] transition-all"
          >
            <Filter className="w-4 h-4" />
            Preferences {country.flag}
          </button>
          {countryDropdownOpen && (
            <div className="absolute bottom-full mb-2 left-0 w-full max-h-52 overflow-y-auto rounded-xl glass-strong shadow-lg z-50 py-1 animate-fade-in">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCountry(c); setCountryDropdownOpen(false); }}
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

        {/* Dynamic Start Match / Next button */}
        <button
          onClick={handleStartMatch}
          className={`flex-[2] flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-display font-bold text-base tracking-tight
            active:scale-[0.96] transition-all duration-300 relative overflow-hidden
            ${!hasStarted
              ? "bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.5),0_0_60px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_32px_hsl(var(--primary)/0.7),0_0_80px_hsl(var(--primary)/0.3)] hover:brightness-110 animate-glow-pulse"
              : "bg-accent text-accent-foreground shadow-[0_2px_16px_hsl(var(--accent)/0.3)] hover:shadow-[0_4px_24px_hsl(var(--accent)/0.45)] hover:brightness-110"
            }`}
        >
          {!hasStarted ? (
            <>
              <span className="relative z-10">Start Match</span>
              <ArrowRight className="w-5 h-5 relative z-10" />
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
