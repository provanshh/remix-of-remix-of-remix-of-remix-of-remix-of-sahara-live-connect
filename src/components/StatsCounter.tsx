import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

function AnimatedNumber({ target, suffix, prefix }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    hasAnimated.current = false;
    setCount(0);
  }, [target]);

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
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      // Real online count
      const { data: countData } = await supabase.rpc("get_online_count");
      if (typeof countData === "number") setOnlineCount(countData);

      // Total sessions ever created
      const { count } = await supabase
        .from("active_sessions")
        .select("*", { count: "exact", head: true });
      if (typeof count === "number") setTotalSessions(count);
    };

    fetchStats();

    // Real-time refresh
    const channel = supabase
      .channel("stats-presence")
      .on("postgres_changes", { event: "*", schema: "public", table: "online_presence" }, fetchStats)
      .subscribe();

    const interval = setInterval(fetchStats, 15000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const stats: StatItem[] = [
    { label: "Active Users Online", value: onlineCount },
    { label: "Connections Made", value: totalSessions },
    { label: "Avg Match Time", value: 3, suffix: "s" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
      {stats.map((stat, idx) => (
        <div
          key={stat.label}
          className="glass rounded-xl p-5 md:p-6 text-center opacity-0 animate-fade-in"
          style={{ animationDelay: `${idx * 150 + 600}ms` }}
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
