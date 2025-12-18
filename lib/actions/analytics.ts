"use server";

import { db } from "@/db";
import {
  assignments,
  assignmentSubmissions,
  users,
  classes,
  classSessions,
  attendance,
  classReports,
} from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { eq, and, gte, lte, sql } from "drizzle-orm";

/**
 * Student Performance Analytics
 */

export async function getStudentPerformanceStats(
  classId: number,
  studentId: number
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get student's assignment scores
    const submissionStats = await db
      .select({
        totalAssignments: sql<number>`cast(count(distinct ${assignments.id}) as integer)`,
        submittedCount: sql<number>`cast(count(distinct case when ${assignmentSubmissions.status} != 'pending' then ${assignmentSubmissions.id} end) as integer)`,
        gradedCount: sql<number>`cast(count(distinct case when ${assignmentSubmissions.status} = 'graded' then ${assignmentSubmissions.id} end) as integer)`,
        averageScore: sql<number>`cast(avg(${assignmentSubmissions.score}) as decimal)`,
        highestScore: sql<number>`cast(max(${assignmentSubmissions.score}) as integer)`,
        lowestScore: sql<number>`cast(min(${assignmentSubmissions.score}) as integer)`,
      })
      .from(assignments)
      .leftJoin(
        assignmentSubmissions,
        and(
          eq(assignmentSubmissions.assignmentId, assignments.id),
          eq(assignmentSubmissions.studentId, studentId)
        )
      )
      .where(eq(assignments.classId, classId));

    // Get attendance stats
    const attendanceStats = await db
      .select({
        totalSessions: sql<number>`cast(count(distinct ${classSessions.id}) as integer)`,
        presentCount: sql<number>`cast(count(case when ${attendance.status} = 'present' then 1 end) as integer)`,
        lateCount: sql<number>`cast(count(case when ${attendance.status} = 'late' then 1 end) as integer)`,
        absentCount: sql<number>`cast(count(case when ${attendance.status} = 'absent' then 1 end) as integer)`,
      })
      .from(classSessions)
      .leftJoin(
        attendance,
        and(
          eq(attendance.sessionId, classSessions.id),
          eq(attendance.studentId, studentId)
        )
      )
      .where(eq(classSessions.classId, classId));

    return {
      assignments: submissionStats[0],
      attendance: attendanceStats[0],
      overallScore: submissionStats[0]?.averageScore || 0,
      attendanceRate: attendanceStats[0]
        ? (
            (attendanceStats[0].presentCount /
              (attendanceStats[0].totalSessions || 1)) *
            100
          ).toFixed(2)
        : "0",
    };
  } catch (error) {
    console.error("[Analytics] Error fetching student performance:", error);
    throw error;
  }
}

/**
 * Class Performance Analytics (for teachers)
 */

export async function getClassPerformanceStats(classId: number) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Overall class assignment performance
    const classAssignmentStats = await db
      .select({
        totalAssignments: sql<number>`cast(count(distinct ${assignments.id}) as integer)`,
        totalSubmissions: sql<number>`cast(count(distinct ${assignmentSubmissions.id}) as integer)`,
        averageScore: sql<number>`cast(avg(${assignmentSubmissions.score}) as decimal)`,
        submissionRate: sql<number>`cast(count(distinct case when ${assignmentSubmissions.submittedAt} is not null then ${assignmentSubmissions.id} end) * 100.0 / nullif(count(distinct ${assignmentSubmissions.id}), 0) as decimal)`,
      })
      .from(assignments)
      .leftJoin(
        assignmentSubmissions,
        eq(assignmentSubmissions.assignmentId, assignments.id)
      )
      .where(eq(assignments.classId, classId));

    // Class attendance statistics
    const classAttendanceStats = await db
      .select({
        totalSessions: sql<number>`cast(count(distinct ${classSessions.id}) as integer)`,
        averageAttendance: sql<number>`cast(sum(case when ${attendance.status} = 'present' then 1 else 0 end) * 100.0 / nullif(sum(case when ${attendance.status} in ('present', 'absent', 'late') then 1 else 0 end), 0) as decimal)`,
        lateRate: sql<number>`cast(sum(case when ${attendance.status} = 'late' then 1 else 0 end) * 100.0 / nullif(sum(case when ${attendance.status} in ('present', 'absent', 'late') then 1 else 0 end), 0) as decimal)`,
        absentRate: sql<number>`cast(sum(case when ${attendance.status} = 'absent' then 1 else 0 end) * 100.0 / nullif(sum(case when ${attendance.status} in ('present', 'absent', 'late') then 1 else 0 end), 0) as decimal)`,
      })
      .from(classSessions)
      .leftJoin(attendance, eq(attendance.sessionId, classSessions.id))
      .where(eq(classSessions.classId, classId));

    return {
      assignments: classAssignmentStats[0],
      attendance: classAttendanceStats[0],
    };
  } catch (error) {
    console.error("[Analytics] Error fetching class performance:", error);
    throw error;
  }
}

