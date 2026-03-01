import { useState } from "react";
import { X, Lock, ChevronRight, ChevronDown, Languages, MapPin, Users, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const REGIONS = [
  "North Africa", "Middle East", "Southeast Asia", "Europe",
  "South America", "East Asia", "North America", "Oceania"
];

const LANGUAGES = [
  "English", "Arabic", "Spanish", "French", "Hindi", "Mandarin", "Japanese", "Korean", "Portuguese", "German"
];

type RegionPref = "default" | "prefer_more" | "prefer_less";
type GenderPref = "any" | "male" | "female";

interface FilterBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onUnlockRequest: () => void;
  unlocked: boolean;
}

export default function FilterBottomSheet({ open, onClose, onUnlockRequest, unlocked }: FilterBottomSheetProps) {
  const [ageRange, setAgeRange] = useState([18, 35]);
  const [regionPrefs, setRegionPrefs] = useState<Record<string, RegionPref>>(
    () => Object.fromEntries(REGIONS.map(r => [r, "default" as RegionPref]))
  );
  const [openRegionMenu, setOpenRegionMenu] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Unlimited");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [genderPref, setGenderPref] = useState<GenderPref>("any");

  if (!open) return null;

  const handleFilterTap = () => {
    if (!unlocked) onUnlockRequest();
  };

  const prefLabel = (pref: RegionPref) => {
    if (pref === "prefer_more") return "Prefer More";
    if (pref === "prefer_less") return "Prefer Less";
    return "Default";
  };

  const prefColor = (pref: RegionPref) => {
    if (pref === "prefer_more") return "text-primary";
    if (pref === "prefer_less") return "text-amber-400";
    return "text-muted-foreground";
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Bottom Sheet */}
      <div
        className="relative w-full max-w-lg rounded-t-3xl glass-strong border-t border-x border-primary/20 shadow-[0_-10px_60px_hsl(var(--primary)/0.15)] animate-slide-up pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-display font-bold text-foreground">Match Preferences</span>
            {!unlocked && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">Premium</span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Filter Options */}
        <div className="px-6 space-y-4 relative">
          {!unlocked && (
            <div className="absolute inset-0 z-10 cursor-pointer" onClick={handleFilterTap} />
          )}

          {/* Age Range */}
          <div className={`relative ${!unlocked ? "opacity-60 blur-[1.5px]" : ""} transition-all`}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Age Range</span>
              <span className="text-xs text-muted-foreground ml-auto">{ageRange[0]}–{ageRange[1] >= 35 ? "35+" : ageRange[1]}</span>
            </div>
            {unlocked ? (
              <Slider
                value={ageRange}
                onValueChange={setAgeRange}
                min={18}
                max={35}
                step={1}
                minStepsBetweenThumbs={1}
                className="w-full"
              />
            ) : (
              <div className="relative h-2 rounded-full bg-muted">
                <div className="absolute h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ left: "0%", right: "0%" }} />
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-4 h-4 rounded-full bg-primary border-2 border-primary-foreground shadow-lg" />
                <div className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-4 rounded-full bg-primary border-2 border-primary-foreground shadow-lg" />
              </div>
            )}
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">18</span>
              <span className="text-[10px] text-muted-foreground">35+</span>
            </div>
          </div>

          {/* Gender */}
          <div className={`relative ${!unlocked ? "opacity-60 blur-[1.5px]" : ""} transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Gender</span>
            </div>
            <div className="flex gap-2">
              {([
                { value: "any" as GenderPref, label: "Anyone", emoji: "🌍" },
                { value: "male" as GenderPref, label: "Male", emoji: "♂️" },
                { value: "female" as GenderPref, label: "Female", emoji: "♀️" },
              ]).map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => unlocked && setGenderPref(value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    genderPref === value
                      ? "bg-primary/15 border-2 border-primary/50 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
                      : "bg-muted/40 border border-border/30 text-muted-foreground hover:border-primary/20"
                  }`}
                >
                  <span>{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={`relative ${!unlocked ? "opacity-60 blur-[1.5px]" : ""} transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Language</span>
            </div>
            <div className="relative">
              <button
                onClick={() => unlocked && setLangMenuOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted/40 border border-border/30 hover:border-primary/30 transition-colors"
              >
                <span className="text-sm text-foreground">{selectedLanguage}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${langMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {langMenuOpen && unlocked && (
                <div className="absolute top-full mt-1 left-0 w-full rounded-xl bg-card border border-border shadow-xl z-20 py-1 max-h-48 overflow-y-auto chat-scrollbar animate-fade-in">
                  <button
                    onClick={() => { setSelectedLanguage("Unlimited"); setLangMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${selectedLanguage === "Unlimited" ? "text-primary" : "text-foreground"}`}
                  >
                    <span>Unlimited</span>
                    {selectedLanguage === "Unlimited" && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setSelectedLanguage(lang); setLangMenuOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${selectedLanguage === lang ? "text-primary" : "text-foreground"}`}
                    >
                      <span>{lang}</span>
                      {selectedLanguage === lang && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Region */}
          <div className={`relative ${!unlocked ? "opacity-60 blur-[1.5px]" : ""} transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Region</span>
            </div>
            <div className="max-h-36 overflow-y-auto chat-scrollbar space-y-1.5">
              {REGIONS.map((region) => (
                <div key={region} className="relative">
                  <button
                    onClick={() => unlocked && setOpenRegionMenu(v => v === region ? null : region)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/40 border border-border/30 hover:border-primary/30 transition-colors"
                  >
                    <span className="text-sm text-foreground">{region}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium ${prefColor(regionPrefs[region])}`}>
                        {prefLabel(regionPrefs[region])}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${openRegionMenu === region ? "rotate-90" : ""}`} />
                    </div>
                  </button>
                  {openRegionMenu === region && unlocked && (
                    <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-card border border-border shadow-xl z-20 py-1 animate-fade-in">
                      {(["default", "prefer_more", "prefer_less"] as RegionPref[]).map(pref => (
                        <button
                          key={pref}
                          onClick={() => {
                            setRegionPrefs(prev => ({ ...prev, [region]: pref }));
                            setOpenRegionMenu(null);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-sm hover:bg-muted/50 transition-colors ${regionPrefs[region] === pref ? "text-primary" : "text-foreground"}`}
                        >
                          <span>{prefLabel(pref)}</span>
                          {regionPrefs[region] === pref && <Check className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lock Overlay Icon */}
          {!unlocked && (
            <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_hsl(40_90%_50%/0.3)]">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
