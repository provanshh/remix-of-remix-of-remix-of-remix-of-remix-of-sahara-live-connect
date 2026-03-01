import { Video, Globe, Shield, Zap, MessageCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const features = [
  { icon: Video, title: "Free Video Chat", desc: "Connect face-to-face with people worldwide, completely free of charge." },
  { icon: Zap, title: "No Time Limits", desc: "Chat as long as you want — there are no restrictions on conversation length." },
  { icon: Shield, title: "Safe & Anonymous", desc: "Your privacy matters. Stay anonymous and chat securely with strangers." },
  { icon: MessageCircle, title: "In-Built Translation", desc: "Break language barriers with real-time translation built right in." },
  { icon: Users, title: "Thousands Online", desc: "Hundreds of thousands of users are online at any time, ready to connect." },
  { icon: Globe, title: "Country Selection", desc: "Choose your preferred country or region to find people near you." },
];

function FloatingOrbs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Floating orbs — bigger, brighter, more of them
    const orbs = Array.from({ length: 10 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: 120 + Math.random() * 300,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      hue: 165 + Math.random() * 35,
      alpha: 0.08 + Math.random() * 0.12,
      pulseSpeed: 0.005 + Math.random() * 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // Particles — more, brighter
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: 1.5 + Math.random() * 3,
      speed: 0.3 + Math.random() * 0.6,
      alpha: 0.4 + Math.random() * 0.6,
      pulse: Math.random() * Math.PI * 2,
    }));

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    let time = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w(), h());
      time += 1;

      // Draw orbs with pulsing
      orbs.forEach((o) => {
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -o.r) o.x = w() + o.r;
        if (o.x > w() + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h() + o.r;
        if (o.y > h() + o.r) o.y = -o.r;

        const pulse = 0.7 + 0.3 * Math.sin(time * o.pulseSpeed + o.pulsePhase);
        const currentAlpha = o.alpha * pulse;
        const currentR = o.r * (0.9 + 0.1 * pulse);

        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, currentR);
        grad.addColorStop(0, `hsla(${o.hue}, 85%, 55%, ${currentAlpha})`);
        grad.addColorStop(0.4, `hsla(${o.hue}, 80%, 45%, ${currentAlpha * 0.5})`);
        grad.addColorStop(1, `hsla(${o.hue}, 80%, 40%, 0)`);
        ctx.beginPath();
        ctx.arc(o.x, o.y, currentR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Draw particles with glow
      particles.forEach((p) => {
        p.y -= p.speed;
        p.pulse += 0.03;
        if (p.y < -10) {
          p.y = h() + 10;
          p.x = Math.random() * w();
        }
        const a = p.alpha * (0.4 + 0.6 * Math.sin(p.pulse));
        // Glow layer
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(180, 80%, 60%, ${a * 0.15})`;
        ctx.fill();
        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(180, 90%, 70%, ${a})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
}

export default function LandingInfoSection() {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 overflow-hidden">
      {/* Dynamic background */}
      <FloatingOrbs />

      {/* Gradient overlay top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-[1] pointer-events-none" />

      <div className="relative z-[2] px-6 lg:px-16 py-20 lg:py-28">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-center mb-6 tracking-tight text-foreground">
          Meet New People in Free Random Video Chat
        </h2>
        <p className="text-center text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-20">
          Sahara instantly connects you to random people worldwide. Meet someone from across the globe or right around the corner — the anticipation of who you'll connect with next adds excitement to every chat.
        </p>

        {/* Two-column content with glass cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto mb-24">
          {/* Left card */}
          <div className="glass rounded-2xl p-8 hover:border-primary/20 transition-all duration-500 group">
            <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-5 group-hover:text-primary transition-colors duration-300">
              Discover the Excitement of Random Video Chatting
            </h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
              With hundreds of thousands online anytime, Sahara provides endless opportunities for connection. Escape boredom and experience the best random video chat, all free of charge.
            </p>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Choose your country, set your gender, and hit "Start" to dive into a free experience of meeting new people instantly, wherever you are!
            </p>
          </div>

          {/* Right card */}
          <div className="glass rounded-2xl p-8 hover:border-primary/20 transition-all duration-500">
            <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6">
              What Makes Sahara Stand Out?
            </h3>
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li
                  key={f.title}
                  className="flex items-start gap-3.5 group/item"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover/item:bg-primary/20 group-hover/item:border-primary/40 group-hover/item:shadow-[0_0_12px_hsl(var(--primary)/0.2)] transition-all duration-300">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="pt-1">
                    <span className="font-semibold text-foreground text-sm">{f.title}</span>
                    <span className="text-muted-foreground text-sm ml-1">— {f.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8">
            Video Chat with Fun New Friends
          </h3>
          <button
            onClick={() => navigate("/live")}
            className="h-14 px-12 rounded-full bg-primary text-primary-foreground font-display font-bold text-base tracking-tight
              shadow-[0_4px_30px_hsl(var(--primary)/0.35)]
              hover:scale-105 hover:shadow-[0_8px_50px_hsl(var(--primary)/0.5)]
              active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Start Chatting Now!</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          </button>
        </div>
      </div>

      {/* Gradient overlay bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[1] pointer-events-none" />
    </section>
  );
}
