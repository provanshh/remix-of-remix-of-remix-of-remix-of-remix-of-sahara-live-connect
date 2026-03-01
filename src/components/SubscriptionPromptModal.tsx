import { X, Crown, Zap, Shield, Star } from "lucide-react";

interface SubscriptionPromptModalProps {
  open: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    name: "Weekly",
    price: "$4.99",
    period: "/week",
    features: ["Unlimited filters", "Priority matching", "No ads"],
    icon: Zap,
    popular: false,
  },
  {
    name: "Monthly",
    price: "$12.99",
    period: "/month",
    features: ["Unlimited filters", "Priority matching", "No ads", "Exclusive badges"],
    icon: Crown,
    popular: true,
  },
  {
    name: "Yearly",
    price: "$79.99",
    period: "/year",
    features: ["Everything in Monthly", "VIP support", "Early access features"],
    icon: Star,
    popular: false,
  },
];

export default function SubscriptionPromptModal({ open, onClose }: SubscriptionPromptModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-3xl glass-strong border border-primary/30 shadow-[0_0_60px_hsl(var(--primary)/0.2)] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <div className="p-6 pb-2 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-[0_0_40px_hsl(var(--primary)/0.4)]">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-1">Free Matches Used Up</h3>
          <p className="text-sm text-muted-foreground">
            Upgrade to <span className="text-primary font-semibold">Sahara PLUS</span> for unlimited filter access
          </p>
        </div>

        <div className="p-5 space-y-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <button
                key={plan.name}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                  plan.popular
                    ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                    : "border-border/50 bg-card/50 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-display font-bold text-foreground">{plan.name}</span>
                    {plan.popular && (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                        Best Value
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {plan.features.map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 pb-5">
          <p className="text-[10px] text-center text-muted-foreground">
            Subscriptions coming soon. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}
