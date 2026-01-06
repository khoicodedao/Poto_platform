import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiChatTopics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth";

// GET - List all topics for a class
export async function GET(request: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const classId = searchParams.get("classId");

        if (!classId) {
            return NextResponse.json(
                { error: "Class ID is required" },
                { status: 400 }
            );
        }

        const topics = await db
            .select()
            .from(aiChatTopics)
            .where(
                and(
                    eq(aiChatTopics.classId, parseInt(classId)),
                    eq(aiChatTopics.isActive, true)
                )
            )
            .orderBy(aiChatTopics.createdAt);

        return NextResponse.json({ topics });
    } catch (error) {
        console.error("Error fetching topics:", error);
        return NextResponse.json(
            { error: "Failed to fetch topics" },
            { status: 500 }
        );
    }
}

// POST - Create a new topic
export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { classId, title, description, systemPrompt } = body;

        if (!classId || !title || !systemPrompt) {
            return NextResponse.json(
                { error: "Class ID, title, and system prompt are required" },
                { status: 400 }
            );
        }

        const [topic] = await db
            .insert(aiChatTopics)
            .values({
                classId: parseInt(classId),
                title,
                description,
                systemPrompt,
                createdBy: session.user.id,
            })
            .returning();

        return NextResponse.json({ topic }, { status: 201 });
    } catch (error) {
        console.error("Error creating topic:", error);
        return NextResponse.json(
            { error: "Failed to create topic" },
            { status: 500 }
        );
    }
}

// PUT - Update a topic
export async function PUT(request: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, title, description, systemPrompt, isActive } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Topic ID is required" },
                { status: 400 }
            );
        }

        const [topic] = await db
            .update(aiChatTopics)
            .set({
                title,
                description,
                systemPrompt,
                isActive,
                updatedAt: new Date(),
            })
            .where(eq(aiChatTopics.id, parseInt(id)))
            .returning();

        return NextResponse.json({ topic });
    } catch (error) {
        console.error("Error updating topic:", error);
        return NextResponse.json(
            { error: "Failed to update topic" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a topic
export async function DELETE(request: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Topic ID is required" },
                { status: 400 }
            );
        }

        await db.delete(aiChatTopics).where(eq(aiChatTopics.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting topic:", error);
        return NextResponse.json(
            { error: "Failed to delete topic" },
            { status: 500 }
        );
    }
}
