import { Lock, Coins, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface Props {
  chat: { partner_username: string; partner_avatar_url: string | null };
  coinBalance: number;
  onUnlock: () => void;
  onBuyCoins: () => void;
  onClose: () => void;
}

export default function UnlockModal({ chat, coinBalance, onUnlock, onBuyCoins, onClose }: Props) {
  const [unlocking, setUnlocking] = useState(false);
  const canAfford = coinBalance >= 49;

  const handleUnlock = async () => {
    setUnlocking(true);
    await onUnlock();
    setUnlocking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative glass-strong rounded-3xl p-8 max-w-sm w-full text-center space-y-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Unlock this chat</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Reconnect with this person for <span className="text-amber-400 font-semibold">49 Coins</span>. 
            They'll need to approve your request.
          </p>
        </div>

        {/* Balance */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-muted-foreground">Your balance:</span>
          <span className={`font-bold ${canAfford ? "text-foreground" : "text-destructive"}`}>
            {coinBalance.toLocaleString()}
          </span>
        </div>

        {canAfford ? (
          <button
            onClick={handleUnlock}
            disabled={unlocking}
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {unlocking ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Unlock for 49 Coins
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-destructive font-medium">Not enough coins</p>
            <button
              onClick={onBuyCoins}
              className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Coins className="w-4 h-4" />
              Buy Coins
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
