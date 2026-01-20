"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  count: number;
  className?: string;
}

export function StreakCounter({ count, className }: StreakCounterProps) {
  const isActive = count > 0;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-bold transition-all",
      isActive 
        ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg hover:scale-105" 
        : "bg-gray-100 text-gray-400",
      className
    )}>
      <Flame 
        className={cn(
          "h-6 w-6 transition-all",
          isActive && "animate-pulse"
        )} 
      />
      <div className="flex flex-col">
        <span className="text-2xl leading-none">{count}</span>
        <span className="text-xs leading-none opacity-90">ngày</span>
      </div>
    </div>
  );
}

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak?: number;
  className?: string;
}

export function StreakDisplay({ currentStreak, longestStreak, className }: StreakDisplayProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Chuỗi Học</span>
        {longestStreak && longestStreak > 0 && (
          <span className="text-xs text-gray-500">Kỷ lục: {longestStreak} ngày</span>
        )}
      </div>
      <StreakCounter count={currentStreak} />
      {currentStreak > 0 && (
        <p className="text-sm text-gray-600">
          {currentStreak >= 30 && "🔥 Streak tuyệt vời! Không ngừng nghỉ nào!"}
          {currentStreak >= 7 && currentStreak < 30 && "🎉 Tuần thứ nhất hoàn thành! Tiếp tục phát huy!"}
          {currentStreak > 0 && currentStreak < 7 && "💪 Khởi đầu tốt! Giữ vững nhé!"}
        </p>
      )}
    </div>
  );
}
