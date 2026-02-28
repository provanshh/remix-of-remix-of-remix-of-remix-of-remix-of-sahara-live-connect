import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Video, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleBackground from "@/components/ParticleBackground";
import ProfileCard from "@/components/ProfileCard";
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
  const genderRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (genderRef.current && !genderRef.current.contains(e.target as Node)) setGenderOpen(false);
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Simulate fluctuating online count
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((c) => c + Math.floor(Math.random() * 21) - 10);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />

      {/* ═══ Top Nav ═══ */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-5">
        <span className="text-2xl font-display font-bold text-primary glow-text tracking-tight">
          Sahara
        </span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm font-semibold text-foreground hover:text-primary transition-colors hidden md:block">
            Video Chat
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Messages
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            About
          </a>
          <ThemeToggle />
        </div>
      </nav>

      {/* ═══ Main Content ═══ */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* ─── Left Panel: Brand + CTA ─── */}
        <div className="lg:w-[48%] flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0 relative">
          {/* Large brand name */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-display font-bold text-foreground/10 tracking-tighter select-none leading-none mb-8">
            sahara
          </h1>

          {/* Online counter */}
          <div className="flex items-center gap-2.5 mb-12">
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(142_70%_45%)] animate-pulse" />
            <span className="text-base font-medium text-foreground">
              {onlineCount.toLocaleString()} are matching now!
            </span>
          </div>

          {/* Stats */}
          <div className="mb-12">
            <StatsCounter />
          </div>

          {/* ─── Bottom Controls ─── */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Gender dropdown */}
            <div className="relative" ref={genderRef}>
              <button
                onClick={() => setGenderOpen((o) => !o)}
                className="h-12 px-5 rounded-full bg-secondary text-foreground flex items-center gap-2.5
                  hover:bg-secondary/80 transition-all duration-200"
              >
                <span className="text-lg">{gender === "Male" ? "👦" : "👧"}</span>
                <span className="text-sm font-medium">Gender</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${genderOpen ? "rotate-180" : ""}`} />
              </button>
              {genderOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-36 rounded-xl bg-card border border-border shadow-xl z-50 py-1 animate-fade-in">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      onClick={() => { setGender(g); setGenderOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                        g === gender ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <span>{g === "Male" ? "👦" : "👧"}</span>
                      <span className="font-medium">{g}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Country dropdown */}
            <div className="relative" ref={countryRef}>
              <button
                onClick={() => setCountryOpen((o) => !o)}
                className="h-12 px-5 rounded-full bg-secondary text-foreground flex items-center gap-2.5
                  hover:bg-secondary/80 transition-all duration-200"
              >
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm font-medium">Country</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${countryOpen ? "rotate-180" : ""}`} />
              </button>
              {countryOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-44 max-h-56 overflow-y-auto rounded-xl bg-card border border-border shadow-xl z-50 py-1 animate-fade-in">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCountry(c); setCountryOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                        c.code === country.code ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <span className="text-base">{c.flag}</span>
                      <span className="font-medium">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Start Video Chat CTA */}
            <button
              onClick={() => navigate("/live")}
              className="h-12 px-8 rounded-full bg-foreground text-background flex items-center gap-2.5
                font-display font-bold text-sm tracking-tight
                shadow-[0_4px_20px_hsl(var(--foreground)/0.2)]
                hover:scale-105 hover:shadow-[0_6px_30px_hsl(var(--foreground)/0.3)]
                active:scale-[0.98] transition-all duration-200"
            >
              <Video className="w-5 h-5" />
              Start Video Chat
            </button>
          </div>
        </div>

        {/* ─── Right Panel: Profile Grid ─── */}
        <div className="lg:w-[52%] px-4 lg:px-6 py-6 lg:py-4 overflow-hidden">
          <div className="grid grid-cols-3 gap-3 h-full" style={{ gridTemplateRows: "1fr 1fr" }}>
            {/* First card spans 2 rows */}
            <ProfileCard image={PROFILES[0].image} name={PROFILES[0].name} age={PROFILES[0].age} flag={PROFILES[0].flag} className="row-span-2" />
            {/* Remaining 4 cards fill the 2x2 grid */}
            {PROFILES.slice(1, 5).map((p, i) => (
              <ProfileCard key={i} image={p.image} name={p.name} age={p.age} flag={p.flag} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
