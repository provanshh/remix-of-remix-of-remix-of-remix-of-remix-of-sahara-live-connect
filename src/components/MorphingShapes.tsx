import { useEffect, useState } from "react";

const SHAPES = [
  // Circle
  "50% 50% 50% 50%",
  // Blob 1
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  // Blob 2
  "30% 70% 70% 30% / 50% 30% 60% 70%",
  // Blob 3
  "70% 30% 50% 50% / 30% 60% 40% 70%",
  // Square-ish
  "20% 20% 20% 20%",
  // Blob 4
  "40% 60% 60% 40% / 70% 30% 50% 50%",
];

export default function MorphingShapes() {
  const [shapeIndex, setShapeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShapeIndex((i) => (i + 1) % SHAPES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-20 h-20 mb-4">
      {/* Outer glow ring */}
      <div
        className="absolute -inset-3 opacity-30"
        style={{
          borderRadius: SHAPES[shapeIndex],
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.2))",
          transition: "border-radius 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          filter: "blur(12px)",
        }}
      />
      {/* Main shape */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          borderRadius: SHAPES[shapeIndex],
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))",
          transition: "border-radius 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 0 30px hsl(var(--primary) / 0.3)",
        }}
      >
        {/* Inner rotating icon substitute — abstract dots */}
        <div className="relative w-8 h-8">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary-foreground"
              style={{
                top: `${50 + 38 * Math.sin((shapeIndex * 1.2 + i * Math.PI / 2))}%`,
                left: `${50 + 38 * Math.cos((shapeIndex * 1.2 + i * Math.PI / 2))}%`,
                transform: "translate(-50%, -50%)",
                transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
