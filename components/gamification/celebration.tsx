"use client";

import confetti from "canvas-confetti";

export type CelebrationSize = "small" | "medium" | "large" | "mega";

export const celebrate = (size: CelebrationSize = "medium") => {
  const count = size === "small" ? 50 : size === "medium" ? 100 : size === "large" ? 200 : 400;
  const spread = size === "small" ? 40 : size === "medium" ? 60 : size === "large" ? 90 : 120;
  
  confetti({
    particleCount: count,
    spread: spread,
    origin: { y: 0.6 },
    colors: ['#58CC02', '#1CB0F6', '#FFCD00', '#FF9A00', '#CE67E9'],
  });
};

export const celebrateStreak = () => {
  // Fire-like effect for streaks
  const duration = 15 * 100;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#FF9A00', '#FFCD00', '#EA2B2D'], // Fire colors
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#FF9A00', '#FFCD00', '#EA2B2D'],
    });
  }, 250);
};

export const celebrateLevelUp = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      colors: ['#58CC02', '#1CB0F6', '#CE67E9'],
    });
  }, 250);
};

interface CelebrationProps {
  type?: CelebrationSize | "streak" | "levelup";
  trigger?: boolean;
}

export function Celebration({ type = "medium", trigger = false }: CelebrationProps) {
  if (trigger) {
    if (type === "streak") {
      celebrateStreak();
    } else if (type === "levelup") {
      celebrateLevelUp();
    } else {
      celebrate(type as CelebrationSize);
    }
  }
  
  return null;
}
