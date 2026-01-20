"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface XPBarProps {
  currentXP: number;
  targetXP: number;
  level: number;
  className?: string;
  showLabel?: boolean;
}

export function XPBar({ currentXP, targetXP, level, className, showLabel = true }: XPBarProps) {
  const percentage = Math.min((currentXP / targetXP) * 100, 100);
  
  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-sm font-bold text-white shadow-md">
              {level}
            </div>
            <span className="text-sm font-semibold text-gray-700">Level {level}</span>
          </div>
          <span className="text-xs text-gray-500">{currentXP} / {targetXP} XP</span>
        </div>
      )}
      
      <div className="relative">
        <Progress 
          value={percentage} 
          showGlow
          className="h-4"
        />
        {percentage >= 100 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-md">LEVEL UP!</span>
          </div>
        )}
      </div>
      
      {showLabel && percentage >= 80 && percentage < 100 && (
        <p className="text-xs text-gray-600">Sắp lên level rồi! 🎉</p>
      )}
    </div>
  );
}

interface CircularXPProps {
  currentXP: number;
  targetXP: number;
  level: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CircularXP({ currentXP, targetXP, level, size = "md", className }: CircularXPProps) {
  const percentage = Math.min((currentXP / targetXP) * 100, 100);
  const circumference = 2 * Math.PI * 45; // r=45
  const offset = circumference - (percentage / 100) * circumference;
  
  const sizeClasses = {
    sm: "h-20 w-20",
    md: "h-32 w-32",
    lg: "h-40 w-40"
  };
  
  const textSizeClasses = {
    sm: "text-lg",
    md: "text-3xl",
    lg: "text-4xl"
  };
  
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg className="h-full w-full -rotate-90 transform">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="url(#xp-gradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        <defs>
          <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--duo-green))" />
            <stop offset="50%" stopColor="hsl(var(--duo-blue))" />
            <stop offset="100%" stopColor="hsl(var(--duo-yellow))" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold text-gray-800", textSizeClasses[size])}>
          {level}
        </span>
        <span className="text-xs text-gray-500">Level</span>
      </div>
    </div>
  );
}
