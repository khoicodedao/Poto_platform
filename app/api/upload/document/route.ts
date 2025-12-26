import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type (documents only)
        const validTypes = [
            "application/pdf",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only PDF, PPT, PPTX, DOC, DOCX allowed." },
                { status: 400 }
            );
        }

        // Validate file size (max 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Max size is 100MB." },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExtension = file.name.split(".").pop();
        const filename = `doc-${timestamp}-${randomStr}.${fileExtension}`;

        // Ensure directory exists
        const uploadDir = join(process.cwd(), "public", "uploads", "documents");
        await mkdir(uploadDir, { recursive: true });

        // Save to public/uploads/documents
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        const url = `/uploads/documents/${filename}`;

        return NextResponse.json({
            success: true,
            url,
            filename,
            size: file.size,
            type: file.type,
        });
    } catch (error) {
        console.error("Error uploading document:", error);
        return NextResponse.json(
            { error: "Failed to upload document" },
            { status: 500 }
        );
    }
}
