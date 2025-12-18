"use server";

import { db } from "@/db";
import {
  classSessions,
  attendance,
  studentFeedbacks,
  classReports,
  classEnrollments,
  users,
} from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth";
import { createNotification } from "@/lib/actions/notifications";

// === CLASS SESSIONS ===

export async function createClassSession(data: {
  classId: number;
  title: string;
  description?: string;
  scheduledAt: Date;
  durationMinutes?: number;
  sessionNumber?: number;
}) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await db.insert(classSessions).values({
      ...data,
      createdBy: session.user.id,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error creating class session:", error);
    return { success: false, error: String(error) };
  }
}

export async function getClassSessions(classId: number) {
  try {
    const result = await db
      .select()
      .from(classSessions)
      .where(eq(classSessions.classId, classId))
      .orderBy(desc(classSessions.scheduledAt));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching class sessions:", error);
    return { success: false, error: String(error) };
  }
}

export async function getClassSessionDetail(sessionId: number) {
  try {
    const result = await db
      .select()
      .from(classSessions)
      .where(eq(classSessions.id, sessionId));

    return {
      success: true,
      data: result[0] || null,
    };
  } catch (error) {
    console.error("Error fetching class session detail:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateClassSession(
  sessionId: number,
  data: {
    title?: string;
    description?: string;
    scheduledAt?: Date;
    status?: "scheduled" | "in-progress" | "completed" | "cancelled";
    durationMinutes?: number;
  }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await db
      .update(classSessions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(classSessions.id, sessionId));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error updating class session:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteClassSession(sessionId: number) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await db
      .delete(classSessions)
      .where(eq(classSessions.id, sessionId));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error deleting class session:", error);
    return { success: false, error: String(error) };
  }
}

// === ATTENDANCE ===

export async function markAttendance(data: {
  sessionId: number;
  studentId: number;
  status: "present" | "absent" | "late" | "early-leave";
  checkInTime?: Date;
  notes?: string;
}) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    // Try update first (if record exists), otherwise insert.
    try {
      const [updated] = await db
        .update(attendance)
        .set({
          status: data.status,
          checkInTime: data.checkInTime,
          notes: data.notes,
          markedBy: session.user.id,
          // no updatedAt column on attendance
        })
        .where(
          and(
            eq(attendance.sessionId, data.sessionId),
            eq(attendance.studentId, data.studentId)
          )
        )
        .returning();

      if (updated) {
        return { success: true, data: updated };
      }
    } catch (updateErr) {
      // If update failed (e.g., DB error), log and continue to try insert
      console.warn("markAttendance update failed, will try insert:", updateErr);
    }

    // Insert new record when update didn't find existing row
    const [inserted] = await db
      .insert(attendance)
      .values({
        ...data,
        markedBy: session.user.id,
      })
      .returning();

    return {
      success: true,
      data: inserted,
    };
  } catch (error) {
    console.error("Error marking attendance:", error);
    return { success: false, error: String(error) };
  }
}

export async function getSessionAttendance(sessionId: number) {
  try {
    const result = await db
      .select({
        id: attendance.id,
        sessionId: attendance.sessionId,
        studentId: attendance.studentId,
        status: attendance.status,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        notes: attendance.notes,
      })
      .from(attendance)
      .where(eq(attendance.sessionId, sessionId));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateCheckOutTime(
  attendanceId: number,
  checkOutTime: Date
) {
  try {
    const result = await db
      .update(attendance)
      .set({ checkOutTime })
      .where(eq(attendance.id, attendanceId));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error updating check out time:", error);
    return { success: false, error: String(error) };
  }
}

// === STUDENT FEEDBACK ===

export async function addStudentFeedback(data: {
  sessionId: number;
  studentId: number;
  feedbackText: string;
  attitudeScore?: number;
  participationLevel?: "high" | "medium" | "low";
}) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    // Try update first, then insert if no existing record.
    let result: any = null;
    try {
      const [updated] = await db
        .update(studentFeedbacks)
        .set({
          feedbackText: data.feedbackText,
          attitudeScore: data.attitudeScore,
          participationLevel: data.participationLevel,
          updatedAt: new Date(),
          createdBy: session.user.id,
        })
        .where(
          and(
            eq(studentFeedbacks.sessionId, data.sessionId),
            eq(studentFeedbacks.studentId, data.studentId)
          )
        )
        .returning();

      if (updated) {
        result = updated;
      }
    } catch (uErr) {
      console.warn("update feedback failed, will try insert:", uErr);
    }

    if (!result) {
      const [inserted] = await db
        .insert(studentFeedbacks)
        .values({
          ...data,
          createdBy: session.user.id,
        })
        .returning();
      result = inserted;
    }

    // Try to notify the student about the new feedback
    try {
      // Get classId for this session
      const [sess] = await db
        .select({ classId: classSessions.classId })
        .from(classSessions)
        .where(eq(classSessions.id, data.sessionId));

      const classId = sess?.classId ?? null;

      await createNotification({
        type: "report",
        title: "Bạn có nhận xét mới",
        message: data.feedbackText || "Giáo viên đã gửi nhận xét cho bạn.",
        recipientId: data.studentId,
        classId: classId ?? 0,
        relatedSessionId: data.sessionId,
        sentVia: "app",
      });
    } catch (notifyErr) {
      console.error("Failed to send feedback notification:", notifyErr);
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error adding student feedback:", error);
    return { success: false, error: String(error) };
  }
}

export async function getSessionFeedbacks(sessionId: number) {
  try {
    const result = await db
      .select()
      .from(studentFeedbacks)
      .where(eq(studentFeedbacks.sessionId, sessionId));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return { success: false, error: String(error) };
  }
}

export async function removeStudentFeedback(feedbackId: number) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await db
      .delete(studentFeedbacks)
      .where(eq(studentFeedbacks.id, feedbackId));

    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting student feedback:", error);
    return { success: false, error: String(error) };
  }
}

