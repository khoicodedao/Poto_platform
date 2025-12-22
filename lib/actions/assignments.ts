"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import {
  db,
  assignments,
  assignmentSubmissions,
  users,
  classes,
  classEnrollments,
} from "@/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthUser } from "@/lib/auth";

type AssignmentRecord = {
  id: number;
  title: string;
  description: string | null;
  classId: number;
  className: string | null;
  classDescription: string | null;
  classSchedule: string | null;
  dueDate: Date | null;
  maxScore: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  teacherId: number | null;
  teacherName: string | null;
  teacherEmail: string | null;
};

const sanitizeFileName = (input: string) => {
  return (
    input
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "submission"
  );
};

async function fetchAssignmentRecord(
  id: number
): Promise<AssignmentRecord | null> {
  const [record] = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      classId: assignments.classId,
      className: classes.name,
      classDescription: classes.description,
      classSchedule: classes.schedule,
      dueDate: assignments.dueDate,
      maxScore: assignments.maxScore,
      createdAt: assignments.createdAt,
      updatedAt: assignments.updatedAt,
      teacherId: classes.teacherId,
      teacherName: users.name,
      teacherEmail: users.email,
    })
    .from(assignments)
    .leftJoin(classes, eq(assignments.classId, classes.id))
    .leftJoin(users, eq(classes.teacherId, users.id))
    .where(eq(assignments.id, id))
    .limit(1);

  return record ?? null;
}

async function isStudentEnrolled(classId: number, studentId: number) {
  const [enrollment] = await db
    .select({ id: classEnrollments.id })
    .from(classEnrollments)
    .where(
      and(
        eq(classEnrollments.classId, classId),
        eq(classEnrollments.studentId, studentId)
      )
    )
    .limit(1);

  return Boolean(enrollment);
}

async function removeStoredFile(fileUrl?: string | null) {
  if (!fileUrl || !fileUrl.startsWith("/submissions")) {
    return;
  }

  try {
    const absolute = path.join(process.cwd(), "public", fileUrl);
    await unlink(absolute);
  } catch (error) {
    // Ignore missing files
    console.warn("Could not remove submission file", error);
  }
}

async function storeSubmissionFile(
  file: File,
  assignmentId: number,
  studentId: number
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext =
    path.extname(file.name) ||
    (file.type ? `.${file.type.split("/").pop()}` : "");
  const baseName = sanitizeFileName(
    path.basename(file.name, path.extname(file.name))
  );
  const storedName = `${Date.now()}-${baseName}${ext}`;
  const baseDir = path.join(
    process.cwd(),
    "public",
    "submissions",
    `${assignmentId}`,
    `${studentId}`
  );
  await mkdir(baseDir, { recursive: true });
  await writeFile(path.join(baseDir, storedName), buffer);
  return `/submissions/${assignmentId}/${studentId}/${storedName}`;
}

async function submitAssignmentInternal(
  user: AuthUser,
  assignmentId: number,
  content: string,
  fileUrl?: string | null
) {
  if (user.role !== "student") {
    return { success: false, error: "Chỉ học viên mới có thể nộp bài tập" };
  }

  const assignment = await fetchAssignmentRecord(assignmentId);
  if (!assignment) {
    return { success: false, error: "Không tìm thấy bài tập" };
  }

  const enrolled = await isStudentEnrolled(assignment.classId, user.id);
  if (!enrolled) {
    return { success: false, error: "Bạn không thuộc lớp học này" };
  }

  const safeContent = (content ?? "").trim();
  if (!safeContent && !fileUrl) {
    return {
      success: false,
      error: "Vui lòng nhập nội dung hoặc đính kèm tệp",
    };
  }

  const [existing] = await db
    .select({
      id: assignmentSubmissions.id,
      fileUrl: assignmentSubmissions.fileUrl,
    })
    .from(assignmentSubmissions)
    .where(
      and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.studentId, user.id)
      )
    )
    .limit(1);

  const now = new Date();
  const nextFileUrl = fileUrl ?? existing?.fileUrl ?? null;

  if (existing) {
    if (fileUrl && existing.fileUrl && existing.fileUrl !== fileUrl) {
      await removeStoredFile(existing.fileUrl);
    }

    await db
      .update(assignmentSubmissions)
      .set({
        content: safeContent,
        fileUrl: nextFileUrl,
        submittedAt: now,
        status: "submitted",
      })
      .where(eq(assignmentSubmissions.id, existing.id));
  } else {
    await db.insert(assignmentSubmissions).values({
      assignmentId,
      studentId: user.id,
      content: safeContent,
      fileUrl: nextFileUrl,
      submittedAt: now,
      status: "submitted",
    });
  }

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath(`/classes/${assignment.classId}`);
  return { success: true };
}

