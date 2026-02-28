import { useEffect, useRef, useState } from "react";
import ProfileCard from "./ProfileCard";

interface Profile {
  image: string;
  name: string;
  age: number;
  flag: string;
}

interface AutoScrollCarouselProps {
  profiles: Profile[];
}

export default function AutoScrollCarousel({ profiles }: AutoScrollCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);
  const scrollPos = useRef(0);

  // Triple the profiles for seamless looping
  const extendedProfiles = [...profiles, ...profiles, ...profiles];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Get the height of one set of profiles
    const singleSetHeight = container.scrollHeight / 3;

    let lastTime = 0;
    const speed = 0.4; // pixels per frame at 60fps

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      if (!isPaused) {
        scrollPos.current += speed * (delta / 16.67);

        // Reset seamlessly when we've scrolled past one full set
        if (scrollPos.current >= singleSetHeight) {
          scrollPos.current -= singleSetHeight;
        }

        container.style.transform = `translateY(-${scrollPos.current}px)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [isPaused]);

  return (
    <div
      className="h-full overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Fade edges */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      <div ref={scrollRef} className="will-change-transform">
        <div className="grid grid-cols-2 gap-3 px-1">
          {extendedProfiles.map((p, i) => (
            <div key={i} className={`${i % 3 === 0 ? "row-span-1 h-64" : "h-48"}`}>
              <ProfileCard
                image={p.image}
                name={p.name}
                age={p.age}
                flag={p.flag}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
