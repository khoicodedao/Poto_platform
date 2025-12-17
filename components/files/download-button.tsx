"use client";

import { useTransition } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { incrementDownload } from "@/lib/actions/files";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type DownloadButtonProps = {
  fileId: number;
  fileUrl: string;
} & ButtonProps;

export function DownloadButton({
  fileId,
  fileUrl,
  children,
  ...buttonProps
}: DownloadButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleClick = () => {
    if (!fileUrl) {
      toast({
        title: "Không tìm thấy tệp",
        description: "Đường dẫn tải xuống không hợp lệ.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await incrementDownload(fileId);

      if (!result.success) {
        toast({
          title: "Không thể tải tệp",
          description: result.error ?? "Vui lòng thử lại.",
          variant: "destructive",
        });
        return;
      }

      window.open(fileUrl, "_blank", "noopener");
    });
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending || buttonProps.disabled}
      {...buttonProps}
    >
      <Download className="mr-2 h-4 w-4" />
      {children ?? (isPending ? "Đang mở..." : "Tải về")}
    </Button>
  );
}
