import { useState, useRef, useEffect, useCallback } from "react";
import { Send, ArrowRight, X, Shield, Sparkles, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { filterMessage } from "@/lib/profanityFilter";
import { containsPersonalInfo } from "@/lib/privacyFilter";
import ThemeToggle from "@/components/ThemeToggle";
import AvatarSelector, { AVATAR_OPTIONS, type AvatarOption } from "@/components/AvatarSelector";

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
  const [typing, setTyping] = useState(false);
  const [onlineCount] = useState(() => Math.floor(Math.random() * 8000) + 12000);

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

  // Simulate stranger typing after user sends
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === "me" && connectionState === "connected") {
      setTyping(true);
      const t = setTimeout(() => {
        setTyping(false);
        // Simulated reply
        const replies = ["That's cool! 😄", "Interesting, tell me more!", "Haha nice 😂", "I totally agree!", "That's a great perspective 🙌"];
        setMessages((m) => [...m, { text: replies[Math.floor(Math.random() * replies.length)], sender: "them" }]);
      }, 1500 + Math.random() * 2000);
      return () => clearTimeout(t);
    }
  }, [messages, connectionState]);

  const handleStartMatch = useCallback(() => {
    setConnectionState("searching");
    setMessages([{ text: "Looking for someone…", sender: "system" }]);
    setInput("");
    setTyping(false);

    // Simulate finding a stranger
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
    setTyping(false);
    handleStartMatch();
  };

  // Avatar selection screen
  if (!myAvatar) {
    return <AvatarSelector onSelect={(av) => setMyAvatar(av)} />;
  }

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden transition-colors duration-500">
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
          <button onClick={() => navigate("/")} className="text-2xl font-display font-bold sahara-shine tracking-tight">Sahara</button>
          <div className="hidden sm:flex items-center gap-6">
            <button onClick={() => navigate("/live")} className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">Video Chat</button>
            <span className="text-sm font-semibold text-foreground border-b-2 border-primary pb-0.5 uppercase tracking-wider">Message</span>
            <button onClick={() => navigate("/history")} className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">History</button>
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

      {/* ═══ Main Chat Area ═══ */}
      <div className="flex-1 flex min-h-0">
        {/* Chat Column */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Online counter */}
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {onlineCount.toLocaleString()} chatting now
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto chat-scrollbar px-4 lg:px-8 py-4 max-w-2xl mx-auto w-full">
            {connectionState === "idle" && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${myAvatar.gradient} flex items-center justify-center text-white shadow-lg`}>
                  {myAvatar.icon}
                </div>
                <p className="text-foreground font-display font-bold text-lg">Welcome, {myAvatar.label}!</p>
                <p className="text-muted-foreground text-sm text-center max-w-xs">Connect with strangers through text. Anonymous. Safe. No video.</p>
                <button
                  onClick={handleStartMatch}
                  className="mt-4 px-8 py-3 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm
                    shadow-[0_0_24px_hsl(var(--primary)/0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  Start Chatting <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {connectionState === "searching" && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground text-sm">Finding someone{searchDots}</p>
              </div>
            )}

            {connectionState === "connected" && (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex chat-msg-enter ${msg.sender === "me" ? "justify-end" : msg.sender === "them" ? "justify-start" : "justify-center"}`}
                  >
                    {msg.sender === "system" ? (
                      <span className="text-[11px] text-muted-foreground/50 italic bg-muted/30 px-3 py-1 rounded-full">{msg.text}</span>
                    ) : (
                      <div className={`flex items-end gap-2 max-w-[75%] ${msg.sender === "me" ? "flex-row-reverse" : ""}`}>
                        {/* Avatar bubble */}
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs shadow-md bg-gradient-to-br ${
                          msg.sender === "me" ? myAvatar.gradient : (strangerAvatar?.gradient || "from-slate-500 to-slate-700")
                        }`}>
                          {msg.sender === "me" ? myAvatar.icon : strangerAvatar?.icon}
                        </div>
                        {/* Message bubble */}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm break-words ${
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

                {/* Typing indicator */}
                {typing && (
                  <div className="flex items-end gap-2 chat-msg-enter">
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs shadow-md bg-gradient-to-br ${strangerAvatar?.gradient || "from-slate-500 to-slate-700"}`}>
                      {strangerAvatar?.icon}
                    </div>
                    <div className="bg-muted/60 border border-border/30 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Smart Suggestions popup */}
          {showSuggestions && chatEnabled && (
            <div className="px-4 lg:px-8 max-w-2xl mx-auto w-full pb-2">
              <div className="bg-card border border-border/40 rounded-xl p-3 shadow-lg animate-scale-in">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">AI Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SMART_SUGGESTIONS.slice(0, 4).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionPick(s)}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted/50 text-foreground border border-border/30 hover:border-primary/40 hover:bg-primary/10 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input bar */}
          {connectionState === "connected" && (
            <div className="shrink-0 border-t border-border/30 px-4 lg:px-8 py-3">
              <div className="max-w-2xl mx-auto flex items-center gap-2">
                <button
                  onClick={() => setShowSuggestions((o) => !o)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-border/40 hover:border-primary/40 hover:bg-primary/10 transition-all shrink-0"
                  title="Smart suggestions"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </button>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full px-4 py-2.5 text-sm bg-muted/30 text-foreground border border-border/40 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:brightness-110 active:scale-90 transition-all disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom action bar */}
          {connectionState === "connected" && (
            <div className="shrink-0 flex items-center gap-3 px-4 lg:px-8 py-2.5 border-t border-border/30">
              <div className="max-w-2xl mx-auto w-full flex items-center gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-accent-foreground font-display font-bold text-sm
                    hover:brightness-110 active:scale-95 transition-all"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setConnectionState("idle"); setMessages([]); setStrangerAvatar(null); setTyping(false); navigate("/"); }}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-destructive/80 text-destructive-foreground font-display font-bold text-sm
                    hover:brightness-110 active:scale-95 transition-all"
                >
                  <LogOut className="w-4 h-4" /> End
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
