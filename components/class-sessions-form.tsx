"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ClassSessionFormProps {
  classId: number;
  onSuccess?: () => void;
}

export function ClassSessionForm({
  classId,
  onSuccess,
}: ClassSessionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    durationMinutes: 60,
    roomId: "",
    platformUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/class-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          classId,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create session");

      toast({
        title: "Success",
        description: "Class session created successfully",
      });

      setFormData({
        title: "",
        description: "",
        scheduledAt: "",
        durationMinutes: 60,
        roomId: "",
        platformUrl: "",
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
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Tạo Buổi Học Mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Tiêu đề buổi học</Label>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="VD: Buổi học tiếp theo"
            required
          />
        </div>

        <div>
          <Label>Mô tả</Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Nội dung buổi học"
          />
        </div>

        <div>
          <Label>Thời gian</Label>
          <Input
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) =>
              setFormData({ ...formData, scheduledAt: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label>Thời lượng (phút)</Label>
          <Input
            type="number"
            value={formData.durationMinutes}
            onChange={(e) =>
              setFormData({
                ...formData,
                durationMinutes: parseInt(e.target.value),
              })
            }
          />
        </div>

        <div>
          <Label>Phòng học</Label>
          <Input
            value={formData.roomId}
            onChange={(e) =>
              setFormData({ ...formData, roomId: e.target.value })
            }
            placeholder="VD: Phòng 101"
          />
        </div>

        <div>
          <Label>Link Platform (LiveKit)</Label>
          <Input
            value={formData.platformUrl}
            onChange={(e) =>
              setFormData({ ...formData, platformUrl: e.target.value })
            }
            placeholder="https://livekit-server..."
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Đang tạo..." : "Tạo Buổi Học"}
        </Button>
      </form>
    </Card>
  );
}
