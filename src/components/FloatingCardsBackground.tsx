import { useEffect, useRef, useState } from "react";

interface FloatingCard {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  blur: number;
  opacity: number;
  hue: number;
  direction: number;
}

export default function FloatingCardsBackground() {
  const [cards] = useState<FloatingCard[]>(() => {
    const result: FloatingCard[] = [];
    for (let i = 0; i < 18; i++) {
      result.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 60 + Math.random() * 50,
        speed: 15 + Math.random() * 25,
        delay: Math.random() * -20,
        blur: i < 6 ? 0 : i < 12 ? 2 : 5,
        opacity: i < 6 ? 0.35 : i < 12 ? 0.2 : 0.1,
        hue: 170 + Math.random() * 30,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
    return result;
  });

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[hsl(var(--primary)/0.05)]" />
      
      {/* Radial glow accents */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-[hsl(var(--primary)/0.04)] blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(var(--glow-secondary)/0.03)] blur-[100px]" />

      {/* Floating cards */}
      {cards.map((card) => (
        <div
          key={card.id}
          className="absolute rounded-2xl"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            width: `${card.size}px`,
            height: `${card.size * 1.35}px`,
            filter: `blur(${card.blur}px)`,
            opacity: card.opacity,
            animation: `float-card-y ${card.speed}s ease-in-out ${card.delay}s infinite, float-card-x ${card.speed * 1.3}s ease-in-out ${card.delay}s infinite`,
          }}
        >
          {/* Card shell */}
          <div className="w-full h-full rounded-2xl overflow-hidden border border-[hsl(var(--primary)/0.15)] bg-gradient-to-b from-[hsl(var(--secondary)/0.8)] to-[hsl(var(--card)/0.6)] shadow-[0_0_20px_hsl(var(--primary)/0.08)]">
            {/* Fake avatar area */}
            <div
              className="w-full h-[65%] rounded-t-2xl"
              style={{
                background: `linear-gradient(135deg, hsl(${card.hue} 40% 25%), hsl(${card.hue + 20} 30% 18%))`,
              }}
            />
            {/* Fake text lines */}
            <div className="p-2 space-y-1.5">
              <div className="h-2 w-3/4 rounded-full bg-[hsl(var(--foreground)/0.12)]" />
              <div className="h-1.5 w-1/2 rounded-full bg-[hsl(var(--foreground)/0.07)]" />
            </div>
            {/* Subtle glow dot */}
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[hsl(var(--primary)/0.4)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
