import { useState, useEffect, useCallback } from "react";
import { X, Play, Volume2, VolumeX, Gift } from "lucide-react";

interface FreeMatchAdModalProps {
  open: boolean;
  onClose: () => void;
  onAdComplete: () => void;
}

const AD_DURATION = 10; // seconds

export default function FreeMatchAdModal({ open, onClose, onAdComplete }: FreeMatchAdModalProps) {
  const [phase, setPhase] = useState<"intro" | "playing" | "complete">("intro");
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!open) {
      setPhase("intro");
      setSecondsLeft(AD_DURATION);
      setCanSkip(false);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (secondsLeft <= 0) {
      setPhase("complete");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  // Allow skip after 5 seconds
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setTimeout(() => setCanSkip(true), 5000);
    return () => clearTimeout(t);
  }, [phase]);

  const handleStart = useCallback(() => {
    setPhase("playing");
  }, []);

  const handleSkipOrComplete = useCallback(() => {
    if (phase === "complete" || canSkip) {
      onAdComplete();
    }
  }, [phase, canSkip, onAdComplete]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={phase === "intro" ? onClose : undefined} />
      <div
        className="relative w-full max-w-md rounded-3xl glass-strong border border-primary/30 shadow-[0_0_60px_hsl(var(--primary)/0.2)] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close - only during intro */}
        {phase === "intro" && (
          <button onClick={onClose} className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}

        {phase === "intro" && (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 shadow-[0_0_40px_hsl(var(--primary)/0.4)]">
              <Gift className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">Free Filter Unlock!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Watch a short ad to unlock <span className="text-primary font-semibold">advanced filters</span> for <span className="text-primary font-semibold">1 minute</span>
            </p>
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-2xl font-display font-bold text-sm tracking-tight transition-all duration-300 active:scale-[0.97]
                bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] text-primary-foreground
                shadow-[0_0_24px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.7)] hover:brightness-110"
              style={{ animation: "gradient-shift 3s ease infinite" }}
            >
              <span className="flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                Watch Ad
              </span>
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div className="flex flex-col">
            {/* Simulated ad area */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
              {/* Animated ad placeholder */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/30 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                    style={{ animation: `spin ${AD_DURATION}s linear` }}
                  />
                  <span className="text-3xl font-display font-bold text-primary">{secondsLeft}</span>
                </div>
              </div>

              {/* Ad label */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Ad • {secondsLeft}s remaining
              </div>

              {/* Volume indicator */}
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center">
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              {/* Simulated ad content */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((AD_DURATION - secondsLeft) / AD_DURATION) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom section */}
            <div className="p-5 text-center">
              <p className="text-xs text-muted-foreground mb-3">
                {canSkip ? "You can skip now or wait for bonus!" : `Skip available in ${Math.max(0, 5 - (AD_DURATION - secondsLeft))}s...`}
              </p>
              <button
                onClick={handleSkipOrComplete}
                disabled={!canSkip}
                className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                  ${canSkip
                    ? "bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.4)] hover:brightness-110 active:scale-95"
                    : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                  }`}
              >
                {canSkip ? "Skip Ad →" : "Please wait..."}
              </button>
            </div>
          </div>
        )}

        {phase === "complete" && (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-primary flex items-center justify-center mb-5 shadow-[0_0_40px_hsl(var(--primary)/0.4)] animate-scale-in">
              <Gift className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">🎉 Filters Unlocked!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Advanced filters are now active for <span className="text-primary font-semibold">1 minute</span>
            </p>
            <button
              onClick={handleSkipOrComplete}
              className="w-full py-3.5 rounded-2xl font-display font-bold text-sm tracking-tight transition-all duration-300 active:scale-[0.97]
                bg-gradient-to-r from-primary to-accent text-primary-foreground
                shadow-[0_0_24px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.7)] hover:brightness-110"
            >
              Start Matching →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
