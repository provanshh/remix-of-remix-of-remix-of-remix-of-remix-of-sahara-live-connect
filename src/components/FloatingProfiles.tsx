import { useEffect, useRef, useState } from "react";

interface FloatingProfile {
  id: number;
  image: string;
  name: string;
  age: number;
  flag: string;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  layer: "back" | "mid" | "front";
  delay: number;
}

interface FloatingProfilesProps {
  profiles: { image: string; name: string; age: number; flag: string }[];
  scrollY: number;
}

export default function FloatingProfiles({ profiles, scrollY }: FloatingProfilesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [floaters, setFloaters] = useState<FloatingProfile[]>([]);
  const floatersRef = useRef<FloatingProfile[]>([]);

  useEffect(() => {
    const layers: ("back" | "mid" | "front")[] = ["back", "mid", "front", "back", "mid", "front", "mid", "back", "front", "mid", "back", "front"];
    const duplicated = [...profiles, ...profiles].slice(0, 12);

    const initial: FloatingProfile[] = duplicated.map((p, i) => {
      const layer = layers[i % layers.length];
      const size = layer === "front" ? 110 + Math.random() * 30 : layer === "mid" ? 80 + Math.random() * 25 : 55 + Math.random() * 20;
      return {
        id: i,
        ...p,
        x: 5 + Math.random() * 85,
        y: 5 + Math.random() * 85,
        size,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.25,
        rotation: (Math.random() - 0.5) * 6,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        layer,
        delay: i * 0.15,
      };
    });

    floatersRef.current = initial;
    setFloaters(initial);

    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = Math.min((now - lastTime) / 16, 3);
      lastTime = now;

      floatersRef.current = floatersRef.current.map((f) => {
        let nx = f.x + f.speedX * delta;
        let ny = f.y + f.speedY * delta;
        let nsx = f.speedX;
        let nsy = f.speedY;

        if (nx < -5) { nx = -5; nsx = Math.abs(nsx) * (0.8 + Math.random() * 0.4); }
        if (nx > 95) { nx = 95; nsx = -Math.abs(nsx) * (0.8 + Math.random() * 0.4); }
        if (ny < -5) { ny = -5; nsy = Math.abs(nsy) * (0.8 + Math.random() * 0.4); }
        if (ny > 95) { ny = 95; nsy = -Math.abs(nsy) * (0.8 + Math.random() * 0.4); }

        const nr = f.rotation + f.rotationSpeed * delta;
        const clampedR = Math.max(-3, Math.min(3, nr));

        return { ...f, x: nx, y: ny, speedX: nsx, speedY: nsy, rotation: clampedR };
      });

      setFloaters([...floatersRef.current]);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [profiles]);

  const layerConfig = {
    back: { zIndex: 1, blur: "blur(2px)", opacity: 0.5, parallax: 0.02 },
    mid: { zIndex: 5, blur: "blur(0.5px)", opacity: 0.75, parallax: 0.05 },
    front: { zIndex: 10, blur: "blur(0px)", opacity: 1, parallax: 0.1 },
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {floaters.map((f) => {
        const config = layerConfig[f.layer];
        const parallaxOffset = scrollY * config.parallax;

        return (
          <div
            key={f.id}
            className="absolute floating-profile-enter"
            style={{
              left: `${f.x}%`,
              top: `${f.y - parallaxOffset}%`,
              width: f.size,
              height: f.size,
              zIndex: config.zIndex,
              opacity: config.opacity,
              filter: config.blur,
              transform: `rotate(${f.rotation}deg)`,
              animationDelay: `${f.delay}s`,
              willChange: "transform, left, top",
            }}
          >
            <div className="relative w-full h-full">
              {/* Glowing border */}
              <div
                className="absolute -inset-[3px] rounded-full"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--primary) / 0.6), hsl(var(--glow-secondary) / 0.6))`,
                  filter: `blur(${f.layer === "front" ? 4 : 2}px)`,
                }}
              />
              <img
                src={f.image}
                alt={f.name}
                className="relative w-full h-full rounded-full object-cover border-2 border-background/30"
                style={{ boxShadow: `0 8px 32px hsl(var(--primary) / ${f.layer === "front" ? 0.3 : 0.15})` }}
              />
              {/* Name label — only on front layer */}
              {f.layer === "front" && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap
                  bg-background/70 backdrop-blur-md rounded-full px-2.5 py-0.5
                  border border-primary/20 shadow-lg">
                  <span className="text-[10px] font-semibold text-foreground">
                    {f.flag} {f.name}, {f.age}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
