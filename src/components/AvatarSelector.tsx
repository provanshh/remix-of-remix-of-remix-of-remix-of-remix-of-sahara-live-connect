import { useState, useEffect, useRef } from "react";
import { Flame, Gamepad2, Headphones, BookOpen, Moon, Rainbow, Zap } from "lucide-react";

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

// Floating particle for the animated background
function Particle({ delay, size, x, duration }: { delay: number; size: number; x: number; duration: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: -size,
        background: `radial-gradient(circle, hsl(var(--primary) / 0.4), transparent)`,
        animation: `float-particle ${duration}s ${delay}s linear infinite`,
      }}
    />
  );
}

export default function AvatarSelector({ onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let offset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = 60;
      const speed = 0.3;
      offset = (offset + speed) % spacing;

      ctx.strokeStyle = "hsla(180, 80%, 50%, 0.04)";
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = offset; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      // Horizontal lines
      for (let y = offset; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Pulsing glow dots at intersections
      const time = Date.now() * 0.001;
      ctx.fillStyle = "hsla(180, 80%, 50%, 0.08)";
      for (let x = offset; x < canvas.width; x += spacing * 3) {
        for (let y = offset; y < canvas.height; y += spacing * 3) {
          const pulse = Math.sin(time + x * 0.01 + y * 0.01) * 0.5 + 0.5;
          const r = 2 + pulse * 2;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    delay: Math.random() * 8,
    size: 4 + Math.random() * 8,
    x: Math.random() * 100,
    duration: 6 + Math.random() * 8,
  }));

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Animated grid canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[150px]" />
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 -translate-x-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-xl w-full text-center">
        {/* Title with gaming flair */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/70">Select your character</span>
          <Zap className="w-5 h-5 text-primary animate-pulse" />
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-2 sahara-shine">
          Choose Your Avatar
        </h2>
        <p className="text-muted-foreground text-sm mb-10">Pick a personality. Stay anonymous. Chat freely.</p>

        {/* Avatar grid */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {AVATAR_OPTIONS.map((av) => {
            const isSelected = selected === av.id;
            const isHovered = hoveredId === av.id;

            return (
              <button
                key={av.id}
                onClick={() => setSelected(av.id)}
                onMouseEnter={() => setHoveredId(av.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300
                  ${isSelected
                    ? "border-primary bg-primary/10 shadow-[0_0_30px_hsl(var(--primary)/0.35),inset_0_0_20px_hsl(var(--primary)/0.05)]"
                    : "border-border/30 bg-card/60 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80"
                  }
                  hover:scale-[1.06] active:scale-[0.97]
                `}
              >
                {/* Glow ring behind avatar */}
                <div className={`relative transition-all duration-500 ${isSelected || isHovered ? "scale-110" : ""}`}>
                  {/* Outer glow ring */}
                  <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-500 bg-gradient-to-br ${av.gradient} ${isSelected ? "opacity-50 scale-150" : isHovered ? "opacity-30 scale-125" : "opacity-0"}`} />
                  {/* Avatar circle */}
                  <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${av.gradient} flex items-center justify-center text-white shadow-lg ring-2 ring-transparent ${isSelected ? "ring-primary/50" : ""} transition-all duration-300`}>
                    <div className="scale-[1.1]">{av.icon}</div>
                  </div>
                </div>

                <span className="text-xs font-bold text-foreground tracking-wide">{av.label}</span>
                <span className="text-[10px] text-muted-foreground italic">{av.subtitle}</span>

                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_hsl(var(--primary)/0.5)] animate-scale-in">
                    <span className="text-primary-foreground text-[11px] font-bold">✓</span>
                  </div>
                )}

                {/* Corner accent lines */}
                <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-xl transition-colors duration-300 ${isSelected ? "border-primary" : "border-transparent group-hover:border-primary/40"}`} />
                <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-xl transition-colors duration-300 ${isSelected ? "border-primary" : "border-transparent group-hover:border-primary/40"}`} />
              </button>
            );
          })}
        </div>

        {/* Enter button */}
        <button
          onClick={() => {
            const av = AVATAR_OPTIONS.find((a) => a.id === selected);
            if (av) onSelect(av);
          }}
          disabled={!selected}
          className="relative px-12 py-3.5 rounded-full font-display font-bold text-sm tracking-wide
            bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]
            text-primary-foreground
            hover:brightness-110 active:scale-95 transition-all duration-300
            disabled:opacity-20 disabled:pointer-events-none
            shadow-[0_0_30px_hsl(var(--primary)/0.4),0_0_60px_hsl(var(--primary)/0.15)]
            hover:shadow-[0_0_40px_hsl(var(--primary)/0.6),0_0_80px_hsl(var(--primary)/0.25)]"
          style={{ animation: selected ? "gradient-shift 3s ease infinite" : undefined }}
        >
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Enter Chat
          </span>
        </button>
      </div>
    </div>
  );
}
