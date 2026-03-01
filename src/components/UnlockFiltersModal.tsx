import { useState } from "react";
import { Crown, Lock, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UnlockFiltersModalProps {
  open: boolean;
  onClose: () => void;
  coinBalance: number;
  onUnlock: () => void;
}

const COST = 149;

export default function UnlockFiltersModal({ open, onClose, coinBalance, onUnlock }: UnlockFiltersModalProps) {
  const navigate = useNavigate();
  const [unlocking, setUnlocking] = useState(false);
  const canAfford = coinBalance >= COST;

  if (!open) return null;

  const handleUnlock = async () => {
    if (!canAfford) {
      navigate("/buy-coins");
      return;
    }
    setUnlocking(true);
    await new Promise((r) => setTimeout(r, 800));
    onUnlock();
    setUnlocking(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-3xl glass-strong border border-amber-500/30 shadow-[0_0_60px_hsl(40_90%_50%/0.2)] p-6 text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 shadow-[0_0_40px_hsl(40_90%_50%/0.4)] animate-pulse-slow">
          <Crown className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-lg font-display font-bold text-foreground mb-1">Unlock Advanced Filters</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Get premium match preferences for <span className="text-amber-400 font-bold">24 hours</span>
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6 text-left">
          {["Age range targeting", "Language preference", "Region-specific matching"].map((f) => (
            <div key={f} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs text-foreground">{f}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <span className="text-2xl font-display font-bold text-amber-400">{COST}</span>
          <span className="text-sm text-muted-foreground">Coins / Day</span>
        </div>

        {/* Balance */}
        <p className="text-xs text-muted-foreground mb-4">
          Your balance: <span className={`font-bold ${canAfford ? "text-primary" : "text-destructive"}`}>{coinBalance} coins</span>
        </p>

        {/* CTA */}
        <button
          onClick={handleUnlock}
          disabled={unlocking}
          className={`w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-tight transition-all duration-300 active:scale-[0.96]
            ${canAfford
              ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-[0_0_24px_hsl(40_90%_50%/0.5)] hover:shadow-[0_0_40px_hsl(40_90%_50%/0.7)] hover:brightness-110"
              : "bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.4)] hover:brightness-110"
            } disabled:opacity-60`}
        >
          {unlocking ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Unlocking…
            </span>
          ) : canAfford ? (
            <span className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> Unlock Now
            </span>
          ) : (
            "Get More Coins"
          )}
        </button>
      </div>
    </div>
  );
}