// === CLASS REPORT ===

export async function createClassReport(data: {
  sessionId: number;
  summary: string;
  totalStudents?: number;
  attendanceCount?: number;
  keyPoints?: string;
  nextSessionPreview?: string;
  includeFeedbacks?: boolean;
  sendViaZalo?: boolean;
}) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await db.insert(classReports).values({
      ...data,
      createdBy: session.user.id,
    });

    // After creating the report, optionally fetch feedbacks and notify all students in the class
    try {
      // get classId from session
      const [sess] = await db
        .select({ classId: classSessions.classId })
        .from(classSessions)
        .where(eq(classSessions.id, data.sessionId));

      const classId = sess?.classId ?? null;
      let feedbacks: any[] = [];
      if (data.includeFeedbacks) {
        const fbRes = await getSessionFeedbacks(data.sessionId);
        if (fbRes.success && Array.isArray(fbRes.data)) {
          feedbacks = fbRes.data;
        }
      }
      if (classId) {
        const studentsRes = await getClassStudentsForAttendance(classId);
        if (
          studentsRes &&
          studentsRes.success &&
          Array.isArray(studentsRes.data)
        ) {
          for (const s of studentsRes.data) {
            const studentId = (s as any).studentId ?? (s as any).id;
            if (!studentId) continue;
            try {
              const message = data.summary || "Báo cáo đã được tạo.";
              await createNotification({
                type: "report",
                title: "Báo cáo buổi học mới",
                message,
                recipientId: studentId,
                classId,
                relatedSessionId: data.sessionId,
                sentVia: data.sendViaZalo ? "zalo" : "app",
              });
            } catch (e) {
              console.error("Failed to notify student for report:", e);
            }
          }
        }
        // If zalo send requested, mark report as zaloMessageSent
        if (data.sendViaZalo) {
          try {
            const [updated] = await db
              .update(classReports)
              .set({ zaloMessageSent: true, updatedAt: new Date() })
              .where(eq(classReports.id, (result as any)[0]?.id))
              .returning();
          } catch (e) {
            console.warn("Failed to mark zaloMessageSent on report:", e);
          }
        }
      }
    } catch (e) {
      console.error("Error notifying students for class report:", e);
    }

    return {
      success: true,
      data: {
        report: result,
        feedbacks: data.includeFeedbacks
          ? (await getSessionFeedbacks(data.sessionId)).data
          : [],
      },
    };
  } catch (error) {
    console.error("Error creating class report:", error);
    return { success: false, error: String(error) };
  }
}

export async function getClassReports(classId: number) {
  try {
    const result = await db
      .select()
      .from(classReports)
      .innerJoin(classSessions, eq(classReports.sessionId, classSessions.id))
      .where(eq(classSessions.classId, classId))
      .orderBy(desc(classReports.createdAt));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching class reports:", error);
    return { success: false, error: String(error) };
  }
}

export async function getSessionReport(sessionId: number) {
  try {
    const result = await db
      .select()
      .from(classReports)
      .where(eq(classReports.sessionId, sessionId));

    return {
      success: true,
      data: result[0] || null,
    };
  } catch (error) {
    console.error("Error fetching session report:", error);
    return { success: false, error: String(error) };
  }
}

// === HELPER: Get class students for attendance checklist ===

export async function getClassStudentsForAttendance(classId: number) {
  try {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        studentId: classEnrollments.studentId,
        enrolledAt: classEnrollments.createdAt,
      })
      .from(classEnrollments)
      .innerJoin(users, eq(classEnrollments.studentId, users.id))
      .where(eq(classEnrollments.classId, classId));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching class students:", error);
    return { success: false, error: String(error) };
  }
}
