"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, User } from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  enrolledAt?: string;
  status?: string;
}

interface StudentsListProps {
  classId: number;
}

export function StudentsList({ classId }: StudentsListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}/students`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const result = await response.json();
      const studentsData = result.data || result.students || result;
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch students",
        variant: "destructive",
      });
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (students.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 mb-4">Chưa có học sinh nào trong lớp</p>
        <Button>Thêm Học Sinh</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên Học Sinh</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ngày Tham Gia</TableHead>
                <TableHead>Trạng Thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {student.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {student.email}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {student.enrolledAt
                      ? new Date(student.enrolledAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {student.status || "Đang Học"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {students.map((student) => (
          <Card key={student.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 mt-1">
                <AvatarFallback>
                  {student.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{student.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Mail className="h-3 w-3" />
                  {student.email}
                </div>
                <div className="mt-2">
                  <Badge variant="outline">
                    {student.status || "Đang Học"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
