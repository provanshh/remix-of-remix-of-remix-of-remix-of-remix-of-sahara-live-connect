import { useState } from "react";
import { X, Lock, ChevronRight, Globe, Languages, MapPin, Users } from "lucide-react";

const REGIONS = [
  "North Africa", "Middle East", "Southeast Asia", "Europe",
  "South America", "East Asia", "North America", "Oceania"
];

interface FilterBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onUnlockRequest: () => void;
  unlocked: boolean;
}

export default function FilterBottomSheet({ open, onClose, onUnlockRequest, unlocked }: FilterBottomSheetProps) {
  const [ageRange] = useState([18, 35]);

  if (!open) return null;

  const handleFilterTap = () => {
    if (!unlocked) onUnlockRequest();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Bottom Sheet */}
      <div
        className="relative w-full max-w-lg rounded-t-3xl glass-strong border-t border-x border-primary/20 shadow-[0_-10px_60px_hsl(var(--primary)/0.15)] animate-slide-up pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-display font-bold text-foreground">Match Preferences</span>
            {!unlocked && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">Premium</span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Filter Options — locked overlay */}
        <div className="px-6 space-y-4 relative">
          {!unlocked && (
            <div className="absolute inset-0 z-10 cursor-pointer" onClick={handleFilterTap} />
          )}

          {/* Age Range */}
          <div className={`relative ${!unlocked ? "opacity-60 blur-[1.5px]" : ""} transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Age Range</span>
              <span className="text-xs text-muted-foreground ml-auto">{ageRange[0]}–{ageRange[1]}+</span>
            </div>
            <div className="relative h-2 rounded-full bg-muted">
              <div
                className="absolute h-full rounded-full bg-gradient-to-r from-primary to-accent"
                style={{ left: "0%", right: "0%" }}
              />
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-4 h-4 rounded-full bg-primary border-2 border-primary-foreground shadow-lg" />
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-4 rounded-full bg-primary border-2 border-primary-foreground shadow-lg" />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">18</span>
              <span className="text-[10px] text-muted-foreground">35+</span>
            </div>
          </div>

          {/* Language */}
          <div className={`relative ${!unlocked ? "opacity-60 blur-[1.5px]" : ""} transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Language</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/40 border border-border/30">
              <span className="text-sm text-muted-foreground">Language</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-sm">Unlimited</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Region */}
          <div className={`relative ${!unlocked ? "opacity-60 blur-[1.5px]" : ""} transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Region</span>
            </div>
            <div className="max-h-36 overflow-y-auto chat-scrollbar space-y-1.5">
              {REGIONS.map((region) => (
                <div key={region} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/40 border border-border/30">
                  <span className="text-sm text-foreground">{region}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="text-xs">Default</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lock Overlay Icon */}
          {!unlocked && (
            <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_hsl(40_90%_50%/0.3)]">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
