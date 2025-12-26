"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface DeleteUnitDialogProps {
    unitId: number;
    unitTitle: string;
    materialsCount: number;
    onSuccess?: () => void;
    triggerButton?: React.ReactNode;
}

export function DeleteUnitDialog({
    unitId,
    unitTitle,
    materialsCount,
    onSuccess,
    triggerButton,
}: DeleteUnitDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/units/${unitId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete unit");

            toast({
                title: "Thành công",
                description: "Đã xóa unit",
            });

            setOpen(false);

            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa unit",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {triggerButton || (
                    <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa Unit
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa unit</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>
                            Bạn có chắc chắn muốn xóa unit <strong>"{unitTitle}"</strong>?
                        </p>
                        {materialsCount > 0 && (
                            <p className="text-red-600 font-semibold">
                                ⚠️ Unit này có {materialsCount} tài liệu. Tất cả tài liệu sẽ bị xóa cùng!
                            </p>
                        )}
                        <p className="text-red-600 font-semibold">
                            Hành động này không thể hoàn tác!
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isDeleting ? "Đang xóa..." : "Xóa Unit"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
