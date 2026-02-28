import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface MatchRevealOverlayProps {
  visible: boolean;
  country: { name: string; flag: string };
  gender: "boy" | "girl" | null;
  avatarUrl?: string;
  onRevealComplete: () => void;
}

export default function MatchRevealOverlay({
  visible,
  country,
  gender,
  avatarUrl,
  onRevealComplete,
}: MatchRevealOverlayProps) {
  const [phase, setPhase] = useState<"enter" | "exit" | "hidden">("hidden");

  useEffect(() => {
    if (visible) {
      setPhase("enter");
      const exitTimer = setTimeout(() => setPhase("exit"), 1800);
      const doneTimer = setTimeout(() => {
        setPhase("hidden");
        onRevealComplete();
      }, 2400);
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(doneTimer);
      };
    } else {
      setPhase("hidden");
    }
  }, [visible, onRevealComplete]);

  if (phase === "hidden") return null;

  const label =
    gender === "boy"
      ? `He is from ${country.name} ${country.flag}`
      : gender === "girl"
      ? `She is from ${country.name} ${country.flag}`
      : `Your match is from ${country.name} ${country.flag}`;

  return (
    <div
      className={`absolute inset-0 z-40 flex items-center justify-center transition-opacity duration-600 ${
        phase === "enter" ? "opacity-100" : "opacity-0"
      }`}
      style={{ backdropFilter: "blur(16px)" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/80" />

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col items-center gap-5 transition-all duration-700 ease-out ${
          phase === "enter"
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Avatar ring */}
        <div className="relative">
          {/* Animated glow ring */}
          <div className="absolute -inset-2 rounded-full animate-pulse-ring border-2 border-primary/40" />
          <div className="absolute -inset-1 rounded-full border border-primary/20 animate-glow-pulse" />

          <Avatar className="w-24 h-24 border-2 border-primary/50 shadow-[0_0_30px_hsl(var(--glow-primary)/0.3)]">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Match avatar" />
            ) : null}
            <AvatarFallback className="bg-secondary text-muted-foreground">
              <User className="w-10 h-10" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Country text */}
        <div
          className={`text-center transition-all duration-700 delay-300 ease-out ${
            phase === "enter"
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-2"
          }`}
        >
          <p className="font-display font-bold text-xl md:text-2xl text-foreground tracking-tight glow-text">
            {label}
          </p>
          <p className="text-muted-foreground text-xs mt-2 tracking-wide uppercase">
            Connecting now…
          </p>
        </div>
      </div>
    </div>
  );
}
