import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import { Lock, Unlock, Clock, Coins, ArrowLeft } from "lucide-react";
import UnlockModal from "@/components/UnlockModal";
import saharaLogo from "@/assets/sahara-logo.png";

interface ChatEntry {
  id: string;
  partner_username: string;
  partner_avatar_url: string | null;
  chat_date: string;
  duration_seconds: number;
  is_unlocked: boolean;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function History() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<ChatEntry | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [historyRes, walletRes] = await Promise.all([
        supabase.from("chat_history").select("*").eq("user_id", user.id).order("chat_date", { ascending: false }),
        supabase.from("coin_wallets").select("balance").eq("user_id", user.id).single(),
      ]);
      if (historyRes.data) setHistory(historyRes.data as ChatEntry[]);
      if (walletRes.data) setCoinBalance((walletRes.data as any).balance);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleUnlock = async (chatId: string) => {
    const { data, error } = await supabase.rpc("unlock_chat", { p_chat_id: chatId });
    if (error) {
      toast.error("Failed to unlock chat");
      return;
    }
    const result = data as any;
    if (result.success) {
      toast.success("Chat unlocked! Reconnect request sent.");
      setCoinBalance(result.new_balance);
      setHistory((prev) => prev.map((c) => (c.id === chatId ? { ...c, is_unlocked: true } : c)));
      setSelectedChat(null);
    } else if (result.error === "insufficient_coins") {
      setSelectedChat(null);
      navigate("/coins");
    } else {
      toast.error("Could not unlock this chat");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
            <img src={saharaLogo} alt="Sahara" className="h-9 w-auto" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-border/40 bg-secondary/60 text-sm font-semibold text-foreground">
            <Coins className="w-4 h-4 text-amber-400" />
            {coinBalance.toLocaleString()}
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Header */}
      <div className="px-6 lg:px-10 mt-4 mb-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Reconnect History</h1>
        <p className="text-muted-foreground mt-1">People you've chatted with before</p>
      </div>

      {/* List */}
      <div className="px-6 lg:px-10 max-w-3xl">
        {history.length === 0 ? (
          <div className="glass-strong rounded-2xl p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No chat history yet</h3>
            <p className="text-sm text-muted-foreground">Start video chatting to see your connections here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((chat) => (
              <button
                key={chat.id}
                onClick={() => !chat.is_unlocked && setSelectedChat(chat)}
                className="w-full flex items-center gap-4 glass rounded-2xl p-4 hover:bg-secondary/40 transition-all duration-200 group text-left"
              >
                {/* Avatar */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-secondary">
                  {chat.partner_avatar_url ? (
                    <img
                      src={chat.partner_avatar_url}
                      alt=""
                      className={`w-full h-full object-cover ${!chat.is_unlocked ? "blur-sm scale-110" : ""} transition-all`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-lg">
                      {chat.partner_username[0]?.toUpperCase()}
                    </div>
                  )}
                  {!chat.is_unlocked && (
                    <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-foreground/70" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${chat.is_unlocked ? "text-foreground" : "text-foreground/60"}`}>
                      {chat.is_unlocked ? chat.partner_username : "••••••••"}
                    </span>
                    {chat.is_unlocked && <Unlock className="w-3 h-3 text-primary" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{new Date(chat.chat_date).toLocaleDateString()}</span>
                    <span>{new Date(chat.chat_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(chat.duration_seconds)}
                    </span>
                  </div>
                </div>

                {/* Action */}
                {!chat.is_unlocked && (
                  <div className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary group-hover:text-primary/80">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    49
                  </div>
                )}
                {chat.is_unlocked && (
                  <span className="text-xs text-primary font-medium">Reconnect sent</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Unlock Modal */}
      {selectedChat && (
        <UnlockModal
          chat={selectedChat}
          coinBalance={coinBalance}
          onUnlock={() => handleUnlock(selectedChat.id)}
          onBuyCoins={() => { setSelectedChat(null); navigate("/coins"); }}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
}
