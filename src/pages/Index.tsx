import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Video, ChevronDown, ShoppingBag, Clock, Facebook, LogIn, Youtube } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleBackground from "@/components/ParticleBackground";
import StatsCounter from "@/components/StatsCounter";
import AutoScrollCarousel from "@/components/AutoScrollCarousel";
import CoinShopModal from "@/components/CoinShopModal";
import LandingInfoSection from "@/components/LandingInfoSection";
import saharaLogo from "@/assets/sahara-logo.png";

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
  const [shopOpen, setShopOpen] = useState(false);
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
        <div className="flex items-center gap-8">
          <span className="flex items-center">
            <img src={saharaLogo} alt="Sahara" className="h-9 w-auto" />
          </span>
          {/* Nav links - grouped with logo */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate("/live")} className="nav-link-hover text-base font-semibold text-foreground hover:text-primary transition-colors pb-0.5">
              Video Chat
            </button>
            <button onClick={() => navigate("/text-chat")} className="nav-link-hover text-base font-medium text-foreground hover:text-primary transition-colors pb-0.5">
              Messages
            </button>
            <button onClick={() => navigate("/about")} className="nav-link-hover text-base font-medium text-foreground hover:text-primary transition-colors pb-0.5">
              About
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {/* Shop & History */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setShopOpen(true)} className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-border/40 bg-secondary/60 text-sm font-medium text-foreground hover:bg-secondary transition-all duration-200">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Shop
            </button>
            <button onClick={() => navigate("/history")} className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-border/40 bg-secondary/60 text-sm font-medium text-foreground hover:bg-secondary transition-all duration-200">
              <Clock className="w-4 h-4" />
              History
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-5 bg-border/30" />

          {/* Social icons */}
          <div className="hidden lg:flex items-center gap-2">
            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="url(#ig-gradient)">
                <defs>
                  <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#feda75" />
                    <stop offset="25%" stopColor="#fa7e1e" />
                    <stop offset="50%" stopColor="#d62976" />
                    <stop offset="75%" stopColor="#962fbf" />
                    <stop offset="100%" stopColor="#4f5bd5" />
                  </linearGradient>
                </defs>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80">
              <Facebook className="w-[18px] h-[18px]" style={{ color: '#1877F2' }} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80">
              <Youtube className="w-[18px] h-[18px]" style={{ color: '#FF0000' }} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="#A2AAAD"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
            </a>
          </div>

          {/* Separator + Log in */}
          <div className="hidden md:block w-px h-5 bg-border/30" />
          <button onClick={() => navigate("/auth")} className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <LogIn className="w-4 h-4" />
            Log in
          </button>

          <ThemeToggle />
        </div>
      </nav>

      {/* ═══ Main Content ═══ */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* ─── Left Panel: Brand + CTA ─── */}
        <div className="lg:w-[48%] flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0 relative">
          {/* Large brand name */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter select-none leading-none mb-8 sahara-shine cursor-default">
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

        {/* ─── Right Panel: Auto-Scrolling Carousel ─── */}
        <div className="lg:w-[52%] px-4 lg:px-6 py-6 lg:py-4 h-[calc(100vh-80px)]">
          <AutoScrollCarousel profiles={PROFILES} />
        </div>
      </div>
      <LandingInfoSection />
      <CoinShopModal open={shopOpen} onClose={() => setShopOpen(false)} coinBalance={0} />
    </div>
  );
}
