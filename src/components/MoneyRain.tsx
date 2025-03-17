import React, { useEffect, useRef } from "react";

interface MoneyRainProps {
  enabled?: boolean;
  density?: number;
  speed?: number;
}

const MoneyRain: React.FC<MoneyRainProps> = ({
  enabled = true,
  density = 50,
  speed = 3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create money symbols
    const symbols = ["$", "€", "£", "¥", "₿", "Ξ"];
    const drops: {
      x: number;
      y: number;
      speed: number;
      symbol: string;
      size: number;
      opacity: number;
    }[] = [];

    // Initialize drops
    for (let i = 0; i < density; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * -1, // Start above the screen
        speed: Math.random() * speed + 1,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: Math.floor(Math.random() * 20) + 14,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update each drop
      drops.forEach((drop, index) => {
        ctx.font = `${drop.size}px Arial`;
        ctx.fillStyle = `rgba(0, 255, 0, ${drop.opacity})`;
        ctx.fillText(drop.symbol, drop.x, drop.y);

        // Move drop down
        drop.y += drop.speed;

        // Reset drop if it goes off screen
        if (drop.y > canvas.height) {
          drop.y = Math.random() * canvas.height * -1; // Reset to above the screen
          drop.x = Math.random() * canvas.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, density, speed]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default MoneyRain;
