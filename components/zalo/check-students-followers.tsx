"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
    Users,
    CheckCircle2,
    XCircle,
    Loader2,
    Link2,
    UserX,
} from "lucide-react";

type ClassOption = {
    id: number;
    name: string;
};

type StudentStatus = {
    id: number;
    name: string;
    email: string;
    zaloUserId: string | null;
    hasConnected: boolean;
    isFollowing: boolean;
    status: "following" | "not_following" | "not_connected";
};

type CheckStudentsFollowersProps = {
    classes: ClassOption[];
    defaultClassId?: number;
};

export function CheckStudentsFollowers({
    classes,
    defaultClassId,
}: CheckStudentsFollowersProps) {
    const [selectedClass, setSelectedClass] = useState<string>(
        defaultClassId ? String(defaultClassId) : ""
    );
    const [isLoading, setIsLoading] = useState(false);
    const [students, setStudents] = useState<StudentStatus[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [totalFollowers, setTotalFollowers] = useState<number>(0);
    const { toast } = useToast();

    const handleCheck = async () => {
        if (!selectedClass) {
            toast({
                title: "Chưa chọn lớp",
                description: "Vui lòng chọn lớp để kiểm tra.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/zalo/check-students-followers?classId=${selectedClass}`
            );
            const result = await response.json();

            if (result.success) {
                setStudents(result.students);
                setSummary(result.summary);
                setTotalFollowers(result.totalFollowers);
                toast({
                    title: "Kiểm tra thành công",
                    description: `Đã kiểm tra ${result.total} học viên`,
                });
            } else {
                toast({
                    title: "Không thể kiểm tra",
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể kết nối đến máy chủ.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (student: StudentStatus) => {
        if (!student.hasConnected) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    <UserX className="h-3 w-3" />
                    Chưa kết nối Zalo
                </span>
            );
        }

        if (student.isFollowing) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Đã follow OA
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
                <XCircle className="h-3 w-3" />
                Chưa follow OA
            </span>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Kiểm tra Học viên đã Follow OA
                </CardTitle>
                <CardDescription>
                    Xem học viên nào đã kết nối Zalo và follow Official Account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Class selector and check button */}
                <div className="flex gap-2">
                    <Select
                        value={selectedClass}
                        onValueChange={setSelectedClass}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Chọn lớp học" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((cls) => (
                                <SelectItem key={cls.id} value={String(cls.id)}>
                                    {cls.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={handleCheck} disabled={isLoading || !selectedClass}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang kiểm tra...
                            </>
                        ) : (
                            <>
                                <Users className="mr-2 h-4 w-4" />
                                Kiểm tra
                            </>
                        )}
                    </Button>
                </div>

                {/* Summary statistics */}
                {summary && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg bg-blue-50 p-3">
                            <div className="text-2xl font-bold text-blue-700">
                                {summary.total}
                            </div>
                            <div className="text-xs text-blue-600">Tổng học viên</div>
                        </div>

                        <div className="rounded-lg bg-green-50 p-3">
                            <div className="text-2xl font-bold text-green-700">
                                {summary.following}
                            </div>
                            <div className="text-xs text-green-600">Đã follow OA</div>
                        </div>

                        <div className="rounded-lg bg-orange-50 p-3">
                            <div className="text-2xl font-bold text-orange-700">
                                {summary.connected}
                            </div>
                            <div className="text-xs text-orange-600">Đã kết nối Zalo</div>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3">
                            <div className="text-2xl font-bold text-gray-700">
                                {summary.notConnected}
                            </div>
                            <div className="text-xs text-gray-600">Chưa kết nối</div>
                        </div>
                    </div>
                )}

                {/* OA Followers total */}
                {totalFollowers > 0 && (
                    <div className="rounded-lg bg-purple-50 p-3 text-sm text-purple-800">
                        <strong>📊 Tổng số followers OA:</strong> {totalFollowers} người
                    </div>
                )}

                {/* Students list */}
                {students.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-medium">Danh sách học viên:</h3>
                        <div className="max-h-96 space-y-2 overflow-y-auto">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">{student.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {student.email}
                                        </div>
                                        {student.zaloUserId && (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Zalo ID: {student.zaloUserId}
                                            </div>
                                        )}
                                    </div>
                                    <div>{getStatusBadge(student)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {students.length === 0 && summary && (
                    <div className="py-8 text-center text-muted-foreground">
                        Không có học viên nào trong lớp này
                    </div>
                )}

                {/* Instructions */}
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                    <p className="font-medium">💡 Hướng dẫn:</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>Chọn lớp và click "Kiểm tra" để xem trạng thái</li>
                        <li>
                            <strong>Chưa kết nối Zalo:</strong> Học viên chưa nhập Zalo ID
                        </li>
                        <li>
                            <strong>Chưa follow OA:</strong> Đã kết nối nhưng chưa follow
                        </li>
                        <li>
                            <strong>Đã follow OA:</strong> Sẵn sàng nhận thông báo
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
