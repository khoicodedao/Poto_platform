"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Calendar, BookOpen } from "lucide-react";

interface TAClassCardProps {
    classId: number;
    className: string;
    description?: string | null;
    teacherName?: string | null;
    schedule?: string | null;
    color?: string;
    permissions: {
        canMarkAttendance?: boolean;
        canManageMaterials?: boolean;
        canGradeAssignments?: boolean;
        canManageSessions?: boolean;
    };
}

export function TAClassCard({
    classId,
    className,
    description,
    teacherName,
    schedule,
    color = "#3b82f6",
    permissions,
}: TAClassCardProps) {
    return (
        <Card
            className="hover:shadow-lg transition-shadow border-t-4"
            style={{ borderTopColor: color }}
        >
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-2"
                            style={{ backgroundColor: color }}
                        >
                            {className}
                        </div>
                        <CardTitle className="text-xl">{className}</CardTitle>
                        {description && (
                            <p className="text-sm text-gray-600 mt-2">{description}</p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Teacher */}
                {teacherName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Giảng viên: <strong>{teacherName}</strong></span>
                    </div>
                )}

                {/* Schedule */}
                {schedule && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{schedule}</span>
                    </div>
                )}

                {/* Permissions */}
                <div>
                    <p className="text-sm font-semibold mb-2">Quyền hạn:</p>
                    <div className="flex flex-wrap gap-2">
                        {permissions.canMarkAttendance && (
                            <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                Điểm danh
                            </Badge>
                        )}
                        {permissions.canManageMaterials && (
                            <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                Tài liệu
                            </Badge>
                        )}
                        {permissions.canGradeAssignments && (
                            <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                Chấm bài
                            </Badge>
                        )}
                        {permissions.canManageSessions && (
                            <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                Buổi học
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t flex flex-wrap gap-2">
                    <Link href={`/classes/${classId}`}>
                        <Button size="sm" variant="outline">
                            <BookOpen className="w-4 h-4 mr-1" />
                            Xem Lớp
                        </Button>
                    </Link>
                    {permissions.canMarkAttendance && (
                        <Link href={`/classes/${classId}/sessions`}>
                            <Button size="sm" variant="outline">
                                Buổi Học
                            </Button>
                        </Link>
                    )}
                    {permissions.canManageMaterials && (
                        <Link href={`/classes/${classId}/materials`}>
                            <Button size="sm" variant="outline">
                                Tài Liệu
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
