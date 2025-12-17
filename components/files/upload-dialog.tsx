"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadClassFile } from "@/lib/actions/files";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

type ClassOption = {
  id: number;
  title: string;
};

type UploadFileDialogProps = {
  classes: ClassOption[];
};

export function UploadFileDialog({ classes }: UploadFileDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>(
    classes[0]?.id ? String(classes[0].id) : ""
  );
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      toast({
        title: "Thiếu tệp tải lên",
        description: "Vui lòng chọn tệp trước khi gửi.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedClass) {
      toast({
        title: "Chưa chọn lớp",
        description: "Vui lòng chọn lớp mà bạn muốn chia sẻ tài liệu.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("classId", selectedClass);
      formData.append("file", file);
      if (fileName.trim().length > 0) {
        formData.append("displayName", fileName.trim());
      }

      const result = await uploadClassFile(formData);

      if (result.success) {
        toast({
          title: "Tải tài liệu thành công",
          description: "Tài liệu đã sẵn sàng cho học viên.",
        });
        setOpen(false);
        setFile(null);
        setFileName("");
      } else {
        toast({
          title: "Không thể tải tài liệu",
          description: result.error ?? "Vui lòng thử lại sau.",
          variant: "destructive",
        });
      }
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    setFile(nextFile ?? null);
    if (nextFile && !fileName) {
      setFileName(nextFile.name);
    }
  };

  const disabled = classes.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Upload className="mr-2 h-4 w-4" />
          Tải tài liệu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tải tài liệu lên lớp học</DialogTitle>
          <DialogDescription>
            Chọn lớp học và đính kèm tệp bạn muốn chia sẻ cho học viên.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Lớp học</Label>
            <Select
              disabled={disabled}
              value={selectedClass}
              onValueChange={setSelectedClass}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp học" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={String(cls.id)}>
                    {cls.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Tên hiển thị</Label>
            <Input
              id="displayName"
              placeholder="Ví dụ: Tài liệu chương 1"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Tệp tải lên</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.mp4,.mp3,.wav,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang tải..." : "Tải lên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
