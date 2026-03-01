import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { Coins, ArrowLeft, X, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import saharaLogo from "@/assets/sahara-logo.png";

const packages = [
  { id: "p1", coins: 550, bonus: 50, price: 400, popular: false },
  { id: "p2", coins: 1200, bonus: 100, price: 800, popular: true },
  { id: "p3", coins: 2500, bonus: 200, price: 1650, popular: false },
  { id: "p4", coins: 5500, bonus: 500, price: 3400, popular: false },
  { id: "p5", coins: 12000, bonus: 1000, price: 6600, popular: false },
];

function CoinIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_12px_hsl(40_90%_50%/0.4)]`}>
      <Coins className="w-[60%] h-[60%] text-amber-900" />
    </div>
  );
}

function FlyingCoin({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed z-[100] pointer-events-none" style={{
      left: '50%', top: '60%',
      animation: 'coin-fly 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
    }}>
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-[0_0_16px_hsl(40_90%_50%/0.6)]" />
    </div>
  );
}

export default function BuyCoins() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [coinBalance, setCoinBalance] = useState(0);
  const [selected, setSelected] = useState("p2");
  const [flyingCoins, setFlyingCoins] = useState<number[]>([]);
  const coinCounter = useRef(0);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("coin_wallets").select("balance").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setCoinBalance((data as any).balance); });
  }, [user]);

  const handlePurchase = () => {
    // Trigger coin animation then show toast
    const newCoins: number[] = [];
    for (let i = 0; i < 8; i++) {
      newCoins.push(++coinCounter.current);
    }
    setFlyingCoins(newCoins);

    import("sonner").then(({ toast }) => {
      toast.info("Payment integration coming soon!");
    });
  };

  const removeCoin = (id: number) => {
    setFlyingCoins(prev => prev.filter(c => c !== id));
  };

  const selectedPkg = packages.find(p => p.id === selected)!;

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Flying coins */}
      {flyingCoins.map((id, i) => (
        <div key={id} style={{ animationDelay: `${i * 80}ms` }}>
          <FlyingCoin onDone={() => removeCoin(id)} />
        </div>
      ))}

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-5">
        <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
          <img src={saharaLogo} alt="Sahara" className="h-9 w-auto" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-border/40 bg-secondary/60 text-sm font-semibold text-foreground">
            <Coins className="w-4 h-4 text-amber-400" />
            {coinBalance.toLocaleString()}
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Content */}
      <div className="px-6 lg:px-10 max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">Select Recharge</h1>
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {packages.slice(0, 3).map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} selected={selected === pkg.id} onSelect={() => setSelected(pkg.id)} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {packages.slice(3).map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} selected={selected === pkg.id} onSelect={() => setSelected(pkg.id)} />
          ))}
        </div>

        {/* Pay Now */}
        <button
          onClick={handlePurchase}
          className="w-full py-4 rounded-2xl font-display font-bold text-base tracking-tight transition-all duration-300 active:scale-[0.97] bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 text-white shadow-[0_4px_24px_hsl(195_90%_55%/0.4)] hover:shadow-[0_4px_40px_hsl(195_90%_55%/0.6)] hover:brightness-110"
        >
          Pay Now — ₹{selectedPkg.price.toLocaleString("en-IN")}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-3 mb-8">
          <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Secure & encrypted payment</span>
        </div>
      </div>

      <style>{`
        @keyframes coin-fly {
          0% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -60vh) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function PackageCard({ pkg, selected, onSelect }: {
  pkg: typeof packages[0]; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative rounded-2xl p-4 text-center transition-all duration-200 group
        ${selected
          ? "bg-amber-500/10 border-2 border-amber-400/60 shadow-[0_0_20px_hsl(40_90%_50%/0.15)]"
          : "glass border border-border/30 hover:bg-secondary/40"
        }
        ${pkg.popular && !selected ? "border-primary/40" : ""}
      `}
    >
      {pkg.popular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Popular
        </span>
      )}

      <CoinIcon className="w-9 h-9 mx-auto mb-2" />

      <div className="font-display font-bold text-foreground text-base leading-tight">
        {pkg.coins.toLocaleString()} <span className="text-amber-400">+ {pkg.bonus}</span>
      </div>

      <div className="text-xs text-muted-foreground mt-0.5">Extra coins included</div>

      <div className="text-sm font-semibold text-foreground mt-2">
        ₹{pkg.price.toLocaleString("en-IN")}
      </div>
    </button>
  );
}