/**
 * Get top/bottom performing students in class
 */

export async function getTopStudents(classId: number, limit = 10) {
  try {
    const topStudents = await db
      .select({
        studentId: users.id,
        studentName: users.name,
        email: users.email,
        averageScore: sql<number>`cast(avg(${assignmentSubmissions.score}) as decimal)`,
        submittedCount: sql<number>`cast(count(distinct case when ${assignmentSubmissions.submittedAt} is not null then ${assignmentSubmissions.id} end) as integer)`,
      })
      .from(users)
      .innerJoin(
        assignmentSubmissions,
        eq(assignmentSubmissions.studentId, users.id)
      )
      .innerJoin(
        assignments,
        and(
          eq(assignments.id, assignmentSubmissions.assignmentId),
          eq(assignments.classId, classId)
        )
      )
      .groupBy(users.id)
      .orderBy(sql`cast(avg(${assignmentSubmissions.score}) as decimal) DESC`)
      .limit(limit);

    return topStudents;
  } catch (error) {
    console.error("[Analytics] Error fetching top students:", error);
    return [];
  }
}

/**
 * Get students needing attention (low scores or poor attendance)
 */

export async function getStudentsNeedingAttention(classId: number) {
  try {
    const lowPerformers = await db
      .select({
        studentId: users.id,
        studentName: users.name,
        email: users.email,
        averageScore: sql<number>`cast(avg(${assignmentSubmissions.score}) as decimal)`,
        attendanceRate: sql<number>`cast(sum(case when ${attendance.status} = 'present' then 1 else 0 end) * 100.0 / nullif(sum(case when ${attendance.status} in ('present', 'absent', 'late') then 1 else 0 end), 0) as decimal)`,
        issues: sql<string>`case 
          when cast(avg(${assignmentSubmissions.score}) as decimal) < 50 then 'Low Scores'
          when cast(sum(case when ${attendance.status} = 'absent' then 1 else 0 end) * 100.0 / nullif(sum(case when ${attendance.status} in ('present', 'absent', 'late') then 1 else 0 end), 0) as decimal) > 30 then 'Poor Attendance'
          else 'Monitor' end`,
      })
      .from(users)
      .leftJoin(
        assignmentSubmissions,
        eq(assignmentSubmissions.studentId, users.id)
      )
      .leftJoin(
        assignments,
        and(
          eq(assignments.id, assignmentSubmissions.assignmentId),
          eq(assignments.classId, classId)
        )
      )
      .leftJoin(attendance, eq(attendance.studentId, users.id))
      .groupBy(users.id)
      .having(
        sql`cast(avg(${assignmentSubmissions.score}) as decimal) < 50 
        or cast(sum(case when ${attendance.status} = 'absent' then 1 else 0 end) * 100.0 / nullif(sum(case when ${attendance.status} in ('present', 'absent', 'late') then 1 else 0 end), 0) as decimal) > 30`
      );

    return lowPerformers;
  } catch (error) {
    console.error("[Analytics] Error fetching at-risk students:", error);
    return [];
  }
}

/**
 * Get assignment performance breakdown
 */

