"use server";

import { db } from "@/db";
import {
    teachingAssistantAssignments,
    classSessions,
    classes,
    users,
} from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { eq, and, gte, lte, inArray } from "drizzle-orm";

// ===== TA ASSIGNMENTS =====

export async function getTAAssignedClasses(userId: number) {
    try {
        const assignments = await db
            .select({
                id: teachingAssistantAssignments.id,
                classId: teachingAssistantAssignments.classId,
                userId: teachingAssistantAssignments.userId,
                assignedAt: teachingAssistantAssignments.assignedAt,
                expiresAt: teachingAssistantAssignments.expiresAt,
                isActive: teachingAssistantAssignments.isActive,
                canMarkAttendance: teachingAssistantAssignments.canMarkAttendance,
                canManageMaterials: teachingAssistantAssignments.canManageMaterials,
                canGradeAssignments: teachingAssistantAssignments.canGradeAssignments,
                canManageSessions: teachingAssistantAssignments.canManageSessions,
                className: classes.name,
                classDescription: classes.description,
                classSchedule: classes.schedule,
                teacherId: classes.teacherId,
                teacherName: users.name,
                teacherEmail: users.email,
            })
            .from(teachingAssistantAssignments)
            .leftJoin(classes, eq(teachingAssistantAssignments.classId, classes.id))
            .leftJoin(users, eq(classes.teacherId, users.id))
            .where(
                and(
                    eq(teachingAssistantAssignments.userId, userId),
                    eq(teachingAssistantAssignments.isActive, true)
                )
            );

        return { success: true, data: assignments };
    } catch (error) {
        console.error("Error fetching TA assigned classes:", error);
        return { success: false, error: "Failed to fetch assigned classes" };
    }
}

export async function getTASessions(
    userId: number,
    startDate: Date,
    endDate: Date
) {
    try {
        // First get all classes assigned to this TA
        const taClassesResult = await getTAAssignedClasses(userId);
        if (!taClassesResult.success || !taClassesResult.data) {
            return { success: false, error: "Failed to get TA classes" };
        }

        const classIds = taClassesResult.data.map((assignment) => assignment.classId);

        if (classIds.length === 0) {
            return { success: true, data: [] };
        }

        // Get sessions for those classes in the date range
        const sessions = await db
            .select({
                id: classSessions.id,
                classId: classSessions.classId,
                sessionNumber: classSessions.sessionNumber,
                title: classSessions.title,
                description: classSessions.description,
                scheduledAt: classSessions.scheduledAt,
                durationMinutes: classSessions.durationMinutes,
                roomId: classSessions.roomId,
                platformUrl: classSessions.platformUrl,
                status: classSessions.status,
                guestTeacherId: classSessions.guestTeacherId,
                className: classes.name,
                classSchedule: classes.schedule,
            })
            .from(classSessions)
            .leftJoin(classes, eq(classSessions.classId, classes.id))
            .where(
                and(
                    inArray(classSessions.classId, classIds),
                    gte(classSessions.scheduledAt, startDate),
                    lte(classSessions.scheduledAt, endDate)
                )
            )
            .orderBy(classSessions.scheduledAt);

        return { success: true, data: sessions };
    } catch (error) {
        console.error("Error fetching TA sessions:", error);
        return { success: false, error: "Failed to fetch sessions" };
    }
}

export async function checkTAPermission(
    userId: number,
    classId: number,
    permission: "canMarkAttendance" | "canManageMaterials" | "canGradeAssignments" | "canManageSessions"
): Promise<boolean> {
    try {
        const [assignment] = await db
            .select()
            .from(teachingAssistantAssignments)
            .where(
                and(
                    eq(teachingAssistantAssignments.userId, userId),
                    eq(teachingAssistantAssignments.classId, classId),
                    eq(teachingAssistantAssignments.isActive, true)
                )
            );

        return assignment?.[permission] ?? false;
    } catch (error) {
        console.error("Error checking TA permission:", error);
        return false;
    }
}

export async function getCurrentTA() {
    const session = await getCurrentSession();
    if (!session?.user) {
        return null;
    }

    // Allow both TA and admin to access TA views
    if (session.user.role !== "teaching_assistant" && session.user.role !== "admin") {
        return null;
    }

    return session.user;
}

// ===== ADMIN FUNCTIONS =====

export async function assignTAToClass(data: {
    userId: number;
    classId: number;
    canMarkAttendance?: boolean;
    canManageMaterials?: boolean;
    canGradeAssignments?: boolean;
    canManageSessions?: boolean;
    expiresAt?: Date;
}) {
    try {
        const session = await getCurrentSession();
        if (!session?.user || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized - Admin only" };
        }

        // Check if user is actually a TA
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, data.userId));

        if (!user || user.role !== "teaching_assistant") {
            return { success: false, error: "User is not a teaching assistant" };
        }

        // Check if assignment already exists
        const [existing] = await db
            .select()
            .from(teachingAssistantAssignments)
            .where(
                and(
                    eq(teachingAssistantAssignments.userId, data.userId),
                    eq(teachingAssistantAssignments.classId, data.classId)
                )
            );

        if (existing) {
            // Update existing assignment
            const [updated] = await db
                .update(teachingAssistantAssignments)
                .set({
                    isActive: true,
                    canMarkAttendance: data.canMarkAttendance ?? true,
                    canManageMaterials: data.canManageMaterials ?? true,
                    canGradeAssignments: data.canGradeAssignments ?? false,
                    canManageSessions: data.canManageSessions ?? true,
                    expiresAt: data.expiresAt,
                    updatedAt: new Date(),
                })
                .where(eq(teachingAssistantAssignments.id, existing.id))
                .returning();

            return { success: true, data: updated };
        }

        // Create new assignment
        const [assignment] = await db
            .insert(teachingAssistantAssignments)
            .values({
                userId: data.userId,
                classId: data.classId,
                assignedBy: session.user.id,
                canMarkAttendance: data.canMarkAttendance ?? true,
                canManageMaterials: data.canManageMaterials ?? true,
                canGradeAssignments: data.canGradeAssignments ?? false,
                canManageSessions: data.canManageSessions ?? true,
                expiresAt: data.expiresAt,
            })
            .returning();

        return { success: true, data: assignment };
    } catch (error) {
        console.error("Error assigning TA to class:", error);
        return { success: false, error: "Failed to assign TA to class" };
    }
}

export async function removeTAFromClass(userId: number, classId: number) {
    try {
        const session = await getCurrentSession();
        if (!session?.user || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized - Admin only" };
        }

        await db
            .update(teachingAssistantAssignments)
            .set({ isActive: false, updatedAt: new Date() })
            .where(
                and(
                    eq(teachingAssistantAssignments.userId, userId),
                    eq(teachingAssistantAssignments.classId, classId)
                )
            );

        return { success: true };
    } catch (error) {
        console.error("Error removing TA from class:", error);
        return { success: false, error: "Failed to remove TA from class" };
    }
}

export async function getAllTAs() {
    try {
        const session = await getCurrentSession();
        if (!session?.user || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized - Admin only" };
        }

        const tas = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                avatar: users.avatar,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.role, "teaching_assistant"));

        return { success: true, data: tas };
    } catch (error) {
        console.error("Error fetching TAs:", error);
        return { success: false, error: "Failed to fetch TAs" };
    }
}
