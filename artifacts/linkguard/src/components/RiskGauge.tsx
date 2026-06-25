import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function RiskGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Simple animation for the score number
    const duration = 1000;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // easeOutExpo
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedScore(Math.round(score * easing));
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepTime);
    
    return () => clearInterval(interval);
  }, [score]);

  // Determine color based on score
  let color = "hsl(150 80% 50%)"; // safe (green)
  let glowClass = "glow-safe";
  if (score > 30 && score <= 70) {
    color = "hsl(45 90% 55%)"; // warning (amber)
    glowClass = "glow-warning";
  } else if (score > 70) {
    color = "hsl(0 84% 60%)"; // danger (red)
    glowClass = "glow-destructive";
  }

  // Calculate SVG arc
  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <div className={`relative flex items-center justify-center w-48 h-48 rounded-full ${glowClass} bg-background/50 border border-border/50`}>
        <svg
          height={radius * 2}
          width={radius * 2}
          className="absolute transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset: 0 }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-muted"
          />
          {/* Progress circle */}
          <motion.circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-tighter" style={{ color }}>
            {animatedScore}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">درجة الخطر</span>
        </div>
      </div>
    </div>
  );
}