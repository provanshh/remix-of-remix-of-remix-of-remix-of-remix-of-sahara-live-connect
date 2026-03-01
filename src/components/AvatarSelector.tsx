import { useState } from "react";
import { Flame, Gamepad2, Headphones, BookOpen, Moon, Rainbow } from "lucide-react";

export type AvatarOption = {
  id: string;
  emoji: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "explorer", emoji: "🔥", label: "The Explorer", subtitle: "Adventure awaits", icon: <Flame className="w-5 h-5" />, gradient: "from-orange-500 to-red-500" },
  { id: "gamer", emoji: "🎮", label: "The Gamer", subtitle: "Player ready", icon: <Gamepad2 className="w-5 h-5" />, gradient: "from-violet-500 to-purple-600" },
  { id: "music", emoji: "🎧", label: "The Music Lover", subtitle: "Feel the beat", icon: <Headphones className="w-5 h-5" />, gradient: "from-cyan-500 to-blue-500" },
  { id: "thinker", emoji: "📚", label: "The Thinker", subtitle: "Deep thoughts", icon: <BookOpen className="w-5 h-5" />, gradient: "from-emerald-500 to-teal-500" },
  { id: "mystery", emoji: "🌙", label: "The Mystery", subtitle: "Enigmatic soul", icon: <Moon className="w-5 h-5" />, gradient: "from-slate-600 to-zinc-800" },
  { id: "vibe", emoji: "🌈", label: "The Vibe Creator", subtitle: "Radiant energy", icon: <Rainbow className="w-5 h-5" />, gradient: "from-pink-500 to-yellow-400" },
];

interface Props {
  onSelect: (avatar: AvatarOption) => void;
}

export default function AvatarSelector({ onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6">
      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">Choose Your Avatar</h2>
        <p className="text-muted-foreground text-sm mb-8">Pick a personality. Stay anonymous. Chat freely.</p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {AVATAR_OPTIONS.map((av) => (
            <button
              key={av.id}
              onClick={() => setSelected(av.id)}
              className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 hover:scale-105 active:scale-95
                ${selected === av.id
                  ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                  : "border-border/40 bg-card hover:border-primary/40"
                }`}
            >
              {/* Avatar circle */}
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${av.gradient} flex items-center justify-center text-white shadow-lg`}>
                {av.icon}
              </div>
              <span className="text-xs font-semibold text-foreground">{av.label}</span>
              <span className="text-[10px] text-muted-foreground">{av.subtitle}</span>

              {/* Selected ring */}
              {selected === av.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-[10px] font-bold">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            const av = AVATAR_OPTIONS.find((a) => a.id === selected);
            if (av) onSelect(av);
          }}
          disabled={!selected}
          className="px-10 py-3 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm
            hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none
            shadow-[0_0_24px_hsl(var(--primary)/0.4)]"
        >
          Enter Chat
        </button>
      </div>
    </div>
  );
}
