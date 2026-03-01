import { useState, useRef, useEffect, useCallback } from "react";
import { Send, ArrowRight, Shield, Sparkles, LogOut, MessageCircle, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { filterMessage } from "@/lib/profanityFilter";
import { containsPersonalInfo } from "@/lib/privacyFilter";
import ThemeToggle from "@/components/ThemeToggle";
import AvatarSelector, { AVATAR_OPTIONS, type AvatarOption } from "@/components/AvatarSelector";
import saharaLogo from "@/assets/sahara-logo.png";

type ChatMessage = { text: string; sender: "me" | "them" | "system" };
type ConnectionState = "idle" | "searching" | "connected";

const SMART_SUGGESTIONS = [
  "Hey! What's your favourite hobby? 🎨",
  "What kind of music are you into? 🎵",
  "If you could travel anywhere, where would you go? ✈️",
  "What's the best show you've watched recently? 📺",
  "Do you prefer mountains or beaches? 🏔️",
  "What's something that made you smile today? 😊",
];

const ICEBREAKER_TIPS = [
  "💡 Try asking about their favorite travel destination!",
  "💡 Ask what music they're listening to lately!",
  "💡 Share something funny that happened to you today!",
  "💡 Ask about their dream superpower — it's always fun!",
  "💡 Try: \"What's the best meal you've ever had?\"",
  "💡 Ask: \"If you could live in any movie world, which one?\"",
  "💡 Try: \"What's a skill you wish you had?\"",
  "💡 Ask them about a hobby they're passionate about!",
  "💡 Share your favorite meme genre — bond over humor!",
  "💡 Try: \"What's the last thing that made you laugh?\"",
];

export default function TextChat() {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [myAvatar, setMyAvatar] = useState<AvatarOption | null>(null);
  const [strangerAvatar, setStrangerAvatar] = useState<AvatarOption | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [searchDots, setSearchDots] = useState("");
  const [privacyWarning, setPrivacyWarning] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [onlineCount] = useState(() => Math.floor(Math.random() * 8000) + 12000);
  const [icebreakerTip, setIcebreakerTip] = useState<string | null>(null);
  const lastMessageTimeRef = useRef<number>(0);
  const icebreakerIndexRef = useRef(0);

  const chatEnabled = connectionState === "connected";

  // Animated dots
  useEffect(() => {
    if (connectionState !== "searching") return;
    const iv = setInterval(() => setSearchDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
    return () => clearInterval(iv);
  }, [connectionState]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // AI Moderator: show icebreaker on connect + every 20s of silence
  useEffect(() => {
    if (connectionState !== "connected") {
      setIcebreakerTip(null);
      return;
    }

    // Show first icebreaker 2s after connection
    const initialTimer = setTimeout(() => {
      const tip = ICEBREAKER_TIPS[icebreakerIndexRef.current % ICEBREAKER_TIPS.length];
      icebreakerIndexRef.current++;
      setIcebreakerTip(tip);
      // Auto-dismiss after 8s
      setTimeout(() => setIcebreakerTip((prev) => (prev === tip ? null : prev)), 8000);
    }, 2000);

    // Check every 5s if 20s have passed since last message
    const silenceTimer = setInterval(() => {
      const now = Date.now();
      if (lastMessageTimeRef.current > 0 && now - lastMessageTimeRef.current >= 20000) {
        const tip = ICEBREAKER_TIPS[icebreakerIndexRef.current % ICEBREAKER_TIPS.length];
        icebreakerIndexRef.current++;
        setIcebreakerTip(tip);
        lastMessageTimeRef.current = now; // reset so next tip is 20s later
        setTimeout(() => setIcebreakerTip((prev) => (prev === tip ? null : prev)), 8000);
      }
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(silenceTimer);
    };
  }, [connectionState]);

  // Track last message time
  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.sender === "me" || last.sender === "them") {
        lastMessageTimeRef.current = Date.now();
      }
    }
  }, [messages]);

  const handleStartMatch = useCallback(() => {
    setConnectionState("searching");
    setMessages([{ text: "Looking for someone…", sender: "system" }]);
    setInput("");
    setIcebreakerTip(null);
    icebreakerIndexRef.current = 0;
    lastMessageTimeRef.current = 0;

    // Simulate finding a stranger (real connection would use WebRTC/Realtime)
    setTimeout(() => {
      const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
      setStrangerAvatar(randomAvatar);
      setConnectionState("connected");
      setMessages([{ text: `Connected with ${randomAvatar.label}! Say hi 👋`, sender: "system" }]);
    }, 2500 + Math.random() * 2000);
  }, []);

  const handleSend = useCallback(() => {
    if (!chatEnabled || !input.trim()) return;
    const text = input.trim();

    // Check personal info
    if (containsPersonalInfo(text)) {
      setPrivacyWarning(true);
      return;
    }

    // Check profanity
    const result = filterMessage(text);
    if (!result.clean) {
      setMessages((m) => [...m, { text: "⚠️ Blocked: inappropriate language.", sender: "system" }]);
    } else {
      setMessages((m) => [...m, { text: result.filtered, sender: "me" }]);
    }
    setInput("");
    setShowSuggestions(false);
  }, [input, chatEnabled]);

  const handleSuggestionPick = (s: string) => {
    setInput(s);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSkip = () => {
    setConnectionState("idle");
    setMessages([]);
    setStrangerAvatar(null);
    handleStartMatch();
  };

  const handleDownloadChat = useCallback(() => {
    if (messages.length === 0) return;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 16;
    const maxW = pageW - margin * 2;
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 200, 180);
    doc.text("Sahara Chat Transcript", margin, y);
    y += 8;

    // Date
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(new Date().toLocaleString(), margin, y);
    y += 4;

    // Divider line
    doc.setDrawColor(0, 200, 180);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 10;

    doc.setFontSize(10);

    messages.forEach((msg) => {
      // Check page overflow
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      if (msg.sender === "system") {
        doc.setTextColor(130, 130, 130);
        doc.setFont("helvetica", "italic");
        const lines = doc.splitTextToSize(`[System] ${msg.text}`, maxW);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 4;
      } else {
        const label = msg.sender === "me" ? (myAvatar?.label || "You") : (strangerAvatar?.label || "Stranger");
        if (msg.sender === "me") {
          doc.setTextColor(0, 180, 160);
        } else {
          doc.setTextColor(80, 80, 80);
        }
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, margin, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        const lines = doc.splitTextToSize(msg.text, maxW - 4);
        doc.text(lines, margin + 4, y + 5);
        y += lines.length * 5 + 8;
      }
    });

    doc.save(`sahara-chat-${Date.now()}.pdf`);
  }, [messages, myAvatar, strangerAvatar]);

  // Avatar selection screen
  if (!myAvatar) {
    return <AvatarSelector onSelect={(av) => setMyAvatar(av)} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden transition-colors duration-500 bg-gradient-to-br from-secondary/60 via-background to-secondary/40">
      {/* ═══ AI Moderator Icebreaker Popup ═══ */}
      {icebreakerTip && (
        <div className="fixed bottom-28 right-4 lg:right-[340px] z-[150] animate-scale-in max-w-[260px]">
          <div className="relative bg-card border border-primary/40 rounded-xl px-3.5 py-2.5 shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
            <button
              onClick={() => setIcebreakerTip(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground text-[10px] transition-colors"
            >
              ×
            </button>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-primary">AI Moderator</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed">{icebreakerTip}</p>
            <div className="mt-2 h-[2px] w-full bg-muted/30 rounded-full overflow-hidden">
              <div className="h-full bg-primary/50 rounded-full" style={{ animation: "shrink-bar 8s linear forwards" }} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ Privacy Warning Popup ═══ */}
      {privacyWarning && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4" onClick={() => setPrivacyWarning(false)}>
          <div className="bg-card border border-destructive/40 rounded-2xl p-6 max-w-sm w-full animate-scale-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-display font-bold text-foreground">Privacy Alert</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Personal information sharing is not allowed for your safety. This includes phone numbers, social media handles, email addresses, or external links.
            </p>
            <button
              onClick={() => setPrivacyWarning(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* ═══ Top Nav ═══ */}
      <nav className="flex items-center justify-between px-5 lg:px-8 py-3 shrink-0 z-50 border-b border-border/30">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity"><img src={saharaLogo} alt="Sahara" className="h-9 w-auto" /></button>
          <div className="hidden sm:flex items-center gap-6">
            <button onClick={() => navigate("/live")} className="nav-link-hover text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider pb-0.5">Video Chat</button>
            <span className="text-sm font-semibold text-foreground border-b-2 border-primary pb-0.5 uppercase tracking-wider">Message</span>
            <button onClick={() => navigate("/history")} className="nav-link-hover text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider pb-0.5">History</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Text-Only Mode Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Text-Only Mode 🔒 No Video</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 flex min-h-0 p-3 gap-3">

        {/* LEFT — Your Avatar Panel (mirrors video panel layout) */}
        <div className="flex-[1.1] relative rounded-2xl overflow-hidden bg-card border border-primary/30 shadow-[inset_0_0_1px_hsl(var(--primary)/0.5),0_0_8px_hsl(var(--primary)/0.15)] flex flex-col items-center justify-center">
          <div className={`w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br ${myAvatar.gradient} flex items-center justify-center text-white shadow-xl`}>
            <div className="scale-[2]">{myAvatar.icon}</div>
          </div>
          <p className="mt-4 text-foreground font-display font-bold text-lg">{myAvatar.label}</p>
          <p className="text-muted-foreground text-xs mt-1">You</p>
          {/* Status dot */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              You
            </div>
          </div>
        </div>

        {/* CENTER — Stranger Avatar Panel */}
        <div className="flex-[1.1] relative rounded-2xl overflow-hidden bg-card border border-primary/30 shadow-[inset_0_0_1px_hsl(var(--primary)/0.5),0_0_8px_hsl(var(--primary)/0.15)] flex flex-col items-center justify-center">
          {connectionState === "idle" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-muted/30 border-2 border-dashed border-border/50 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <p className="text-foreground font-display font-bold text-lg">Ready to Connect</p>
              <p className="text-muted-foreground text-sm">Press "Start Match" to begin</p>
            </div>
          )}

          {connectionState === "searching" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-muted/20 border-2 border-primary/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="text-3xl font-display font-bold text-primary">{onlineCount.toLocaleString()}</p>
              <p className="text-muted-foreground text-sm">+ Online</p>
              <p className="text-muted-foreground/60 text-xs">Searching{searchDots}</p>
            </div>
          )}

          {connectionState === "connected" && strangerAvatar && (
            <>
              <div className={`w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br ${strangerAvatar.gradient} flex items-center justify-center text-white shadow-xl`}>
                <div className="scale-[2]">{strangerAvatar.icon}</div>
              </div>
              <p className="mt-4 text-foreground font-display font-bold text-lg">{strangerAvatar.label}</p>
              <p className="text-muted-foreground text-xs mt-1">Stranger</p>
              <div className="absolute bottom-4 right-4 z-20">
                <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Connected
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT — Chat Sidebar */}
        <div className="hidden lg:flex w-80 shrink-0 flex-col rounded-2xl border border-primary/20 shadow-[inset_0_0_1px_hsl(var(--primary)/0.3),0_0_6px_hsl(var(--primary)/0.1)] bg-card overflow-hidden">
          {/* Chat header */}
          <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live Chat</span>
            </div>
            {messages.filter(m => m.sender !== "system").length > 0 && (
              <button
                onClick={handleDownloadChat}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider text-primary border border-primary/30 hover:bg-primary/10 transition-all"
                title="Download chat as PDF"
              >
                <Download className="w-3 h-3" />
                PDF
              </button>
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 min-h-0 overflow-y-auto chat-scrollbar px-4 py-3 space-y-2.5">
            {!chatEnabled && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <MessageCircle className="w-8 h-8 text-muted-foreground/20" />
                <p className="text-[11px] text-muted-foreground/30 text-center italic">Connect with someone to start chatting</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex chat-msg-enter ${msg.sender === "me" ? "justify-end" : msg.sender === "them" ? "justify-start" : "justify-center"}`}
              >
                {msg.sender === "system" ? (
                  <span className="text-[10px] text-muted-foreground/50 italic bg-muted/30 px-3 py-1 rounded-full">{msg.text}</span>
                ) : (
                  <div className={`flex items-end gap-1.5 max-w-[85%] ${msg.sender === "me" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white text-[9px] shadow-sm bg-gradient-to-br ${
                      msg.sender === "me" ? myAvatar.gradient : (strangerAvatar?.gradient || "from-slate-500 to-slate-700")
                    }`}>
                      {msg.sender === "me" ? myAvatar.icon : strangerAvatar?.icon}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-2xl text-xs break-words ${
                        msg.sender === "me"
                          ? "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-br-sm"
                          : "bg-muted/60 text-foreground rounded-bl-sm border border-border/30"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Smart Suggestions */}
          {showSuggestions && chatEnabled && (
            <div className="px-3 pb-2">
              <div className="bg-muted/30 border border-border/30 rounded-xl p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {SMART_SUGGESTIONS.slice(0, 4).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionPick(s)}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-card text-foreground border border-border/30 hover:border-primary/40 hover:bg-primary/10 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          {chatEnabled && (
            <div className="px-3 py-2.5 border-t border-border/30 flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowSuggestions((o) => !o)}
                className="w-7 h-7 rounded-full flex items-center justify-center border border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-all shrink-0 shadow-[0_0_4px_hsl(var(--primary)/0.15)]"
                title="Smart suggestions"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </button>
              <div className="flex-1 flex items-center rounded-full border border-primary/30 shadow-[0_0_6px_hsl(var(--primary)/0.15)] bg-muted/20 px-2 py-0.5">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full px-2 py-1 text-xs bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:brightness-110 active:scale-90 transition-all disabled:opacity-30"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Mobile Chat (shown below avatars on small screens) ═══ */}
      <div className="lg:hidden flex-1 min-h-0 flex flex-col border-t border-border/30">
        <div className="flex-1 min-h-0 overflow-y-auto chat-scrollbar px-4 py-3 space-y-2">
          {!chatEnabled && messages.length === 0 && (
            <p className="text-[11px] text-muted-foreground/30 text-center mt-8 italic">Connect to start chatting</p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex chat-msg-enter ${msg.sender === "me" ? "justify-end" : msg.sender === "them" ? "justify-start" : "justify-center"}`}
            >
              {msg.sender === "system" ? (
                <span className="text-[10px] text-muted-foreground/50 italic">{msg.text}</span>
              ) : (
                <div className={`flex items-end gap-1.5 max-w-[80%] ${msg.sender === "me" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white text-[9px] shadow-sm bg-gradient-to-br ${
                    msg.sender === "me" ? myAvatar.gradient : (strangerAvatar?.gradient || "from-slate-500 to-slate-700")
                  }`}>
                    {msg.sender === "me" ? myAvatar.icon : strangerAvatar?.icon}
                  </div>
                  <div className={`px-3 py-2 rounded-2xl text-xs break-words ${
                    msg.sender === "me"
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-br-sm"
                      : "bg-muted/60 text-foreground rounded-bl-sm border border-border/30"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {chatEnabled && (
          <div className="px-3 py-2.5 border-t border-border/30 flex items-center gap-2 shrink-0">
            <button onClick={() => setShowSuggestions((o) => !o)} className="w-8 h-8 rounded-full flex items-center justify-center border border-primary/30 hover:border-primary/50 shrink-0 shadow-[0_0_4px_hsl(var(--primary)/0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </button>
            <div className="flex-1 flex items-center rounded-full border border-primary/30 shadow-[0_0_6px_hsl(var(--primary)/0.15)] bg-muted/20 px-2 py-0.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message…"
                className="flex-1 rounded-full px-2 py-1.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors"
              />
            </div>
            <button onClick={handleSend} disabled={!input.trim()} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:brightness-110 disabled:opacity-30">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ═══ Bottom Action Bar ═══ */}
      <div className="shrink-0 flex items-center gap-3 px-3 lg:px-5 py-3 border-t border-border/30">
        <button
          onClick={handleStartMatch}
          className={`flex-[2] flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-display font-bold text-base tracking-tight
            active:scale-[0.96] transition-all duration-300
            ${connectionState === "idle"
              ? "bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.5)] hover:brightness-110"
              : "bg-accent text-accent-foreground shadow-[0_2px_16px_hsl(var(--accent)/0.3)] hover:brightness-110"
            }`}
        >
          {connectionState === "idle" ? (
            <>Start Match <ArrowRight className="w-5 h-5" /></>
          ) : (
            <>Next <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex-1 max-w-[140px] flex items-center justify-center gap-2 py-3.5 rounded-xl bg-destructive/80 text-destructive-foreground font-display font-bold text-sm
            shadow-[0_2px_12px_hsl(var(--destructive)/0.25)] hover:brightness-110 active:scale-[0.96] transition-all"
        >
          End
        </button>
      </div>
    </div>
  );
}
