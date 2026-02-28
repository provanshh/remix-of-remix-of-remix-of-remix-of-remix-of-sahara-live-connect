import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Video, ChevronDown, ShoppingBag, Clock, Smartphone, Facebook } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import FloatingProfiles from "@/components/FloatingProfiles";
import StatsCounter from "@/components/StatsCounter";

import profile1 from "@/assets/profile-1.jpg";
import profile2 from "@/assets/profile-2.jpg";
import profile3 from "@/assets/profile-3.jpg";
import profile4 from "@/assets/profile-4.jpg";
import profile5 from "@/assets/profile-5.jpg";
import profile6 from "@/assets/profile-6.jpg";

const PROFILES = [
  { image: profile1, name: "Jisu", age: 23, flag: "🇰🇷" },
  { image: profile3, name: "Mei", age: 21, flag: "🇻🇳" },
  { image: profile2, name: "Joshua", age: 25, flag: "🇺🇸" },
  { image: profile4, name: "Amelia", age: 22, flag: "🇬🇧" },
  { image: profile5, name: "David", age: 24, flag: "🇩🇪" },
  { image: profile6, name: "Arjun", age: 20, flag: "🇮🇳" },
];

const GENDERS = ["Male", "Female"] as const;
const COUNTRIES = [
  { code: "XX", name: "Any", flag: "🌍" },
  { code: "US", name: "USA", flag: "🇺🇸" },
  { code: "GB", name: "UK", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "Korea", flag: "🇰🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [gender, setGender] = useState<string>("Male");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [genderOpen, setGenderOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(179545);
  const [scrollY, setScrollY] = useState(0);
  const genderRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (genderRef.current && !genderRef.current.contains(e.target as Node)) setGenderOpen(false);
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((c) => c + Math.floor(Math.random() * 21) - 10);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)",
            top: "-20%",
            left: "-10%",
            transform: `translateY(${scrollY * 0.03}px)`,
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, hsl(var(--glow-secondary) / 0.4), transparent 70%)",
            bottom: "-15%",
            right: "-5%",
            transform: `translateY(${scrollY * -0.05}px)`,
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, hsl(330 70% 50% / 0.3), transparent 70%)",
            top: "40%",
            right: "20%",
            transform: `translateY(${scrollY * 0.04}px)`,
          }}
        />
      </div>

      {/* Floating profile photos */}
      <FloatingProfiles profiles={PROFILES} scrollY={scrollY} />

      {/* ═══ Top Nav ═══ */}
      <nav className="relative z-30 flex items-center justify-between px-6 lg:px-10 py-5">
        <span className="text-2xl font-display font-bold text-primary glow-text tracking-tight">
          Sahara
        </span>
        <div className="flex items-center gap-3 md:gap-5">
          <a href="#" className="text-sm font-semibold text-foreground hover:text-primary transition-colors hidden md:block">
            Video Chat
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Messages
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            About
          </a>

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

          <div className="hidden lg:flex items-center gap-2">
            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Smartphone className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
            </a>
          </div>

          <div className="hidden md:block w-px h-5 bg-border/30" />
          <button className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </button>

          <ThemeToggle />
        </div>
      </nav>

      {/* ═══ Hero Content (centered, glassmorphism card) ═══ */}
      <div className="relative z-20 flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="text-center max-w-2xl mx-auto">
          {/* Glassmorphism card */}
          <div className="glass-strong rounded-3xl px-8 md:px-14 py-12 md:py-16 shadow-2xl">
            {/* Brand */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter select-none leading-none mb-6 sahara-shine cursor-default">
              sahara
            </h1>

            {/* Tagline */}
            <p className="text-lg md:text-xl text-muted-foreground font-light mb-8">
              Real Conversations. Real People.
            </p>

            {/* Online counter */}
            <div className="flex items-center justify-center gap-2.5 mb-10">
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(142_70%_45%)] animate-pulse" />
              <span className="text-base font-medium text-foreground">
                {onlineCount.toLocaleString()} are matching now!
              </span>
            </div>

            {/* Stats */}
            <div className="mb-10">
              <StatsCounter />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Gender */}
              <div className="relative" ref={genderRef}>
                <button
                  onClick={() => setGenderOpen((o) => !o)}
                  className="h-12 px-5 rounded-full bg-secondary text-foreground flex items-center gap-2.5 hover:bg-secondary/80 transition-all duration-200"
                >
                  <span className="text-lg">{gender === "Male" ? "👦" : "👧"}</span>
                  <span className="text-sm font-medium">Gender</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${genderOpen ? "rotate-180" : ""}`} />
                </button>
                {genderOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-36 rounded-xl bg-card border border-border shadow-xl z-50 py-1 animate-fade-in">
                    {GENDERS.map((g) => (
                      <button key={g} onClick={() => { setGender(g); setGenderOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${g === gender ? "text-primary" : "text-foreground"}`}>
                        <span>{g === "Male" ? "👦" : "👧"}</span>
                        <span className="font-medium">{g}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Country */}
              <div className="relative" ref={countryRef}>
                <button
                  onClick={() => setCountryOpen((o) => !o)}
                  className="h-12 px-5 rounded-full bg-secondary text-foreground flex items-center gap-2.5 hover:bg-secondary/80 transition-all duration-200"
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm font-medium">Country</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${countryOpen ? "rotate-180" : ""}`} />
                </button>
                {countryOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-44 max-h-56 overflow-y-auto rounded-xl bg-card border border-border shadow-xl z-50 py-1 animate-fade-in">
                    {COUNTRIES.map((c) => (
                      <button key={c.code} onClick={() => { setCountry(c); setCountryOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${c.code === country.code ? "text-primary" : "text-foreground"}`}>
                        <span className="text-base">{c.flag}</span>
                        <span className="font-medium">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate("/live")}
                className="h-12 px-8 rounded-full bg-primary text-primary-foreground flex items-center gap-2.5
                  font-display font-bold text-sm tracking-tight
                  shadow-[0_4px_20px_hsl(var(--primary)/0.4),0_0_40px_hsl(var(--primary)/0.15)]
                  hover:scale-105 hover:shadow-[0_6px_30px_hsl(var(--primary)/0.5),0_0_60px_hsl(var(--primary)/0.2)]
                  active:scale-[0.98] transition-all duration-300"
              >
                <Video className="w-5 h-5" />
                Start Video Chat
              </button>
            </div>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs text-muted-foreground/40 tracking-widest uppercase">
            Encrypted · Anonymous · Instant
          </p>
        </div>
      </div>
    </div>
  );
}
