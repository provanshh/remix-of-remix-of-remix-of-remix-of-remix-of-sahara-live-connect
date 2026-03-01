import { useEffect, useRef } from "react";

interface Card {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  blur: number;
  opacity: number;
  hue: number;
  rotation: number;
  rotationSpeed: number;
}

export default function FloatingCardsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cards: Card[] = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      size: 40 + Math.random() * 40,
      blur: Math.random() < 0.3 ? 0 : Math.random() * 4 + 1,
      opacity: 0.08 + Math.random() * 0.18,
      hue: 170 + Math.random() * 30,
      rotation: Math.random() * 20 - 10,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
    }));

    const drawCard = (c: Card) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.globalAlpha = c.opacity;
      if (c.blur > 0) ctx.filter = `blur(${c.blur}px)`;

      const w = c.size;
      const h = c.size * 1.4;
      const r = 10;

      // Card body
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, r);
      ctx.fillStyle = `hsla(${c.hue}, 30%, 18%, 0.9)`;
      ctx.fill();
      ctx.strokeStyle = `hsla(${c.hue}, 60%, 45%, 0.2)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Avatar area
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h * 0.6, [r, r, 0, 0]);
      ctx.fillStyle = `linear-gradient(hsla(${c.hue}, 40%, 25%, 1), hsla(${c.hue + 15}, 30%, 20%, 1))`;
      ctx.fillStyle = `hsla(${c.hue}, 35%, 22%, 1)`;
      ctx.fill();

      // Text lines
      ctx.fillStyle = `hsla(180, 20%, 70%, 0.15)`;
      ctx.fillRect(-w / 2 + 8, h * 0.18, w * 0.6, 4);
      ctx.fillRect(-w / 2 + 8, h * 0.18 + 8, w * 0.35, 3);

      // Glow dot
      ctx.beginPath();
      ctx.arc(w / 2 - 10, -h / 2 + 10, 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(170, 80%, 50%, 0.5)`;
      ctx.fill();

      ctx.filter = "none";
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle radial glow
      const grad = ctx.createRadialGradient(
        canvas.width * 0.4, canvas.height * 0.3, 0,
        canvas.width * 0.4, canvas.height * 0.3, canvas.width * 0.5
      );
      grad.addColorStop(0, "hsla(180, 60%, 40%, 0.04)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      cards.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotationSpeed;

        // Wrap around edges
        const margin = c.size;
        if (c.x < -margin) c.x = canvas.width + margin;
        if (c.x > canvas.width + margin) c.x = -margin;
        if (c.y < -margin) c.y = canvas.height + margin;
        if (c.y > canvas.height + margin) c.y = -margin;

        drawCard(c);
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
