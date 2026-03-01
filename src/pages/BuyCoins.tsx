import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { Coins, ArrowLeft, Zap, Crown, Gem, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const packages = [
  { id: "starter", coins: 100, price: 0.99, icon: Zap, label: "Starter", popular: false },
  { id: "popular", coins: 500, price: 3.99, icon: Star, label: "Popular", popular: true },
  { id: "premium", coins: 1500, price: 9.99, icon: Crown, label: "Premium", popular: false },
  { id: "vip", coins: 5000, price: 24.99, icon: Gem, label: "VIP", popular: false },
];

export default function BuyCoins() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [coinBalance, setCoinBalance] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("coin_wallets").select("balance").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setCoinBalance((data as any).balance); });
  }, [user]);

  const handlePurchase = (pkg: typeof packages[0]) => {
    // Stripe integration will be connected here
    // For now show a placeholder
    import("sonner").then(({ toast }) => {
      toast.info("Stripe payment integration coming soon!");
    });
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-5">
        <button onClick={() => navigate("/")} className="text-2xl font-display font-bold text-primary glow-text tracking-tight">
          Sahara
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-border/40 bg-secondary/60 text-sm font-semibold text-foreground">
            <Coins className="w-4 h-4 text-amber-400" />
            {coinBalance.toLocaleString()}
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="px-6 lg:px-10 mt-4 mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Buy Coins</h1>
        <p className="text-muted-foreground mt-1">Unlock connections and reconnect with people you care about</p>
      </div>

      <div className="px-6 lg:px-10 max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {packages.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <button
              key={pkg.id}
              onClick={() => handlePurchase(pkg)}
              className={`relative glass rounded-2xl p-6 text-left hover:bg-secondary/40 transition-all duration-200 group ${
                pkg.popular ? "ring-2 ring-primary/50" : ""
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display font-semibold text-foreground">{pkg.label}</span>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-2xl font-bold text-foreground">{pkg.coins.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">coins</span>
              </div>

              <div className="text-lg font-semibold text-primary">${pkg.price}</div>
              <div className="text-xs text-muted-foreground mt-1">
                ${(pkg.price / pkg.coins * 100).toFixed(1)}¢ per coin
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
