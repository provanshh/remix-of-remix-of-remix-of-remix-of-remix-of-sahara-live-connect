import { Video, Globe, Shield, Zap, MessageCircle, Users, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Video, title: "Free Video Chat", desc: "Connect face-to-face with people worldwide, completely free of charge." },
  { icon: Zap, title: "No Time Limits", desc: "Chat as long as you want — there are no restrictions on conversation length." },
  { icon: Shield, title: "Safe & Anonymous", desc: "Your privacy matters. Stay anonymous and chat securely with strangers." },
  { icon: MessageCircle, title: "In-Built Translation", desc: "Break language barriers with real-time translation built right in." },
  { icon: Users, title: "Thousands Online", desc: "Hundreds of thousands of users are online at any time, ready to connect." },
  { icon: Globe, title: "Country Selection", desc: "Choose your preferred country or region to find people near you." },
];

export default function LandingInfoSection() {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 px-6 lg:px-16 py-20 lg:py-28">
      {/* Divider */}
      <div className="w-full h-px bg-border/30 mb-20" />

      {/* Heading */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-center mb-6 tracking-tight text-foreground">
        Meet New People in Free Random Video Chat
      </h2>
      <p className="text-center text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-16">
        Sahara instantly connects you to random people worldwide. Meet someone from across the globe or right around the corner — the anticipation of who you'll connect with next adds excitement to every chat.
      </p>

      {/* Two-column content */}
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 max-w-5xl mx-auto mb-20">
        {/* Left */}
        <div>
          <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
            Discover the Excitement of Random Video Chatting
          </h3>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
            With hundreds of thousands online anytime, Sahara provides endless opportunities for connection. Escape boredom and experience the best random video chat, all free of charge.
          </p>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Choose your country, set your gender, and hit "Start" to dive into a free experience of meeting new people instantly, wherever you are!
          </p>
        </div>

        {/* Right */}
        <div>
          <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
            What Makes Sahara Stand Out?
          </h3>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <f.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
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
        <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
          Video Chat with Fun New Friends
        </h3>
        <button
          onClick={() => navigate("/live")}
          className="h-14 px-10 rounded-full bg-primary text-primary-foreground font-display font-bold text-base tracking-tight
            shadow-[0_4px_30px_hsl(var(--primary)/0.3)]
            hover:scale-105 hover:shadow-[0_6px_40px_hsl(var(--primary)/0.4)]
            active:scale-[0.98] transition-all duration-200"
        >
          Start Chatting Now!
        </button>
      </div>
    </section>
  );
}
