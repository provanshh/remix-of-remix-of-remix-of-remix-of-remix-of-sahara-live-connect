import { useRef, useEffect } from "react";
import { ChevronDown, Video, VideoOff, Mic, MicOff } from "lucide-react";

export const COUNTRIES = [
  { code: "US", name: "USA", flag: "🇺🇸" },
  { code: "GB", name: "UK", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "Korea", flag: "🇰🇷" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "XX", name: "Any", flag: "🌍" },
];

export type Gender = "boy" | "girl";
export type Country = (typeof COUNTRIES)[number];

interface ControlPanelProps {
  isConnected: boolean;
  onStart: () => void;
  onStop: () => void;
  cameraOn: boolean;
  micOn: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  gender: Gender;
  onGenderChange: (g: Gender) => void;
  country: Country;
  onCountryChange: (c: Country) => void;
}

export default function ControlPanel({
  isConnected,
  onStart,
  onStop,
  cameraOn,
  micOn,
  onToggleCamera,
  onToggleMic,
  gender,
  onGenderChange,
  country,
  onCountryChange,
}: ControlPanelProps) {
  const [dropdownOpen, setDropdownOpen] = [false, () => {}] as any;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Need real state for dropdown
  const { 0: ddOpen, 1: setDdOpen } = { 0: false, 1: (_: any) => {} } as any;

  return <ControlPanelInner
    isConnected={isConnected}
    onStart={onStart}
    onStop={onStop}
    cameraOn={cameraOn}
    micOn={micOn}
    onToggleCamera={onToggleCamera}
    onToggleMic={onToggleMic}
    gender={gender}
    onGenderChange={onGenderChange}
    country={country}
    onCountryChange={onCountryChange}
  />;
}

// Inner component with proper state
import { useState } from "react";

function ControlPanelInner({
  isConnected, onStart, onStop, cameraOn, micOn, onToggleCamera, onToggleMic,
  gender, onGenderChange, country, onCountryChange,
}: ControlPanelProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="px-3 py-2.5 border-t border-border/20">
      <div className="flex flex-wrap items-stretch gap-2 max-w-3xl mx-auto">
        <button
          onClick={onStart}
          className="flex-1 min-w-[100px] h-12 rounded-xl font-display font-semibold text-sm tracking-tight
            bg-[hsl(142_70%_42%)] text-[hsl(0_0%_100%)]
            shadow-[0_2px_12px_hsl(142_70%_42%/0.3)]
            hover:shadow-[0_4px_20px_hsl(142_70%_42%/0.45)] hover:brightness-110
            active:scale-[0.97] transition-all duration-200"
        >
          {isConnected ? "Next" : "Start"}
        </button>

        <button
          onClick={onStop}
          className="flex-1 min-w-[100px] h-12 rounded-xl font-display font-semibold text-sm tracking-tight
            bg-destructive/80 text-destructive-foreground
            shadow-[0_2px_12px_hsl(var(--destructive)/0.25)]
            hover:shadow-[0_4px_20px_hsl(var(--destructive)/0.4)] hover:brightness-110
            active:scale-[0.97] transition-all duration-200"
        >
          Stop
        </button>

        <button
          onClick={onToggleCamera}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
          className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm
            ${!cameraOn
              ? "bg-destructive/20 text-destructive shadow-[0_2px_10px_hsl(var(--destructive)/0.2)]"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
        >
          {cameraOn ? <Video className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
        </button>

        <button
          onClick={onToggleMic}
          title={micOn ? "Mute" : "Unmute"}
          className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm
            ${!micOn
              ? "bg-destructive/20 text-destructive shadow-[0_2px_10px_hsl(var(--destructive)/0.2)]"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
        >
          {micOn ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
        </button>

        <div className="relative flex-1 min-w-[120px]" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground
              flex items-center justify-between gap-2 px-3.5
              shadow-sm hover:bg-secondary/80 transition-all duration-200"
          >
            <span className="flex items-center gap-2 text-sm">
              <span className="text-lg leading-none">{country.flag}</span>
              <span className="font-medium">{country.name}</span>
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute bottom-full mb-1 left-0 w-full max-h-48 overflow-y-auto
              rounded-xl bg-card border border-border shadow-lg z-50 py-1 animate-fade-in">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { onCountryChange(c); setDropdownOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-muted/50 transition-colors
                    ${c.code === country.code ? "bg-primary/10 text-primary" : "text-foreground"}`}
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="font-medium">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-12 rounded-xl bg-secondary shadow-sm flex items-center p-1 gap-0.5">
          <button
            onClick={() => onGenderChange("boy")}
            className={`h-full px-3.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-300
              ${gender === "boy"
                ? "bg-primary/15 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.2)]"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <span className="text-base">👦</span>
            <span className="hidden sm:inline text-xs">I am</span>
          </button>
          <button
            onClick={() => onGenderChange("girl")}
            className={`h-full px-3.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-300
              ${gender === "girl"
                ? "bg-[hsl(330_70%_50%/0.15)] text-[hsl(330_70%_55%)] shadow-[0_0_10px_hsl(330_70%_50%/0.2)]"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <span className="text-base">👧</span>
            <span className="hidden sm:inline text-xs">I am</span>
          </button>
        </div>
      </div>
    </div>
  );
}
