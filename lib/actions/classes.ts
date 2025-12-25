// lib/actions/classes.ts
"use server";

import { db } from "@/db"; // chỗ bạn export drizzle db
import {
  assignments,
  classes,
  classEnrollments,
  files,
  messages,
  users,
} from "@/db/schema"; // chỉnh path theo project của bạn
import { desc, eq } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";
import { requireAuth } from "@/lib/auth";

type UserRole = "student" | "teacher" | "admin";
type CreateClassInput = {
  title: string;
  description?: string;
  schedule?: string;
  max_students: number;
  teacher_id: number;
  student_ids?: number[]; // 👈 list học sinh gán vào lớp
};

type UpdateClassInput = Partial<CreateClassInput>;

export type ClassDetail = {
  id: number;
  name: string;
  description: string | null;
  schedule: string | null;
  maxStudents: number;
  roomId: string | null;
  teacherId: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  teacher: {
    id: number;
    name: string;
    email: string | null;
    avatar: string | null;
  } | null;
  students: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    enrolledAt: Date | null;
  }[];
  assignments: {
    id: number;
    title: string;
    description: string | null;
    dueDate: Date | null;
    maxScore: number | null;
    createdAt: Date | null;
  }[];
  files: {
    id: number;
    name: string;
    url: string;
    type: string | null;
    size: number | null;
    uploadedAt: Date | null;
    uploaderName: string | null;
  }[];
  recentMessages: {
    id: number;
    content: string;
    createdAt: Date | null;
    senderName: string | null;
    senderRole: string | null;
  }[];
  activities: {
    id: string;
    type: "assignment" | "enrollment";
    title: string;
    description?: string | null;
    assignmentId?: number | null;
    studentName?: string | null;
    createdAt: Date | null;
  }[];
};

export async function getStudents() {
  // lấy tất cả user role = student
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.role, "student"));
  return rows;
}

export async function getClasses() {
  const rows = await db
    .select({
      id: classes.id,
      name: classes.name,
      description: classes.description,
      schedule: classes.schedule,
      maxStudents: classes.maxStudents,
      teacherId: classes.teacherId,
    })
    .from(classes);

  return rows;
}

export async function getMyClasses() {
  const user = await requireAuth();

  if (user.role === "teacher") {
    return await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        schedule: classes.schedule,
        maxStudents: classes.maxStudents,
      })
      .from(classes)
      .where(eq(classes.teacherId, user.id))
      .orderBy(desc(classes.createdAt));
  }

  if (user.role === "admin") {
    return await getClasses();
  }

  return [];
}

export async function getClassById(id: number) {
  const [row] =
    (await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        schedule: classes.schedule,
        maxStudents: classes.maxStudents,
        teacherId: classes.teacherId,
      })
      .from(classes)
      .where(eq(classes.id, id))) ?? [];

  if (!row) return null;

  const enrolled = await db
    .select({
      studentId: classEnrollments.studentId,
    })
    .from(classEnrollments)
    .where(eq(classEnrollments.classId, id));

  return {
    ...row,
    studentIds: enrolled.map((e) => e.studentId),
  };
}