export async function getAssignmentPerformance(assignmentId: number) {
  try {
    const performance = await db
      .select({
        title: assignments.title,
        dueDate: assignments.dueDate,
        maxScore: assignments.maxScore,
        totalStudents: sql<number>`cast(count(distinct ${assignmentSubmissions.studentId}) as integer)`,
        submittedCount: sql<number>`cast(count(distinct case when ${assignmentSubmissions.submittedAt} is not null then ${assignmentSubmissions.id} end) as integer)`,
        gradedCount: sql<number>`cast(count(distinct case when ${assignmentSubmissions.status} = 'graded' then ${assignmentSubmissions.id} end) as integer)`,
        averageScore: sql<number>`cast(avg(${assignmentSubmissions.score}) as decimal)`,
        highestScore: sql<number>`cast(max(${assignmentSubmissions.score}) as integer)`,
        lowestScore: sql<number>`cast(min(${assignmentSubmissions.score}) as integer)`,
      })
      .from(assignments)
      .leftJoin(
        assignmentSubmissions,
        eq(assignmentSubmissions.assignmentId, assignments.id)
      )
      .where(eq(assignments.id, assignmentId));

    return performance[0];
  } catch (error) {
    console.error("[Analytics] Error fetching assignment performance:", error);
    return null;
  }
}

/**
 * Get student submission timeline (for trends)
 */

export async function getSubmissionTimeline(classId: number, days = 30) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const timeline = await db
      .select({
        date: sql<string>`DATE(${assignmentSubmissions.submittedAt})`,
        submissionCount: sql<number>`cast(count(*) as integer)`,
        averageScore: sql<number>`cast(avg(${assignmentSubmissions.score}) as decimal)`,
      })
      .from(assignmentSubmissions)
      .innerJoin(
        assignments,
        and(
          eq(assignments.id, assignmentSubmissions.assignmentId),
          eq(assignments.classId, classId)
        )
      )
      .where(gte(assignmentSubmissions.submittedAt, since))
      .groupBy(sql`DATE(${assignmentSubmissions.submittedAt})`)
      .orderBy(sql`DATE(${assignmentSubmissions.submittedAt})`);

    return timeline;
  } catch (error) {
    console.error("[Analytics] Error fetching submission timeline:", error);
    return [];
  }
}

/**
 * Get attendance trends over time
 */

export async function getAttendanceTrends(classId: number) {
  try {
    const trends = await db
      .select({
        sessionId: classSessions.id,
        sessionDate: classSessions.scheduledAt,
        sessionTitle: classSessions.title,
        totalExpected: sql<number>`cast(count(*) as integer)`,
        presentCount: sql<number>`cast(count(case when ${attendance.status} = 'present' then 1 end) as integer)`,
        lateCount: sql<number>`cast(count(case when ${attendance.status} = 'late' then 1 end) as integer)`,
        absentCount: sql<number>`cast(count(case when ${attendance.status} = 'absent' then 1 end) as integer)`,
      })
      .from(classSessions)
      .leftJoin(attendance, eq(attendance.sessionId, classSessions.id))
      .where(eq(classSessions.classId, classId))
      .groupBy(classSessions.id)
      .orderBy(classSessions.scheduledAt);

    return trends;
  } catch (error) {
    console.error("[Analytics] Error fetching attendance trends:", error);
    return [];
  }
}

/**
 * Get overall platform statistics (for admin dashboard)
 */

export async function getPlatformStats() {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const totalUsers = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(users);

    const totalClasses = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(classes);

    const totalAssignments = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(assignments);

    const totalSubmissions = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(assignmentSubmissions);

    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalClasses: totalClasses[0]?.count || 0,
      totalAssignments: totalAssignments[0]?.count || 0,
      totalSubmissions: totalSubmissions[0]?.count || 0,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Analytics] Error fetching platform stats:", error);
    throw error;
  }
}

/**
 * Get class participation metrics
 */

export async function getClassParticipationMetrics(classId: number) {
  try {
    const metrics = await db
      .select({
        totalStudents: sql<number>`cast(count(distinct ${users.id}) as integer)`,
        activeStudents: sql<number>`cast(count(distinct case when ${attendance.status} is not null then ${users.id} end) as integer)`,
        inactiveStudents: sql<number>`cast(count(distinct case when ${attendance.status} is null then ${users.id} end) as integer)`,
      })
      .from(users)
      .leftJoin(attendance, eq(attendance.studentId, users.id))
      .where(eq(users.classId, classId));

    return metrics[0];
  } catch (error) {
    console.error("[Analytics] Error fetching participation metrics:", error);
    return null;
  }
}
