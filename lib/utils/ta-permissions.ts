import { getCurrentSession } from "@/lib/auth";
import { checkTAPermission } from "@/lib/actions/teaching-assistant";

type Permission = "canMarkAttendance" | "canManageMaterials" | "canGradeAssignments" | "canManageSessions";

/**
 * Check if current user has permission for a specific action in a class
 * Returns true for admin and teacher roles
 * For teaching_assistant, checks specific permission
 * Returns false for students or unauthorized users
 */
export async function checkCurrentUserPermission(
    classId: number,
    permission: Permission
): Promise<boolean> {
    try {
        const session = await getCurrentSession();
        if (!session?.user) {
            return false;
        }

        // Admin and teachers have all permissions
        if (session.user.role === "admin" || session.user.role === "teacher") {
            return true;
        }

        // Check TA permission
        if (session.user.role === "teaching_assistant") {
            return await checkTAPermission(session.user.id, classId, permission);
        }

        // Students have no administrative permissions
        return false;
    } catch (error) {
        console.error("Error checking user permission:", error);
        return false;
    }
}

/**
 * Check if current user can edit/manage class content
 * (combination of teacher, admin, or TA with appropriate permissions)
 */
export async function canManageClass(classId: number): Promise<boolean> {
    const session = await getCurrentSession();
    if (!session?.user) return false;

    if (session.user.role === "admin" || session.user.role === "teacher") {
        return true;
    }

    if (session.user.role === "teaching_assistant") {
        // TA can manage if they have at least one permission
        const hasAnyPermission = await Promise.all([
            checkTAPermission(session.user.id, classId, "canMarkAttendance"),
            checkTAPermission(session.user.id, classId, "canManageMaterials"),
            checkTAPermission(session.user.id, classId, "canGradeAssignments"),
            checkTAPermission(session.user.id, classId, "canManageSessions"),
        ]);

        return hasAnyPermission.some(permission => permission === true);
    }

    return false;
}

/**
 * Get all permissions for current user in a class
 */
export async function getUserPermissions(classId: number): Promise<{
    canMarkAttendance: boolean;
    canManageMaterials: boolean;
    canGradeAssignments: boolean;
    canManageSessions: boolean;
}> {
    const session = await getCurrentSession();

    // Default permissions (all false)
    const permissions = {
        canMarkAttendance: false,
        canManageMaterials: false,
        canGradeAssignments: false,
        canManageSessions: false,
    };

    if (!session?.user) {
        return permissions;
    }

    // Admin and teachers have all permissions
    if (session.user.role === "admin" || session.user.role === "teacher") {
        return {
            canMarkAttendance: true,
            canManageMaterials: true,
            canGradeAssignments: true,
            canManageSessions: true,
        };
    }

    // Check TA permissions
    if (session.user.role === "teaching_assistant") {
        const [attendance, materials, grading, sessions] = await Promise.all([
            checkTAPermission(session.user.id, classId, "canMarkAttendance"),
            checkTAPermission(session.user.id, classId, "canManageMaterials"),
            checkTAPermission(session.user.id, classId, "canGradeAssignments"),
            checkTAPermission(session.user.id, classId, "canManageSessions"),
        ]);

        return {
            canMarkAttendance: attendance,
            canManageMaterials: materials,
            canGradeAssignments: grading,
            canManageSessions: sessions,
        };
    }

    return permissions;
}
