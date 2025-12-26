"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentFeedbackFormProps {
  sessionId: number;
  studentId: number;
  studentName: string;
  onSuccess?: () => void;
  initial?: {
    feedbackText?: string;
    rating?: number;
  } | null;
}

export function StudentFeedbackForm({
  sessionId,
  studentId,
  studentName,
  onSuccess,
  initial = null,
}: StudentFeedbackFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    feedbackText: "",
    rating: 5,
  });
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // populate when initial changes (edit mode)
  useEffect(() => {
    if (initial) {
      setFormData({
        feedbackText: initial.feedbackText || "",
        rating: initial.rating ?? 5,
      });
    }
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/student-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          studentId,
          feedbackText: formData.feedbackText,
          rating: formData.rating,
        }),
      });

      if (!response.ok) throw new Error("Failed to save feedback");

      toast({
        title: "Thành công",
        description: "Đánh giá được lưu thành công",
      });

      setFormData({
        feedbackText: "",
        rating: 5,
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StarRating = () => {
    const displayRating = hoveredStar !== null ? hoveredStar : formData.rating;

    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              className="transition-all duration-200 hover:scale-125 focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${star <= displayRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-300"
                  } transition-colors duration-200`}
              />
            </button>
          ))}
        </div>
        <span className="text-lg font-bold text-gray-700 ml-2">
          {formData.rating}/5 sao
        </span>
      </div>
    );
  };

  return (
    <Card className="p-6 mb-4 border-2 shadow-md">
      <h3 className="text-lg font-bold mb-4 text-gray-800">
        Đánh giá học sinh - {studentName}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Xếp hạng
          </Label>
          <div className="mt-3">
            <StarRating />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Click vào sao để đánh giá (1 sao = Kém, 5 sao = Xuất sắc)
          </p>
        </div>

        <div>
          <Label className="text-base font-semibold">Nhận xét chi tiết</Label>
          <Textarea
            value={formData.feedbackText}
            onChange={(e) =>
              setFormData({ ...formData, feedbackText: e.target.value })
            }
            placeholder="Viết nhận xét về hiệu suất học tập, thái độ, mức độ tham gia của học sinh..."
            className="mt-2 min-h-[120px]"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold"
        >
          {isLoading ? "Đang lưu..." : "Lưu Đánh Giá"}
        </Button>
      </form>
    </Card>
  );
}