export interface CreateAssignmentData {
  title: string;
  description: string;
  classId: number;
  dueDate: Date;
  maxScore: number;
}

export async function getAssignments(classId?: number) {
  try {
    const user = await requireAuth();

    const fields = {
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      classId: assignments.classId,
      className: classes.name,
      dueDate: assignments.dueDate,
      maxScore: assignments.maxScore,
      createdAt: assignments.createdAt,
    };

    if (!classId && user.role === "student") {
      return await db
        .select(fields)
        .from(assignments)
        .innerJoin(
          classEnrollments,
          eq(classEnrollments.classId, assignments.classId)
        )
        .innerJoin(classes, eq(assignments.classId, classes.id))
        .where(eq(classEnrollments.studentId, user.id))
        .orderBy(desc(assignments.createdAt));
    }

    let query = db
      .select(fields)
      .from(assignments)
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .orderBy(desc(assignments.createdAt));

    if (classId) {
      query = query.where(eq(assignments.classId, classId));
    } else if (user.role === "teacher") {
      query = query.where(eq(classes.teacherId, user.id));
    }

    return await query;
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }
}

export async function getAssignmentById(id: number) {
  try {
    const assignment = await fetchAssignmentRecord(id);
    if (!assignment) {
      return null;
    }

    const {
      classDescription,
      classSchedule,
      teacherId,
      teacherName,
      teacherEmail,
      ...rest
    } = assignment;

    return {
      ...rest,
      classDescription,
      classSchedule,
      teacher: teacherId
        ? {
            id: teacherId,
            name: teacherName,
            email: teacherEmail,
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return null;
  }
}

export async function getAssignmentDetail(id: number) {
  try {
    const user = await requireAuth();
    const assignment = await fetchAssignmentRecord(id);

    if (!assignment) {
      return null;
    }

    if (user.role === "student") {
      const enrolled = await isStudentEnrolled(assignment.classId, user.id);
      if (!enrolled) {
        return null;
      }
    } else if (user.role === "teacher" && assignment.teacherId !== user.id) {
      return null;
    }

    const statsRows = await db
      .select({
        status: assignmentSubmissions.status,
        count: sql<number>`count(*)::int`,
      })
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.assignmentId, id))
      .groupBy(assignmentSubmissions.status);

    const stats = {
      totalSubmissions: 0,
      gradedSubmissions: 0,
      pendingSubmissions: 0,
    };

    for (const row of statsRows) {
      stats.totalSubmissions += row.count;
      if (row.status === "graded") {
        stats.gradedSubmissions += row.count;
      } else {
        stats.pendingSubmissions += row.count;
      }
    }

    let mySubmission: null | {
      id: number;
      status: string;
      score: number | null;
      feedback: string | null;
      content: string | null;
      fileUrl: string | null;
      submittedAt: Date | null;
      gradedAt: Date | null;
    } = null;

    if (user.role === "student") {
      const [submission] = await db
        .select({
          id: assignmentSubmissions.id,
          status: assignmentSubmissions.status,
          score: assignmentSubmissions.score,
          feedback: assignmentSubmissions.feedback,
          content: assignmentSubmissions.content,
          fileUrl: assignmentSubmissions.fileUrl,
          submittedAt: assignmentSubmissions.submittedAt,
          gradedAt: assignmentSubmissions.gradedAt,
        })
        .from(assignmentSubmissions)
        .where(
          and(
            eq(assignmentSubmissions.assignmentId, id),
            eq(assignmentSubmissions.studentId, user.id)
          )
        )
        .limit(1);

      mySubmission = submission ?? null;
    }

    let submissions: Array<{
      id: number;
      studentId: number;
      studentName: string | null;
      studentEmail: string | null;
      content: string | null;
      fileUrl: string | null;
      status: string;
      score: number | null;
      feedback: string | null;
      submittedAt: Date | null;
      gradedAt: Date | null;
    }> = [];

    if (user.role === "teacher" || user.role === "admin") {
      submissions = await db
        .select({
          id: assignmentSubmissions.id,
          studentId: assignmentSubmissions.studentId,
          studentName: users.name,
          studentEmail: users.email,
          content: assignmentSubmissions.content,
          fileUrl: assignmentSubmissions.fileUrl,
          status: assignmentSubmissions.status,
          score: assignmentSubmissions.score,
          feedback: assignmentSubmissions.feedback,
          submittedAt: assignmentSubmissions.submittedAt,
          gradedAt: assignmentSubmissions.gradedAt,
        })
        .from(assignmentSubmissions)
        .innerJoin(users, eq(assignmentSubmissions.studentId, users.id))
        .where(eq(assignmentSubmissions.assignmentId, id))
        .orderBy(desc(assignmentSubmissions.submittedAt));
    }

    return {
      ...assignment,
      stats,
      mySubmission,
      submissions:
        user.role === "teacher" || user.role === "admin"
          ? submissions
          : undefined,
    };
  } catch (error) {
    console.error("Error fetching assignment detail:", error);
    return null;
  }
}