export async function getClassDetail(
  id: number
): Promise<ClassDetail | null> {
  const [classRow] = await db
    .select({
      id: classes.id,
      name: classes.name,
      description: classes.description,
      schedule: classes.schedule,
      maxStudents: classes.maxStudents,
      roomId: classes.roomId,
      teacherId: classes.teacherId,
      createdAt: classes.createdAt,
      updatedAt: classes.updatedAt,
      teacherName: users.name,
      teacherEmail: users.email,
      teacherAvatar: users.avatar,
    })
    .from(classes)
    .leftJoin(users, eq(classes.teacherId, users.id))
    .where(eq(classes.id, id))
    .limit(1);

  if (!classRow) {
    return null;
  }

  const studentsQuery = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      enrolledAt: classEnrollments.enrolledAt,
    })
    .from(classEnrollments)
    .innerJoin(users, eq(classEnrollments.studentId, users.id))
    .where(eq(classEnrollments.classId, id))
    .orderBy(desc(classEnrollments.enrolledAt));

  const assignmentsQuery = db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      dueDate: assignments.dueDate,
      maxScore: assignments.maxScore,
      createdAt: assignments.createdAt,
    })
    .from(assignments)
    .where(eq(assignments.classId, id))
    .orderBy(desc(assignments.dueDate), desc(assignments.createdAt));

  const filesQuery = db
    .select({
      id: files.id,
      name: files.name,
      url: files.url,
      type: files.type,
      size: files.size,
      uploadedAt: files.uploadedAt,
      uploaderName: users.name,
    })
    .from(files)
    .leftJoin(users, eq(files.uploadedById, users.id))
    .where(eq(files.classId, id))
    .orderBy(desc(files.uploadedAt))
    .limit(12);

  const messagesQuery = db
    .select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      senderName: users.name,
      senderRole: users.role,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.classId, id))
    .orderBy(desc(messages.createdAt))
    .limit(8);

  const enrollmentsActivityQuery = db
    .select({
      id: classEnrollments.id,
      studentName: users.name,
      studentId: users.id,
      createdAt: classEnrollments.enrolledAt,
    })
    .from(classEnrollments)
    .innerJoin(users, eq(classEnrollments.studentId, users.id))
    .where(eq(classEnrollments.classId, id))
    .orderBy(desc(classEnrollments.enrolledAt))
    .limit(5);

  const assignmentActivityQuery = db
    .select({
      id: assignments.id,
      title: assignments.title,
      assignmentId: assignments.id,
      createdAt: assignments.createdAt,
    })
    .from(assignments)
    .where(eq(assignments.classId, id))
    .orderBy(desc(assignments.createdAt))
    .limit(5);

  const [
    students,
    classAssignments,
    classFiles,
    recentMessages,
    enrollmentActivities,
    assignmentActivities,
  ] = await Promise.all([
    studentsQuery,
    assignmentsQuery,
    filesQuery,
    messagesQuery,
    enrollmentsActivityQuery,
    assignmentActivityQuery,
  ]);

  return {
    id: classRow.id,
    name: classRow.name,
    description: classRow.description,
    schedule: classRow.schedule,
    maxStudents: classRow.maxStudents,
    roomId: classRow.roomId,
    teacherId: classRow.teacherId,
    createdAt: classRow.createdAt,
    updatedAt: classRow.updatedAt,
    teacher: classRow.teacherId
      ? {
        id: classRow.teacherId,
        name: classRow.teacherName ?? "Chưa cập nhật",
        email: classRow.teacherEmail ?? null,
        avatar: classRow.teacherAvatar ?? null,
      }
      : null,
    students,
    assignments: classAssignments,
    files: classFiles,
    recentMessages,
    activities: [
      ...enrollmentActivities.map((activity) => ({
        id: `enroll-${activity.id}`,
        type: "enrollment" as const,
        title: `${activity.studentName ?? "Học viên"} đã tham gia lớp`,
        description: null,
        studentName: activity.studentName,
        createdAt: activity.createdAt,
      })),
      ...assignmentActivities.map((activity) => ({
        id: `assignment-${activity.id}`,
        type: "assignment" as const,
        title: activity.title ?? "Bài tập mới được giao",
        description: activity.title,
        assignmentId: activity.assignmentId,
        createdAt: activity.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          (b.createdAt ? b.createdAt.getTime() : 0) -
          (a.createdAt ? a.createdAt.getTime() : 0)
      )
      .slice(0, 6),
  };
}

export async function createClass(data: CreateClassInput) {
  try {
    const [created] = await db
      .insert(classes)
      .values({
        name: data.title,
        description: data.description,
        schedule: data.schedule,
        maxStudents: data.max_students,
        teacherId: data.teacher_id,
      })
      .returning();

    if (data.student_ids && data.student_ids.length > 0) {
      await db.insert(classEnrollments).values(
        data.student_ids.map((sid) => ({
          classId: created.id,
          studentId: sid,
        }))
      );
    }

    return { success: true, classId: created.id };
  } catch (err) {
    console.error("createClass error", err);
    return { success: false, error: "Không tạo được lớp" };
  }
}

export async function updateClass(id: number, data: UpdateClassInput) {
  try {
    // update info lớp
    await db
      .update(classes)
      .set({
        name: data.title,
        description: data.description,
        schedule: data.schedule,
        maxStudents: data.max_students,
        teacherId: data.teacher_id,
        updatedAt: new Date(),
      })
      .where(eq(classes.id, id));

    // nếu truyền student_ids thì overwrite danh sách học sinh
    if (data.student_ids) {
      await db.delete(classEnrollments).where(eq(classEnrollments.classId, id));

      if (data.student_ids.length > 0) {
        await db.insert(classEnrollments).values(
          data.student_ids.map((sid) => ({
            classId: id,
            studentId: sid,
          }))
        );
      }
    }

    return { success: true };
  } catch (err) {
    console.error("updateClass error", err);
    return { success: false, error: "Không cập nhật được lớp" };
  }
}

export async function deleteClass(id: number) {
  try {
    await db.delete(classes).where(eq(classes.id, id));
    return { success: true };
  } catch (err) {
    console.error("deleteClass error", err);
    return { success: false, error: "Không xoá được lớp" };
  }
}

export async function getClassesForUser(
  rawUserId: number | string | null | undefined,
  role: UserRole
) {
  // Ép userId về number, nếu không convert được thì trả về []
  const userId =
    typeof rawUserId === "string"
      ? Number.parseInt(rawUserId, 10)
      : typeof rawUserId === "number"
        ? rawUserId
        : null;

  // Nếu không có userId hợp lệ → trả mảng rỗng (tránh query lỗi)
  if (!userId) {
    console.warn("[getClassesForUser] userId không hợp lệ:", rawUserId);
    return [];
  }

  const baseSelect = db
    .select({
      id: classes.id,
      title: classes.name,
      description: classes.description,
      schedule: classes.schedule,
      max_students: classes.maxStudents,
      created_at: classes.createdAt,
      teacher_id: classes.teacherId,
      teacher_name: users.name,
      status: sql<"active" | "recruiting">`'recruiting'`.as("status"),
      student_count: sql<number>`count(${classEnrollments.id})`.as(
        "student_count"
      ),
    })
    .from(classes)
    .innerJoin(users, eq(classes.teacherId, users.id))
    .leftJoin(classEnrollments, eq(classEnrollments.classId, classes.id))
    .groupBy(classes.id, users.name);

  if (role === "admin") {
    return await baseSelect;
  }

  if (role === "teacher") {
    return await baseSelect.where(eq(classes.teacherId, userId));
  }

  // student: các lớp mình được enroll
  return await baseSelect.where(eq(classEnrollments.studentId, userId));
}

// Get sessions where user is guest teacher
export async function getGuestSessionsForTeacher(userId: number) {
  const { classSessions } = await import("@/db/schema");

  const guestSessions = await db
    .select({
      sessionId: classSessions.id,
      sessionTitle: classSessions.title,
      sessionDate: classSessions.scheduledAt,
      classId: classes.id,
      className: classes.name,
      mainTeacherName: users.name,
      status: classSessions.status,
    })
    .from(classSessions)
    .innerJoin(classes, eq(classSessions.classId, classes.id))
    .innerJoin(users, eq(classes.teacherId, users.id))
    .where(eq(classSessions.guestTeacherId, userId))
    .orderBy(classSessions.scheduledAt);

  return guestSessions;
}

