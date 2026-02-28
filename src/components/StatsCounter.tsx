import { useEffect, useState, useRef } from "react";

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

const stats: StatItem[] = [
  { label: "Active Users Online", value: 12847, prefix: "" },
  { label: "Connections Today", value: 284591, prefix: "" },
  { label: "Avg Match Time", value: 3, suffix: "s" },
  { label: "Countries Connected", value: 142, prefix: "" },
];

function AnimatedNumber({ target, suffix, prefix }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatsCounter() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass rounded-xl p-5 md:p-6 text-center opacity-0 animate-fade-in"
          style={{ animationDelay: `${stats.indexOf(stat) * 150 + 600}ms` }}
        >
          <div className="text-2xl md:text-3xl font-bold font-display text-primary glow-text mb-1">
            <AnimatedNumber target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
          </div>
          <div className="text-xs md:text-sm text-muted-foreground tracking-wide uppercase">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
