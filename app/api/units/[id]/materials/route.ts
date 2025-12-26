import { NextRequest, NextResponse } from "next/server";
import { createMaterial } from "@/lib/actions/learning-materials";
import { getCurrentSession } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const unitId = parseInt(params.id);
        const body = await req.json();
        const { title, description, type, fileUrl } = body;

        if (!title?.trim()) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        if (!fileUrl?.trim()) {
            return NextResponse.json(
                { error: "File URL is required" },
                { status: 400 }
            );
        }

        const result = await createMaterial({
            unitId,
            title: title.trim(),
            description: description?.trim(),
            type: type || "document",
            fileUrl: fileUrl.trim(),
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Error creating material:", error);
        return NextResponse.json(
            { error: "Failed to create material" },
            { status: 500 }
        );
    }
}
