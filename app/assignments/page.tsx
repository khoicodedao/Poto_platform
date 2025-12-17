import Link from "next/link";
import { redirect } from "next/navigation";
import { getAssignments, getMySubmissions } from "@/lib/actions/assignments";
import { getCurrentSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Upload,
} from "lucide-react";

type EnrichedAssignment = Awaited<ReturnType<typeof getAssignments>>[number] & {
  submission?: Awaited<ReturnType<typeof getMySubmissions>>[number];
};

const getStatusBadge = (assignment: EnrichedAssignment, isStudent: boolean) => {
  if (!isStudent) {
    return (
      <Badge variant="secondary" className="text-blue-700">
        Đã giao
      </Badge>
    );
  }

  if (assignment.submission?.status === "graded") {
    return (
      <Badge variant="default" className="bg-green-600">
        Đã chấm
      </Badge>
    );
  }

  if (assignment.submission) {
    return <Badge variant="default">Đã nộp</Badge>;
  }

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  if (dueDate && dueDate.getTime() < Date.now()) {
    return <Badge variant="destructive">Quá hạn</Badge>;
  }

  return <Badge variant="outline">Chưa nộp</Badge>;
};

const formatDateTime = (value?: Date | string | null) => {
  if (!value) return "Chưa cập nhật";
  const date = value instanceof Date ? value : new Date(value);
  return `${date.toLocaleDateString("vi-VN")} • ${date.toLocaleTimeString(
    "vi-VN",
    { hour: "2-digit", minute: "2-digit" }
  )}`;
};

export default async function AssignmentsPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/auth/signin");
  }
  const { user } = session;

  const [assignments, submissions] = await Promise.all([
    getAssignments(),
    user.role === "student" ? getMySubmissions() : Promise.resolve([]),
  ]);

  const submissionMap = new Map(
    (submissions as Awaited<ReturnType<typeof getMySubmissions>>).map(
      (submission) => [submission.assignmentId, submission]
    )
  );

  const enrichedAssignments: EnrichedAssignment[] = assignments.map(
    (assignment) => ({
      ...assignment,
      submission: submissionMap.get(assignment.id),
    })
  );

  const isStudent = user.role === "student";

  const pendingAssignments = enrichedAssignments.filter((assignment) => {
    if (!isStudent) return false;
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    return !assignment.submission && (!dueDate || dueDate >= new Date());
  });

  const completedAssignments = enrichedAssignments.filter((assignment) => {
    if (!isStudent) return false;
    return Boolean(assignment.submission);
  });

  const overdueAssignments = enrichedAssignments.filter((assignment) => {
    if (!isStudent) return false;
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    return !assignment.submission && dueDate !== null && dueDate < new Date();
  });

  const summaryCards = [
    {
      Icon: FileText,
      label: "Tổng bài tập",
      value: enrichedAssignments.length,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      Icon: Clock,
      label: "Chưa nộp",
      value: pendingAssignments.length,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      Icon: CheckCircle,
      label: "Đã hoàn thành",
      value: completedAssignments.length,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      Icon: AlertCircle,
      label: "Quá hạn",
      value: overdueAssignments.length,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ] as const;

  const renderAssignmentCard = (assignment: EnrichedAssignment) => {
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const isOverdue =
      dueDate !== null && dueDate.getTime() < Date.now() && !assignment.submission;

    return (
      <Card key={assignment.id}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">
                <Link href={`/assignments/${assignment.id}`} className="hover:underline">
                  {assignment.title}
                </Link>
              </CardTitle>
              <CardDescription>
                {assignment.className ?? "Lớp học"}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(assignment, isStudent)}
              <Badge variant="outline">{assignment.maxScore ?? 100} điểm</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600">
          <p className="text-gray-700">{assignment.description}</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDateTime(assignment.dueDate)}
            </div>
            {assignment.submission?.submittedAt && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Đã nộp: {formatDateTime(assignment.submission.submittedAt)}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isStudent ? (
              assignment.submission ? (
                <Link href={`/assignments/${assignment.id}/view`}>
                  <Button size="sm" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Xem bài đã nộp
                  </Button>
                </Link>
              ) : (
                <Link href={`/assignments/${assignment.id}/submit`}>
                  <Button size="sm" variant={isOverdue ? "destructive" : "default"}>
                    <Upload className="mr-2 h-4 w-4" />
                    {isOverdue ? "Nộp muộn" : "Nộp bài"}
                  </Button>
                </Link>
              )
            ) : (
              <Link href={`/assignments/${assignment.id}/edit`}>
                <Button size="sm" variant="outline">
                  Chỉnh sửa
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.Icon;
            return (
              <Card key={card.label}>
                <CardContent className="flex items-center space-x-4 p-6">
                  <div className={`rounded-lg p-2 ${card.bg}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {card.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section>
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="all">Tất cả ({enrichedAssignments.length})</TabsTrigger>
              {isStudent && (
                <>
                  <TabsTrigger value="pending">
                    Chưa nộp ({pendingAssignments.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Đã nộp ({completedAssignments.length})
                  </TabsTrigger>
                  <TabsTrigger value="overdue">
                    Quá hạn ({overdueAssignments.length})
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {enrichedAssignments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    Chưa có bài tập nào.
                  </CardContent>
                </Card>
              ) : (
                enrichedAssignments.map((assignment) =>
                  renderAssignmentCard(assignment)
                )
              )}
            </TabsContent>

            {isStudent && (
              <>
                <TabsContent value="pending" className="space-y-4">
                  {pendingAssignments.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        Không có bài tập nào cần nộp.
                      </CardContent>
                    </Card>
                  ) : (
                    pendingAssignments.map((assignment) =>
                      renderAssignmentCard(assignment)
                    )
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  {completedAssignments.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        Bạn chưa nộp bài tập nào.
                      </CardContent>
                    </Card>
                  ) : (
                    completedAssignments.map((assignment) =>
                      renderAssignmentCard(assignment)
                    )
                  )}
                </TabsContent>

                <TabsContent value="overdue" className="space-y-4">
                  {overdueAssignments.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        Không có bài tập quá hạn.
                      </CardContent>
                    </Card>
                  ) : (
                    overdueAssignments.map((assignment) =>
                      renderAssignmentCard(assignment)
                    )
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </section>
      </main>
    </div>
  );
}
