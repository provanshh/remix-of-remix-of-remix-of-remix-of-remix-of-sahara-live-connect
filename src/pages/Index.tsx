import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatsCounter from "@/components/StatsCounter";
import ParticleBackground from "@/components/ParticleBackground";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <ParticleBackground />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <span className="text-xl font-display font-bold text-primary glow-text tracking-tight">
          Sahara
        </span>
        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Now
          </span>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 md:pt-28 pb-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-display font-bold text-foreground glow-text opacity-0 animate-fade-in tracking-tight">
            Sahara
          </h1>
          <p
            className="mt-4 md:mt-6 text-lg md:text-xl text-muted-foreground font-light opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            Real Conversations. Real People.
          </p>

          <div
            className="mt-10 md:mt-12 opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <Button
              onClick={() => navigate("/live")}
              size="lg"
              className="relative text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-full font-semibold gradient-primary text-primary-foreground glow-primary animate-glow-pulse hover:scale-105 transition-transform duration-300"
            >
              Start Live Video Chat
            </Button>
          </div>
        </div>

        <div className="mt-20 md:mt-28 w-full">
          <StatsCounter />
        </div>

        {/* Trust line */}
        <p
          className="mt-16 text-xs text-muted-foreground/50 tracking-widest uppercase opacity-0 animate-fade-in"
          style={{ animationDelay: "1200ms" }}
        >
          Encrypted · Anonymous · Instant
        </p>
      </main>
    </div>
  );
}