export async function createAssignment(data: CreateAssignmentData) {
  try {
    const user = await requireAuth();

    if (user.role !== "teacher") {
      return { success: false, error: "Chỉ giáo viên mới có thể tạo bài tập" };
    }

    // Verify teacher owns the class
    const [classData] = await db
      .select({ teacherId: classes.teacherId })
      .from(classes)
      .where(eq(classes.id, data.classId))
      .limit(1);

    if (!classData || classData.teacherId !== user.id) {
      return {
        success: false,
        error: "Bạn không có quyền tạo bài tập cho lớp này",
      };
    }

    const [newAssignment] = await db
      .insert(assignments)
      .values({
        title: data.title,
        description: data.description,
        classId: data.classId,
        dueDate: data.dueDate,
        maxScore: data.maxScore,
        createdById: user.id,
      })
      .returning();

    revalidatePath("/assignments");
    revalidatePath(`/classes/${data.classId}`);
    return { success: true, id: newAssignment.id };
  } catch (error) {
    console.error("Error creating assignment:", error);
    return { success: false, error: "Không thể tạo bài tập" };
  }
}

export async function submitAssignment(
  assignmentId: number,
  content: string,
  fileUrl?: string | null
) {
  try {
    const user = await requireAuth();
    return await submitAssignmentInternal(user, assignmentId, content, fileUrl);
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return { success: false, error: "Không thể nộp bài tập" };
  }
}

export async function submitAssignmentWithUpload(formData: FormData) {
  try {
    const user = await requireAuth();
    const assignmentId = Number(formData.get("assignmentId"));

    if (!assignmentId || Number.isNaN(assignmentId)) {
      return { success: false, error: "Bài tập không hợp lệ" };
    }

    const content = (formData.get("content") as string | null) ?? "";
    const file = formData.get("file") as File | null;
    let storedFileUrl: string | null | undefined = undefined;

    if (file && file.size > 0) {
      storedFileUrl = await storeSubmissionFile(file, assignmentId, user.id);
    }

    return await submitAssignmentInternal(
      user,
      assignmentId,
      content,
      storedFileUrl ?? null
    );
  } catch (error) {
    console.error("Error submitting assignment with upload:", error);
    return { success: false, error: "Không thể nộp bài tập" };
  }
}

