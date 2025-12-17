"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { db, files, classes, users } from "@/db";
import { desc, eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export type FileCategory =
  | "lecture"
  | "assignment"
  | "video"
  | "audio"
  | "reference"
  | "resource";

export type FileWithMeta = {
  id: number;
  name: string;
  url: string;
  type: string;
  size: number;
  classId: number | null;
  classTitle: string | null;
  uploadedById: number;
  uploaderName: string | null;
  uploadedAt: Date | null;
  downloads: number;
  category: FileCategory;
};

export interface UploadFileData {
  name: string;
  url: string;
  type: string;
  size: number;
  classId?: number;
}

const detectCategory = (type?: string | null, name?: string | null) => {
  const normalized = (type || "").toLowerCase();
  const extension = (name || "").split(".").pop()?.toLowerCase();

  if (normalized.includes("video") || extension === "mp4" || extension === "mov") {
    return "video";
  }

  if (normalized.includes("audio") || extension === "mp3" || extension === "wav") {
    return "audio";
  }

  if (
    extension === "ppt" ||
    extension === "pptx" ||
    extension === "key" ||
    extension === "odp"
  ) {
    return "lecture";
  }

  if (extension === "zip" || extension === "rar") {
    return "resource";
  }

  if (extension === "doc" || extension === "docx" || extension === "pdf") {
    return "assignment";
  }

  return "reference";
};

const mapFileRecord = (row: {
  id: number;
  name: string;
  url: string;
  type: string | null;
  size: number | null;
  classId: number | null;
  classTitle: string | null;
  uploadedById: number;
  uploaderName: string | null;
  uploadedAt: Date | null;
  downloadCount: number | null;
}): FileWithMeta => ({
  id: row.id,
  name: row.name,
  url: row.url,
  type: row.type ?? "unknown",
  size: row.size ?? 0,
  classId: row.classId,
  classTitle: row.classTitle ?? null,
  uploadedById: row.uploadedById,
  uploaderName: row.uploaderName ?? null,
  uploadedAt: row.uploadedAt,
  downloads: row.downloadCount ?? 0,
  category: detectCategory(row.type, row.name),
});

const sanitizeFileName = (input: string) => {
  return (
    input
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "file"
  );
};

export async function getFiles(classId?: number): Promise<FileWithMeta[]> {
  try {
    const query = db
      .select({
        id: files.id,
        name: files.name,
        url: files.url,
        type: files.type,
        size: files.size,
        classId: files.classId,
        classTitle: classes.name,
        uploadedById: files.uploadedById,
        uploaderName: users.name,
        uploadedAt: files.uploadedAt,
        downloadCount: files.downloadCount,
      })
      .from(files)
      .leftJoin(classes, eq(files.classId, classes.id))
      .leftJoin(users, eq(files.uploadedById, users.id))
      .orderBy(desc(files.uploadedAt));

    const rows = classId ? await query.where(eq(files.classId, classId)) : await query;
    return rows.map(mapFileRecord);
  } catch (error) {
    console.error("Error fetching files:", error);
    return [];
  }
}

export async function getFilesByCategory(category: FileCategory) {
  const all = await getFiles();
  return all.filter((file) => file.category === category);
}

export async function incrementDownload(fileId: number) {
  try {
    const [updated] = await db
      .update(files)
      .set({ downloadCount: sql`${files.downloadCount} + 1` })
      .where(eq(files.id, fileId))
      .returning({ downloadCount: files.downloadCount });

    revalidatePath("/files");

    return { success: true, downloads: updated?.downloadCount ?? 0 };
  } catch (error) {
    console.error("Error incrementing download count:", error);
    return { success: false, error: "Không thể cập nhật lượt tải" };
  }
}

export async function uploadFile(data: UploadFileData) {
  try {
    const user = await requireAuth();

    const [newFile] = await db
      .insert(files)
      .values({
        name: data.name,
        url: data.url,
        type: data.type,
        size: data.size,
        classId: data.classId || null,
        uploadedById: user.id,
      })
      .returning();

    revalidatePath("/files");
    if (data.classId) {
      revalidatePath(`/classes/${data.classId}`);
    }

    return { success: true, id: newFile.id };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, error: "Không thể tải lên tệp" };
  }
}

export async function uploadClassFile(formData: FormData) {
  try {
    const user = await requireAuth();

    if (user.role === "student") {
      return { success: false, error: "Chỉ giáo viên có thể tải tài liệu" };
    }

    const classId = Number(formData.get("classId"));
    const file = formData.get("file") as File | null;
    const displayName = (formData.get("displayName") as string | null)?.trim();

    if (!classId || Number.isNaN(classId)) {
      return { success: false, error: "Vui lòng chọn lớp học" };
    }

    if (!file || file.size === 0) {
      return { success: false, error: "Vui lòng chọn tệp hợp lệ" };
    }

    const [classRecord] = await db
      .select({
        id: classes.id,
        teacherId: classes.teacherId,
      })
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (!classRecord) {
      return { success: false, error: "Không tìm thấy lớp học" };
    }

    if (user.role === "teacher" && classRecord.teacherId !== user.id) {
      return { success: false, error: "Bạn không có quyền tải tài liệu cho lớp này" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || (file.type ? `.${file.type.split("/").pop()}` : "");
    const baseName = sanitizeFileName(path.basename(file.name, path.extname(file.name)));
    const storedName = `${Date.now()}-${baseName}${ext || ""}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", `${classId}`);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, storedName), buffer);

    const publicUrl = `/uploads/${classId}/${storedName}`;

    const [created] = await db
      .insert(files)
      .values({
        name: displayName || file.name,
        url: publicUrl,
        type: file.type || ext.replace(".", "") || "file",
        size: buffer.length,
        classId,
        uploadedById: user.id,
      })
      .returning();

    revalidatePath("/files");
    revalidatePath(`/classes/${classId}`);

    return { success: true, id: created.id };
  } catch (error) {
    console.error("Error uploading class file:", error);
    return { success: false, error: "Không thể tải lên tài liệu" };
  }
}

export async function deleteFile(id: number) {
  try {
    const user = await requireAuth();

    const [fileRecord] = await db
      .select()
      .from(files)
      .where(eq(files.id, id))
      .limit(1);

    if (!fileRecord) {
      return { success: false, error: "Không tìm thấy tệp" };
    }

    if (fileRecord.uploadedById !== user.id && user.role !== "admin") {
      return { success: false, error: "Bạn không có quyền xóa tệp này" };
    }

    await db.delete(files).where(eq(files.id, id));

    if (fileRecord.url && !fileRecord.url.startsWith("http")) {
      try {
        const filePath = path.join(process.cwd(), "public", fileRecord.url);
        await unlink(filePath);
      } catch (fsError) {
        console.warn("Could not remove file from disk:", fsError);
      }
    }

    revalidatePath("/files");
    if (fileRecord.classId) {
      revalidatePath(`/classes/${fileRecord.classId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false, error: "Không thể xóa tệp" };
  }
}
