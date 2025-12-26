import { NextRequest, NextResponse } from "next/server";
import { getClassUnitsWithMaterials, createUnit } from "@/lib/actions/learning-materials";
import { getCurrentSession } from "@/lib/auth";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const classId = parseInt(params.id);
        const result = await getClassUnitsWithMaterials(classId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching units:", error);
        return NextResponse.json(
            { error: "Failed to fetch units" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const classId = parseInt(params.id);
        const body = await req.json();
        const { title, description } = body;

        if (!title?.trim()) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        const result = await createUnit({
            classId,
            title: title.trim(),
            description: description?.trim(),
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Error creating unit:", error);
        return NextResponse.json(
            { error: "Failed to create unit" },
            { status: 500 }
        );
    }
}
