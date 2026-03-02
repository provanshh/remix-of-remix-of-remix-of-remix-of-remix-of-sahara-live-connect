import { useEffect, useState } from "react";

const SHAPES = [
  { borderRadius: "50%", rotate: 0 },
  { borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", rotate: 45 },
  { borderRadius: "50% 20% 50% 20%", rotate: 90 },
  { borderRadius: "20% 60% 40% 80% / 70% 30% 60% 40%", rotate: 135 },
  { borderRadius: "40% 60% 30% 70% / 50% 60% 40% 50%", rotate: 180 },
  { borderRadius: "60% 40% 60% 40% / 30% 70% 30% 70%", rotate: 225 },
];

export default function MorphingShapes() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % SHAPES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const shape = SHAPES[index];

  return (
    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
      {/* Soft outer glow */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: shape.borderRadius,
          background: "hsl(var(--primary) / 0.15)",
          filter: "blur(20px)",
          transform: `rotate(${shape.rotate}deg) scale(1.6)`,
          transition: "all 1.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* Main morphing shape */}
      <div
        className="relative w-full h-full"
        style={{
          borderRadius: shape.borderRadius,
          background: `linear-gradient(${135 + shape.rotate}deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))`,
          transform: `rotate(${shape.rotate}deg)`,
          transition: "all 1.6s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 0 40px hsl(var(--primary) / 0.25)",
        }}
      >
        {/* Animated inner icon — morphs between symbols */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `rotate(${-shape.rotate}deg)`,
            transition: "transform 1.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <MorphIcon phase={index} />
        </div>
      </div>
    </div>
  );
}

function MorphIcon({ phase }: { phase: number }) {
  const icons = [
    // People silhouette
    <svg key="people" viewBox="0 0 24 24" className="w-8 h-8" fill="hsl(var(--primary-foreground))">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>,
    // Globe
    <svg key="globe" viewBox="0 0 24 24" className="w-8 h-8" fill="hsl(var(--primary-foreground))">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>,
    // Chat bubble
    <svg key="chat" viewBox="0 0 24 24" className="w-8 h-8" fill="hsl(var(--primary-foreground))">
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
    </svg>,
    // Heart
    <svg key="heart" viewBox="0 0 24 24" className="w-8 h-8" fill="hsl(var(--primary-foreground))">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>,
    // Sparkle / star
    <svg key="star" viewBox="0 0 24 24" className="w-8 h-8" fill="hsl(var(--primary-foreground))">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>,
    // Video cam
    <svg key="video" viewBox="0 0 24 24" className="w-8 h-8" fill="hsl(var(--primary-foreground))">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
    </svg>,
  ];

  return (
    <div className="relative w-8 h-8">
      {icons.map((icon, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center transition-all duration-700"
          style={{
            opacity: i === phase ? 1 : 0,
            transform: i === phase ? "scale(1)" : "scale(0.5)",
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
}