export async function gradeSubmission(
  submissionId: number,
  score: number,
  feedback: string
) {
  try {
    const user = await requireAuth();

    if (user.role !== "teacher" && user.role !== "admin") {
      return { success: false, error: "Chỉ giáo viên mới có thể chấm điểm" };
    }

    // Verify teacher owns the class (skip for admin)
    if (user.role === "teacher") {
      const [submission] = await db
        .select({
          assignmentId: assignmentSubmissions.assignmentId,
          teacherId: classes.teacherId,
        })
        .from(assignmentSubmissions)
        .innerJoin(
          assignments,
          eq(assignmentSubmissions.assignmentId, assignments.id)
        )
        .innerJoin(classes, eq(assignments.classId, classes.id))
        .where(eq(assignmentSubmissions.id, submissionId))
        .limit(1);

      if (!submission || submission.teacherId !== user.id) {
        return { success: false, error: "Bạn không có quyền chấm bài nộp này" };
      }
    }

    await db
      .update(assignmentSubmissions)
      .set({
        score,
        feedback,
        gradedAt: new Date(),
        status: "graded",
      })
      .where(eq(assignmentSubmissions.id, submissionId));

    revalidatePath("/assignments");
    return { success: true };
  } catch (error) {
    console.error("Error grading submission:", error);
    return { success: false, error: "Không thể chấm điểm" };
  }
}

export async function getMySubmissions(assignmentId?: number) {
  try {
    const user = await requireAuth();

    if (user.role !== "student") {
      return [];
    }

    const query = db
      .select({
        id: assignmentSubmissions.id,
        assignmentId: assignmentSubmissions.assignmentId,
        assignmentTitle: assignments.title,
        className: classes.name,
        content: assignmentSubmissions.content,
        fileUrl: assignmentSubmissions.fileUrl,
        status: assignmentSubmissions.status,
        score: assignmentSubmissions.score,
        feedback: assignmentSubmissions.feedback,
        submittedAt: assignmentSubmissions.submittedAt,
        gradedAt: assignmentSubmissions.gradedAt,
      })
      .from(assignmentSubmissions)
      .innerJoin(
        assignments,
        eq(assignmentSubmissions.assignmentId, assignments.id)
      )
      .leftJoin(classes, eq(assignments.classId, classes.id))
      .orderBy(desc(assignmentSubmissions.submittedAt));

    if (assignmentId) {
      return await query.where(
        and(
          eq(assignmentSubmissions.studentId, user.id),
          eq(assignmentSubmissions.assignmentId, assignmentId)
        )
      );
    }

    return await query.where(eq(assignmentSubmissions.studentId, user.id));
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }
}

