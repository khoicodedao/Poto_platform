"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface StudentFeedbackFormProps {
  sessionId: number;
  studentId: number;
  studentName: string;
  onSuccess?: () => void;
  initial?: {
    feedbackText?: string;
    attitudeScore?: number;
    participationLevel?: string;
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
    attitudeScore: 5,
    participationLevel: "medium",
  });

  // populate when initial changes (edit mode)
  useEffect(() => {
    if (initial) {
      setFormData({
        feedbackText: initial.feedbackText || "",
        attitudeScore: initial.attitudeScore ?? 5,
        participationLevel: initial.participationLevel || "medium",
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
          ...formData,
          attitudeScore: parseInt(formData.attitudeScore.toString()),
        }),
      });

      if (!response.ok) throw new Error("Failed to save feedback");

      toast({
        title: "Success",
        description: "Nhận xét được lưu thành công",
      });

      setFormData({
        feedbackText: "",
        attitudeScore: 5,
        participationLevel: "medium",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-4">
      <h3 className="text-lg font-bold mb-4">Nhận xét - {studentName}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Nhận xét</Label>
          <Textarea
            value={formData.feedbackText}
            onChange={(e) =>
              setFormData({ ...formData, feedbackText: e.target.value })
            }
            placeholder="Viết nhận xét về học sinh..."
            required
          />
        </div>

        <div>
          <Label>Điểm Thái Độ (1-10)</Label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.attitudeScore}
            onChange={(e) =>
              setFormData({
                ...formData,
                attitudeScore: parseInt(e.target.value),
              })
            }
            className="w-full"
          />
          <div className="text-center text-lg font-bold mt-2">
            {formData.attitudeScore}/10
          </div>
        </div>

        <div>
          <Label>Mức Độ Tham Gia</Label>
          <Select
            value={formData.participationLevel}
            onValueChange={(value) =>
              setFormData({ ...formData, participationLevel: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Cao</SelectItem>
              <SelectItem value="medium">Trung Bình</SelectItem>
              <SelectItem value="low">Thấp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Đang lưu..." : "Lưu Nhận Xét"}
        </Button>
      </form>
    </Card>
  );
}
