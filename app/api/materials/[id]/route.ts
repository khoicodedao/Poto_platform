import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { learningMaterials, learningUnits } from "@/db/schema";
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
                { error: "Forbidden - Only admin and teachers can edit materials" },
                { status: 403 }
            );
        }

        const materialId = parseInt(params.id);
        const body = await request.json();

        const [material] = await db
            .update(learningMaterials)
            .set({
                title: body.title,
                description: body.description,
                fileUrl: body.fileUrl,
                fileSize: body.fileSize,
                updatedAt: new Date(),
            })
            .where(eq(learningMaterials.id, materialId))
            .returning();

        if (!material) {
            return NextResponse.json(
                { error: "Material not found" },
                { status: 404 }
            );
        }

        // Get unit to revalidate class path
        const [unit] = await db
            .select()
            .from(learningUnits)
            .where(eq(learningUnits.id, material.unitId));

        if (unit) {
            revalidatePath(`/classes/${unit.classId}/materials`);
        }

        return NextResponse.json({ success: true, data: material });
    } catch (error) {
        console.error("Error updating material:", error);
        return NextResponse.json(
            { error: "Failed to update material" },
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
                { error: "Forbidden - Only admin and teachers can delete materials" },
                { status: 403 }
            );
        }

        const materialId = parseInt(params.id);

        // Get material to find unit before deleting
        const [materialToDelete] = await db
            .select()
            .from(learningMaterials)
            .where(eq(learningMaterials.id, materialId));

        if (!materialToDelete) {
            return NextResponse.json(
                { error: "Material not found" },
                { status: 404 }
            );
        }

        // Get unit to revalidate class path
        const [unit] = await db
            .select()
            .from(learningUnits)
            .where(eq(learningUnits.id, materialToDelete.unitId));

        // Delete the material
        await db
            .delete(learningMaterials)
            .where(eq(learningMaterials.id, materialId));

        if (unit) {
            revalidatePath(`/classes/${unit.classId}/materials`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting material:", error);
        return NextResponse.json(
            { error: "Failed to delete material" },
            { status: 500 }
        );
    }
}
