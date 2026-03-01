import { useState } from "react";
import { Coins, X, ShieldCheck, Sparkles } from "lucide-react";

const packages = [
  { id: "p1", coins: 550, bonus: 50, price: 400, popular: false },
  { id: "p2", coins: 1200, bonus: 100, price: 800, popular: true },
  { id: "p3", coins: 2500, bonus: 200, price: 1650, popular: false },
  { id: "p4", coins: 5500, bonus: 500, price: 3400, popular: false },
  { id: "p5", coins: 12000, bonus: 1000, price: 6600, popular: false },
];

interface CoinShopModalProps {
  open: boolean;
  onClose: () => void;
  coinBalance: number;
}

export default function CoinShopModal({ open, onClose, coinBalance }: CoinShopModalProps) {
  const [selected, setSelected] = useState("p2");

  if (!open) return null;

  const pkg = packages.find((p) => p.id === selected)!;

  const handlePurchase = () => {
    import("sonner").then(({ toast }) => {
      toast.info("Payment integration coming soon!");
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-3xl glass-strong border border-border/40 shadow-[0_0_60px_hsl(var(--primary)/0.15)] p-5 text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <h3 className="text-lg font-display font-bold text-foreground mb-1">Select Recharge</h3>

        {/* Balance */}
        <div className="flex items-center justify-center gap-1.5 mb-4 mt-2 h-8 px-4 rounded-full border border-border/40 bg-secondary/60 text-sm font-semibold text-foreground w-fit mx-auto">
          <Coins className="w-4 h-4 text-amber-400" />
          {coinBalance.toLocaleString()}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-2.5">
          {packages.slice(0, 3).map((p) => (
            <PkgCard key={p.id} pkg={p} selected={selected === p.id} onSelect={() => setSelected(p.id)} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {packages.slice(3).map((p) => (
            <PkgCard key={p.id} pkg={p} selected={selected === p.id} onSelect={() => setSelected(p.id)} />
          ))}
        </div>

        {/* Pay Now */}
        <button
          onClick={handlePurchase}
          className="w-full py-3.5 rounded-2xl font-display font-bold text-sm tracking-tight transition-all duration-300 active:scale-[0.97] bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 text-white shadow-[0_4px_24px_hsl(195_90%_55%/0.4)] hover:shadow-[0_4px_40px_hsl(195_90%_55%/0.6)] hover:brightness-110"
        >
          Pay Now — ₹{pkg.price.toLocaleString("en-IN")}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-2">
          <ShieldCheck className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Secure & encrypted payment</span>
        </div>
      </div>
    </div>
  );
}

function PkgCard({ pkg, selected, onSelect }: { pkg: typeof packages[0]; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`relative rounded-2xl p-3 text-center transition-all duration-200
        ${selected
          ? "bg-amber-500/10 border-2 border-amber-400/60 shadow-[0_0_20px_hsl(40_90%_50%/0.15)]"
          : "glass border border-border/30 hover:bg-secondary/40"
        }
        ${pkg.popular && !selected ? "border-primary/40" : ""}
      `}
    >
      {pkg.popular && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5">
          <Sparkles className="w-2 h-2" /> Popular
        </span>
      )}

      <div className="w-7 h-7 mx-auto mb-1.5 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_8px_hsl(40_90%_50%/0.4)]">
        <Coins className="w-[60%] h-[60%] text-amber-900" />
      </div>

      <div className="font-display font-bold text-foreground text-sm leading-tight">
        {pkg.coins.toLocaleString()} <span className="text-amber-400">+{pkg.bonus}</span>
      </div>

      <div className="text-[10px] text-muted-foreground mt-0.5">Extra coins</div>

      <div className="text-xs font-semibold text-foreground mt-1.5">
        ₹{pkg.price.toLocaleString("en-IN")}
      </div>
    </button>
  );
}
