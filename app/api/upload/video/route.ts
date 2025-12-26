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

        // Validate file type (video only)
        const validTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only MP4, WebM, OGG, MOV allowed." },
                { status: 400 }
            );
        }

        // Validate file size (max 500MB)
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Max size is 500MB." },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExtension = file.name.split(".").pop();
        const filename = `video-${timestamp}-${randomStr}.${fileExtension}`;

        // Ensure directory exists
        const uploadDir = join(process.cwd(), "public", "uploads", "videos");
        await mkdir(uploadDir, { recursive: true });

        // Save to public/uploads/videos
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        const url = `/uploads/videos/${filename}`;

        return NextResponse.json({
            success: true,
            url,
            filename,
            size: file.size,
            type: file.type,
        });
    } catch (error) {
        console.error("Error uploading video:", error);
        return NextResponse.json(
            { error: "Failed to upload video" },
            { status: 500 }
        );
    }
}
