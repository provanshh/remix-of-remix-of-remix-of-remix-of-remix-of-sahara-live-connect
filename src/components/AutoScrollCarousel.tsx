import { useEffect, useRef, useState } from "react";
import ProfileCard from "./ProfileCard";

interface Profile {
  image: string;
  name: string;
  age?: number;
  flag: string;
}

interface AutoScrollCarouselProps {
  profiles: Profile[];
}

function ScrollColumn({ profiles, direction }: { profiles: Profile[]; direction: "up" | "down" }) {
  const colRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);
  const scrollPos = useRef(0);

  const tripled = [...profiles, ...profiles, ...profiles];

  useEffect(() => {
    const el = colRef.current;
    if (!el || profiles.length === 0) return;

    const singleSetHeight = el.scrollHeight / 3;
    if (direction === "down" && scrollPos.current === 0) {
      scrollPos.current = singleSetHeight * 0.5;
    }

    let lastTime = 0;
    const speed = 0.4;

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      if (!isPaused) {
        const step = speed * (delta / 16.67);
        if (direction === "up") {
          scrollPos.current += step;
          if (scrollPos.current >= singleSetHeight) scrollPos.current -= singleSetHeight;
        } else {
          scrollPos.current -= step;
          if (scrollPos.current <= 0) scrollPos.current += singleSetHeight;
        }
        el.style.transform = `translateY(-${scrollPos.current}px)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPaused, direction, profiles.length]);

  if (profiles.length === 0) return null;

  return (
    <div
      className="flex-1 overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div ref={colRef} className="will-change-transform flex flex-col gap-3">
        {tripled.map((p, i) => (
          <div key={i} className={i % 2 === 0 ? "h-64" : "h-48"}>
            <ProfileCard image={p.image} name={p.name} age={p.age ?? 0} flag={p.flag} className="h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AutoScrollCarousel({ profiles }: AutoScrollCarouselProps) {
  if (profiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-muted-foreground text-sm">Waiting for members to come online...</p>
        </div>
      </div>
    );
  }

  const mid = Math.ceil(profiles.length / 2);
  const leftProfiles = profiles.slice(0, mid);
  const rightProfiles = profiles.slice(mid);

  return (
    <div className="h-full overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      <div className="flex gap-3 px-1 h-full">
        <ScrollColumn profiles={leftProfiles} direction="up" />
        <ScrollColumn profiles={rightProfiles.length > 0 ? rightProfiles : leftProfiles} direction="down" />
      </div>
    </div>
  );
}
