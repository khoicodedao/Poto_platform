// lib/actions/classes.ts
"use server";

import { db } from "@/db"; // chỗ bạn export drizzle db
import { classes, classEnrollments, users } from "@/db/schema"; // chỉnh path theo project của bạn
import { eq, inArray } from "drizzle-orm";

import { sql } from "drizzle-orm/sql";

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
