import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Video, ChevronDown, ShoppingBag, Clock, Smartphone, Facebook } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import FloatingCardsBackground from "@/components/FloatingCardsBackground";

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 3000;
          const steps = 120;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="tabular-nums">
      {count.toLocaleString()}
    </div>
  );
}

export default function About() {
  const navigate = useNavigate();
  const [showBrand, setShowBrand] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowBrand(true), 300);
    const t2 = setTimeout(() => setShowCounter(true), 900);
    const t3 = setTimeout(() => setShowLabel(true), 1400);
    const t4 = setTimeout(() => setShowButtons(true), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingCardsBackground />

      {/* ═══ Top Nav ═══ */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-5">
        <button onClick={() => navigate("/")} className="text-2xl font-display font-bold text-primary glow-text tracking-tight hover:opacity-80 transition-opacity">
          Sahara
        </button>
        <div className="flex items-center gap-3 md:gap-5">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Video Chat
          </button>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Messages
          </button>
          <button className="text-sm font-semibold text-foreground hover:text-primary transition-colors hidden md:block">
            About
          </button>

          <div className="hidden md:block w-px h-5 bg-border/30" />

          <button className="hidden md:flex items-center gap-1.5 h-9 px-4 rounded-full border border-border/40 bg-secondary/60 text-sm font-medium text-foreground hover:bg-secondary transition-all duration-200">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            Shop
          </button>
          <button className="hidden md:flex items-center gap-1.5 h-9 px-4 rounded-full border border-border/40 bg-secondary/60 text-sm font-medium text-foreground hover:bg-secondary transition-all duration-200">
            <Clock className="w-4 h-4" />
            History
          </button>

          <div className="hidden md:block w-px h-5 bg-border/30" />
          <button className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </button>

          <ThemeToggle />
        </div>
      </nav>

      {/* ═══ Main Content ═══ */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center">
        {/* Sahara brand */}
        <div
          className={`transition-all duration-1000 ease-out ${
            showBrand ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter sahara-shine cursor-default mb-16">
            sahara
          </h1>
        </div>

        {/* Giant counter */}
        <div
          className={`transition-all duration-1000 ease-out ${
            showCounter ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
          }`}
        >
          <div className="text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] font-extralight tracking-tight leading-none text-foreground/90 font-display">
            <AnimatedCounter target={179541862513} />
          </div>
        </div>

        {/* Label */}
        <div
          className={`transition-all duration-700 ease-out mt-4 md:mt-6 ${
            showLabel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-xl md:text-2xl lg:text-3xl font-display font-medium text-foreground/80 tracking-wide">
            Number of Matches
          </p>
        </div>

        {/* App Store buttons */}
        <div
          className={`flex items-center gap-4 mt-16 transition-all duration-700 ease-out ${
            showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <button className="flex items-center gap-2.5 h-12 px-6 rounded-full border border-border/50 bg-secondary/60 text-sm font-medium text-foreground hover:bg-secondary transition-all duration-200">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
            App Store
          </button>
          <button className="flex items-center gap-2.5 h-12 px-6 rounded-full border border-border/50 bg-secondary/60 text-sm font-medium text-foreground hover:bg-secondary transition-all duration-200">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.96l2.807 1.626a1 1 0 0 1 0 1.254l-2.808 1.626L15.206 12l2.492-2.253zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" /></svg>
            Google Play
          </button>
        </div>
      </div>
    </div>
  );
}
