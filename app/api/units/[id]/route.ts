import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { learningUnits, learningMaterials } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is admin or teacher
        if (session.user.role !== "admin" && session.user.role !== "teacher") {
            return NextResponse.json(
                { error: "Forbidden - Only admin and teachers can edit units" },
                { status: 403 }
            );
        }

        const unitId = parseInt(params.id);
        const body = await request.json();

        const [unit] = await db
            .update(learningUnits)
            .set({
                title: body.title,
                description: body.description,
                updatedAt: new Date(),
            })
            .where(eq(learningUnits.id, unitId))
            .returning();

        if (!unit) {
            return NextResponse.json(
                { error: "Unit not found" },
                { status: 404 }
            );
        }

        revalidatePath(`/classes/${unit.classId}/materials`);

        return NextResponse.json({ success: true, data: unit });
    } catch (error) {
        console.error("Error updating unit:", error);
        return NextResponse.json(
            { error: "Failed to update unit" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user is admin or teacher
        if (session.user.role !== "admin" && session.user.role !== "teacher") {
            return NextResponse.json(
                { error: "Forbidden - Only admin and teachers can delete units" },
                { status: 403 }
            );
        }

        const unitId = parseInt(params.id);

        // Get unit to find classId before deleting
        const [unitToDelete] = await db
            .select()
            .from(learningUnits)
            .where(eq(learningUnits.id, unitId));

        if (!unitToDelete) {
            return NextResponse.json(
                { error: "Unit not found" },
                { status: 404 }
            );
        }

        // First delete all materials in this unit (cascade delete)
        await db
            .delete(learningMaterials)
            .where(eq(learningMaterials.unitId, unitId));

        // Then delete the unit
        await db
            .delete(learningUnits)
            .where(eq(learningUnits.id, unitId));

        revalidatePath(`/classes/${unitToDelete.classId}/materials`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting unit:", error);
        return NextResponse.json(
            { error: "Failed to delete unit" },
            { status: 500 }
        );
    }
}