export async function updateAssignment(
  assignmentId: number,
  data: Partial<CreateAssignmentData>
) {
  try {
    const user = await requireAuth();

    if (user.role !== "teacher" && user.role !== "admin") {
      return {
        success: false,
        error: "Chỉ giáo viên mới có thể chỉnh sửa bài tập",
      };
    }

    // Verify the assignment exists and belongs to the user
    const [assignment] = await db
      .select({
        id: assignments.id,
        classId: assignments.classId,
        createdById: assignments.createdById,
        teacherId: classes.teacherId,
      })
      .from(assignments)
      .leftJoin(classes, eq(assignments.classId, classes.id))
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (!assignment) {
      console.error(
        `Assignment ${assignmentId} not found. User ID: ${user.id}, Role: ${user.role}`
      );
      return { success: false, error: "Không tìm thấy bài tập" };
    }

    // Allow if user is Creator OR the Teacher of the class
    const isCreator = assignment.createdById === user.id;
    const isClassTeacher =
      user.role === "teacher" && assignment.teacherId === user.id;
    const isAdmin = user.role === "admin";

    if (!isCreator && !isClassTeacher && !isAdmin) {
      console.error(
        `Authorization failed for assignment ${assignmentId}. User ${user.id} is not creator or class teacher.`
      );
      return {
        success: false,
        error: "Bạn không có quyền chỉnh sửa bài tập này",
      };
    }

    await db
      .update(assignments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(assignments.id, assignmentId));

    revalidatePath("/assignments");
    revalidatePath(`/assignments/${assignmentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating assignment:", error);
    return { success: false, error: "Không thể cập nhật bài tập" };
  }
}

export async function deleteAssignment(assignmentId: number) {
  try {
    const user = await requireAuth();

    if (user.role !== "teacher" && user.role !== "admin") {
      return { success: false, error: "Chỉ giáo viên mới có thể xóa bài tập" };
    }

    // Verify the assignment exists and belongs to the user
    const [assignment] = await db
      .select({
        id: assignments.id,
        classId: assignments.classId,
        createdById: assignments.createdById,
        teacherId: classes.teacherId,
      })
      .from(assignments)
      .leftJoin(classes, eq(assignments.classId, classes.id))
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (!assignment) {
      return { success: false, error: "Không tìm thấy bài tập" };
    }

    // Allow if user is Creator OR the Teacher of the class
    const isCreator = assignment.createdById === user.id;
    const isClassTeacher =
      user.role === "teacher" && assignment.teacherId === user.id;
    const isAdmin = user.role === "admin";

    if (!isCreator && !isClassTeacher && !isAdmin) {
      return { success: false, error: "Bạn không có quyền xóa bài tập này" };
    }

    await db.delete(assignments).where(eq(assignments.id, assignmentId));

    revalidatePath("/assignments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return { success: false, error: "Không thể xóa bài tập" };
  }
}

export async function deleteSubmission(submissionId: number) {
  try {
    const user = await requireAuth();

    // Get submission details
    const [submission] = await db
      .select()
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return { success: false, error: "Không tìm thấy bài nộp" };
    }

    // Students can only delete their own submissions
    if (user.role === "student" && submission.studentId !== user.id) {
      return { success: false, error: "Bạn không có quyền xóa bài nộp này" };
    }

    // Teachers can only delete submissions from their classes
    if (user.role === "teacher") {
      const [assignment] = await db
        .select({
          teacherId: classes.teacherId,
        })
        .from(assignments)
        .leftJoin(classes, eq(assignments.classId, classes.id))
        .where(eq(assignments.id, submission.assignmentId))
        .limit(1);

      if (!assignment || assignment.teacherId !== user.id) {
        return { success: false, error: "Bạn không có quyền xóa bài nộp này" };
      }
    }

    // Admins can delete any submission (no check needed)

    await db
      .delete(assignmentSubmissions)
      .where(eq(assignmentSubmissions.id, submissionId));

    revalidatePath("/assignments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting submission:", error);
    return { success: false, error: "Không thể xóa bài nộp" };
  }
}

export async function getAllSubmissions(assignmentId: number) {
  try {
    const user = await requireAuth();

    if (user.role !== "teacher" && user.role !== "admin") {
      return [];
    }

    // Verify teacher owns the class (skip for admin)
    if (user.role === "teacher") {
      const [assignment] = await db
        .select({
          teacherId: classes.teacherId,
        })
        .from(assignments)
        .leftJoin(classes, eq(assignments.classId, classes.id))
        .where(eq(assignments.id, assignmentId))
        .limit(1);

      if (!assignment || assignment.teacherId !== user.id) {
        return [];
      }
    }

    const submissions = await db
      .select({
        id: assignmentSubmissions.id,
        studentId: assignmentSubmissions.studentId,
        studentName: users.name,
        studentEmail: users.email,
        content: assignmentSubmissions.content,
        fileUrl: assignmentSubmissions.fileUrl,
        status: assignmentSubmissions.status,
        score: assignmentSubmissions.score,
        feedback: assignmentSubmissions.feedback,
        submittedAt: assignmentSubmissions.submittedAt,
        gradedAt: assignmentSubmissions.gradedAt,
      })
      .from(assignmentSubmissions)
      .innerJoin(users, eq(assignmentSubmissions.studentId, users.id))
      .where(eq(assignmentSubmissions.assignmentId, assignmentId))
      .orderBy(desc(assignmentSubmissions.submittedAt));

    return submissions;
  } catch (error) {
    console.error("Error fetching all submissions:", error);
    return [];
  }
}
// ========== Phase 3: Assignment Auto-Release & Scheduling ==========

/**
 * Get assignments ready to be released (scheduled for now)
 * Called by cron job for auto-release
 */
export async function getAssignmentsToRelease() {
  try {
    const now = new Date();

    const toRelease = await db
      .select()
      .from(assignments)
      .where(
        and(
          eq(assignments.autoReleaseEnabled || false, true),
          eq(assignments.isVisible || false, false),
          sql`${assignments.scheduledReleaseAt} <= ${now}`,
          sql`${assignments.releasedAt} IS NULL`
        )
      )
      .orderBy(sql`${assignments.scheduledReleaseAt} ASC`)
      .limit(100);

    console.log("[Assignment] Found assignments to release:", {
      count: toRelease.length,
    });

    return toRelease;
  } catch (error) {
    console.error("[Assignment] Error fetching assignments to release:", error);
    return [];
  }
}

/**
 * Release assignment (make visible to students)
 */
export async function releaseAssignment(assignmentId: number) {
  try {
    await requireAuth();

    const [released] = await db
      .update(assignments)
      .set({
        isVisible: true,
        releasedAt: new Date(),
      })
      .where(eq(assignments.id, assignmentId))
      .returning();

    console.log("[Assignment] Released assignment:", { id: assignmentId });
    revalidatePath("/assignments");
    return released;
  } catch (error) {
    console.error("[Assignment] Error releasing assignment:", error);
    throw error;
  }
}

/**
 * Get assignments ready to close (stop accepting submissions)
 */
export async function getAssignmentsToClose() {
  try {
    const now = new Date();

    const toClose = await db
      .select()
      .from(assignments)
      .where(
        and(
          eq(assignments.autoCloseEnabled || false, true),
          sql`${assignments.closedAt} IS NULL`,
          sql`${assignments.scheduledCloseAt} <= ${now}`
        )
      )
      .orderBy(sql`${assignments.scheduledCloseAt} ASC`)
      .limit(100);

    console.log("[Assignment] Found assignments to close:", {
      count: toClose.length,
    });

    return toClose;
  } catch (error) {
    console.error("[Assignment] Error fetching assignments to close:", error);
    return [];
  }
}

/**
 * Close assignment (stop accepting new submissions)
 */
export async function closeAssignment(assignmentId: number) {
  try {
    await requireAuth();

    const [closed] = await db
      .update(assignments)
      .set({
        closedAt: new Date(),
      })
      .where(eq(assignments.id, assignmentId))
      .returning();

    console.log("[Assignment] Closed assignment:", { id: assignmentId });
    revalidatePath("/assignments");
    return closed;
  } catch (error) {
    console.error("[Assignment] Error closing assignment:", error);
    throw error;
  }
}

/**
 * Get overdue assignments (for notifications to students)
 */
export async function getOverdueAssignments(classId?: number) {
  try {
    const now = new Date();

    let query = db
      .select()
      .from(assignments)
      .where(
        and(
          sql`${assignments.dueDate} <= ${now}`,
          sql`${assignments.closedAt} IS NULL`
        )
      )
      .orderBy(sql`${assignments.dueDate} ASC`);

    if (classId) {
      query = query.where(eq(assignments.classId, classId));
    }

    const overdue = await query;

    return overdue;
  } catch (error) {
    console.error("[Assignment] Error fetching overdue assignments:", error);
    return [];
  }
}

/**
 * Get assignment stats (submission count, average score, etc)
 */
export async function getAssignmentStats(assignmentId: number) {
  try {
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId));

    if (!assignment) {
      return null;
    }

    const stats = await db
      .select({
        totalSubmissions: sql<number>`cast(count(distinct ${assignmentSubmissions.studentId}) as integer)`,
        submittedCount: sql<number>`cast(count(case when ${assignmentSubmissions.status} = 'submitted' then 1 end) as integer)`,
        gradedCount: sql<number>`cast(count(case when ${assignmentSubmissions.status} = 'graded' then 1 end) as integer)`,
        averageScore: sql<number>`cast(avg(${assignmentSubmissions.score}) as decimal)`,
      })
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.assignmentId, assignmentId));

    console.log("[Assignment] Fetched stats for assignment:", {
      id: assignmentId,
      ...stats[0],
    });

    return stats[0];
  } catch (error) {
    console.error("[Assignment] Error fetching assignment stats:", error);
    return null;
  }
}
