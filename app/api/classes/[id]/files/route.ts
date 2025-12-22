import { NextRequest, NextResponse } from "next/server";
import { getFiles, uploadClassFile } from "@/lib/actions/files";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const classId = parseInt(params.id);

        if (isNaN(classId)) {
            return NextResponse.json(
                { error: "Invalid class ID" },
                { status: 400 }
            );
        }

        const files = await getFiles(classId);

        return NextResponse.json({ files }, { status: 200 });
    } catch (error) {
        console.error("Error fetching files:", error);
        return NextResponse.json(
            { error: "Failed to fetch files" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const classId = parseInt(params.id);

        if (isNaN(classId)) {
            return NextResponse.json(
                { error: "Invalid class ID" },
                { status: 400 }
            );
        }

        const formData = await request.formData();
        formData.set("classId", classId.toString());

        const result = await uploadClassFile(formData);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "File uploaded successfully", fileId: result.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
