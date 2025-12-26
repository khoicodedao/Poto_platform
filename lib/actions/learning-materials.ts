"use server";

import { db } from "@/db";
import { learningUnits, learningMaterials } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ===== UNITS =====

export async function getClassUnits(classId: number) {
    try {
        const units = await db
            .select()
            .from(learningUnits)
            .where(eq(learningUnits.classId, classId))
            .orderBy(learningUnits.orderIndex);

        return { success: true, data: units };
    } catch (error) {
        console.error("Error fetching units:", error);
        return { success: false, error: "Failed to fetch units" };
    }
}

export async function createUnit(data: {
    classId: number;
    title: string;
    description?: string;
    orderIndex?: number;
}) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Get max order index if not provided
        if (data.orderIndex === undefined) {
            const units = await db
                .select()
                .from(learningUnits)
                .where(eq(learningUnits.classId, data.classId));
            data.orderIndex = units.length;
        }

        const [unit] = await db
            .insert(learningUnits)
            .values({
                classId: data.classId,
                title: data.title,
                description: data.description,
                orderIndex: data.orderIndex,
            })
            .returning();

        revalidatePath(`/classes/${data.classId}/materials`);
        return { success: true, data: unit };
    } catch (error) {
        console.error("Error creating unit:", error);
        return { success: false, error: "Failed to create unit" };
    }
}

export async function updateUnit(
    unitId: number,
    data: {
        title?: string;
        description?: string;
        orderIndex?: number;
    }
) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const [unit] = await db
            .update(learningUnits)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(learningUnits.id, unitId))
            .returning();

        if (unit) {
            revalidatePath(`/classes/${unit.classId}/materials`);
        }

        return { success: true, data: unit };
    } catch (error) {
        console.error("Error updating unit:", error);
        return { success: false, error: "Failed to update unit" };
    }
}

export async function deleteUnit(unitId: number) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const [unit] = await db
            .delete(learningUnits)
            .where(eq(learningUnits.id, unitId))
            .returning();

        if (unit) {
            revalidatePath(`/classes/${unit.classId}/materials`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error deleting unit:", error);
        return { success: false, error: "Failed to delete unit" };
    }
}

// ===== MATERIALS =====

export async function getUnitMaterials(unitId: number) {
    try {
        const materials = await db
            .select()
            .from(learningMaterials)
            .where(eq(learningMaterials.unitId, unitId))
            .orderBy(learningMaterials.orderIndex);

        return { success: true, data: materials };
    } catch (error) {
        console.error("Error fetching materials:", error);
        return { success: false, error: "Failed to fetch materials" };
    }
}

export async function createMaterial(data: {
    unitId: number;
    title: string;
    description?: string;
    type: "video" | "document" | "link" | "other";
    fileUrl?: string;
    fileSize?: number;
    durationSeconds?: number;
    orderIndex?: number;
}) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Get max order index if not provided
        if (data.orderIndex === undefined) {
            const materials = await db
                .select()
                .from(learningMaterials)
                .where(eq(learningMaterials.unitId, data.unitId));
            data.orderIndex = materials.length;
        }

        const [material] = await db
            .insert(learningMaterials)
            .values({
                ...data,
                uploadedBy: session.user.id,
            })
            .returning();

        // Get unit to revalidate class path
        const [unit] = await db
            .select()
            .from(learningUnits)
            .where(eq(learningUnits.id, data.unitId));

        if (unit) {
            revalidatePath(`/classes/${unit.classId}/materials`);
        }

        return { success: true, data: material };
    } catch (error) {
        console.error("Error creating material:", error);
        return { success: false, error: "Failed to create material" };
    }
}

export async function updateMaterial(
    materialId: number,
    data: {
        title?: string;
        description?: string;
        fileUrl?: string;
        fileSize?: number;
        durationSeconds?: number;
        orderIndex?: number;
    }
) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const [material] = await db
            .update(learningMaterials)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(learningMaterials.id, materialId))
            .returning();

        return { success: true, data: material };
    } catch (error) {
        console.error("Error updating material:", error);
        return { success: false, error: "Failed to update material" };
    }
}

export async function deleteMaterial(materialId: number) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        await db
            .delete(learningMaterials)
            .where(eq(learningMaterials.id, materialId));

        return { success: true };
    } catch (error) {
        console.error("Error deleting material:", error);
        return { success: false, error: "Failed to delete material" };
    }
}

// ===== COMBINED =====

export async function getClassUnitsWithMaterials(classId: number) {
    try {
        const units = await db
            .select()
            .from(learningUnits)
            .where(eq(learningUnits.classId, classId))
            .orderBy(learningUnits.orderIndex);

        const unitsWithMaterials = await Promise.all(
            units.map(async (unit) => {
                const materials = await db
                    .select()
                    .from(learningMaterials)
                    .where(eq(learningMaterials.unitId, unit.id))
                    .orderBy(learningMaterials.orderIndex);

                return {
                    ...unit,
                    materials,
                };
            })
        );

        return { success: true, data: unitsWithMaterials };
    } catch (error) {
        console.error("Error fetching units with materials:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}
