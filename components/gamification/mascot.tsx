"use client";

import { GraduationCap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MascotProps {
  message?: string;
  className?: string;
  mood?: "happy" | "celebrating" | "encouraging" | "thinking";
}

export function Mascot({ message = "Chào bạn!", className, mood = "happy" }: MascotProps) {
  const moodEmoji = {
    happy: "😊",
    celebrating: "🎉",
    encouraging: "💪",
    thinking: "🤔"
  };
  
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
          <span className="text-3xl">{moodEmoji[mood]}</span>
        </div>
        {mood === "celebrating" && (
          <Sparkles className="absolute -right-1 -top-1 h-5 w-5 animate-pulse text-yellow-400" />
        )}
      </div>
      
      {message && (
        <div className="relative flex-1 rounded-2xl bg-white p-4 shadow-md">
          {/* Speech bubble arrow */}
          <div className="absolute -left-2 top-4 h-4 w-4 rotate-45 bg-white" />
          
          <p className="relative text-sm font-medium text-gray-700">{message}</p>
        </div>
      )}
    </div>
  );
}

interface MascotHeaderProps {
  userName?: string;
}

export function MascotHeader({ userName }: MascotHeaderProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const messages = [
    `${greeting}${userName ? `, ${userName}` : ""}! Sẵn sàng học chưa?`,
    "Hôm nay bạn có mục tiêu gì nhỉ?",
    "Bắt đầu học thôi nào! 🚀",
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  return <Mascot message={randomMessage} mood="happy" className="mb-6" />;
}
