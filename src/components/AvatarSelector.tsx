import { useState, useEffect, useRef } from "react";
import { Flame, Gamepad2, Headphones, BookOpen, Moon, Rainbow, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

// Fire ember particle
function Ember({ delay, size, x, duration, color }: { delay: number; size: number; x: number; duration: number; color: string }) {
  const drift = (Math.random() - 0.5) * 40;
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: -size * 2,
        background: `radial-gradient(circle, ${color}, transparent)`,
        boxShadow: `0 0 ${size * 2}px ${color}`,
        animation: `ember-rise ${duration}s ${delay}s ease-out infinite`,
        ["--drift" as string]: `${drift}px`,
      }}
    />
  );
}

export default function AvatarSelector({ onSelect }: Props) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated fire/lava background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const fireParticles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number }[] = [];

    const spawnParticle = () => {
      fireParticles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(1.5 + Math.random() * 3),
        life: 0,
        maxLife: 80 + Math.random() * 120,
        size: 3 + Math.random() * 6,
        hue: 10 + Math.random() * 30, // orange to red
      });
    };

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn new particles
      for (let i = 0; i < 3; i++) spawnParticle();

      // Update & draw
      for (let i = fireParticles.length - 1; i >= 0; i--) {
        const p = fireParticles[i];
        p.x += p.vx + Math.sin(p.life * 0.05) * 0.5;
        p.y += p.vy;
        p.vy *= 0.995;
        p.life++;

        const progress = p.life / p.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : Math.max(0, 1 - progress);
        const size = p.size * (1 - progress * 0.5);

        // Shift hue from yellow-orange to deep red as it rises
        const hue = p.hue - progress * 15;
        const lightness = 55 - progress * 30;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
        gradient.addColorStop(0, `hsla(${hue}, 100%, ${lightness}%, ${alpha * 0.6})`);
        gradient.addColorStop(0.5, `hsla(${hue - 10}, 90%, ${lightness - 15}%, ${alpha * 0.3})`);
        gradient.addColorStop(1, `hsla(${hue - 20}, 80%, ${lightness - 25}%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        if (p.life >= p.maxLife) fireParticles.splice(i, 1);
      }

      // Bottom fire glow
      const bottomGlow = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 200);
      bottomGlow.addColorStop(0, "hsla(15, 100%, 50%, 0.08)");
      bottomGlow.addColorStop(0.5, "hsla(25, 90%, 40%, 0.03)");
      bottomGlow.addColorStop(1, "transparent");
      ctx.fillStyle = bottomGlow;
      ctx.fillRect(0, canvas.height - 200, canvas.width, 200);

      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // CSS ember particles
  const embers = Array.from({ length: 30 }, (_, i) => ({
    delay: Math.random() * 6,
    size: 3 + Math.random() * 6,
    x: Math.random() * 100,
    duration: 4 + Math.random() * 6,
    color: [`hsla(20,100%,55%,0.7)`, `hsla(35,100%,60%,0.6)`, `hsla(10,100%,45%,0.5)`, `hsla(45,100%,65%,0.5)`][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Animated grid canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Fire embers */}
      {embers.map((p, i) => (
        <Ember key={i} {...p} />
      ))}

      {/* Fiery radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 w-[700px] h-[400px] rounded-full blur-[150px]" style={{ background: "hsla(20, 100%, 45%, 0.12)" }} />
        <div className="absolute bottom-0 right-1/4 translate-y-1/3 w-[400px] h-[300px] rounded-full blur-[120px]" style={{ background: "hsla(35, 100%, 50%, 0.08)" }} />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: "hsla(10, 90%, 40%, 0.06)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-xl w-full text-center">
        {/* Back button - positioned top-left of page */}
        <button
          onClick={() => navigate("/")}
          className="fixed top-5 left-5 z-20 flex items-center gap-1.5 text-sm font-medium text-primary
            bg-primary/15 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2
            shadow-[0_0_12px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)]
            hover:bg-primary/25 active:scale-95 transition-all duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

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
