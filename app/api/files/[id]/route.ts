import { NextRequest, NextResponse } from "next/server";
import { deleteFile } from "@/lib/actions/files";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const fileId = parseInt(params.id);

        if (isNaN(fileId)) {
            return NextResponse.json(
                { error: "Invalid file ID" },
                { status: 400 }
            );
        }

        const result = await deleteFile(fileId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "File deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    }
}
