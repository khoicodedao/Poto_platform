import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiChatMessages, aiChatTopics } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth";

// GET - Get chat history for a topic
export async function GET(request: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const topicId = searchParams.get("topicId");

        if (!topicId) {
            return NextResponse.json(
                { error: "Topic ID is required" },
                { status: 400 }
            );
        }

        const messages = await db
            .select()
            .from(aiChatMessages)
            .where(
                and(
                    eq(aiChatMessages.topicId, parseInt(topicId)),
                    eq(aiChatMessages.studentId, session.user.id)
                )
            )
            .orderBy(aiChatMessages.createdAt);

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

// POST - Send a message and get AI response
export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { topicId, content, audioUrl } = body;

        if (!topicId || !content) {
            return NextResponse.json(
                { error: "Topic ID and content are required" },
                { status: 400 }
            );
        }

        // Get topic to retrieve system prompt
        const [topic] = await db
            .select()
            .from(aiChatTopics)
            .where(eq(aiChatTopics.id, parseInt(topicId)))
            .limit(1);

        if (!topic) {
            return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        }

        // Save user message
        await db.insert(aiChatMessages).values({
            topicId: parseInt(topicId),
            studentId: session.user.id,
            role: "user",
            content,
            audioUrl,
        });

        // Get conversation history for context
        const history = await db
            .select()
            .from(aiChatMessages)
            .where(
                and(
                    eq(aiChatMessages.topicId, parseInt(topicId)),
                    eq(aiChatMessages.studentId, session.user.id)
                )
            )
            .orderBy(desc(aiChatMessages.createdAt))
            .limit(20); // Last 20 messages for context

        // Reverse to get chronological order
        const conversationHistory = history.reverse();

        // Call Google AI API using SDK
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google AI API key not configured");
        }

        // Dynamically import to avoid build issues if package missing
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);

        // Use gemini-2.0-flash-lite for better rate limits
        // We inject system prompt into the message to ensure compatibility
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite-preview-02-05",
        });

        const chat = model.startChat({
            history: conversationHistory.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content || "" }],
            })),
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });

        // Inject system prompt into the final message
        const fullContent = topic.systemPrompt
            ? `Instructions: ${topic.systemPrompt}\n\nUser message: ${content}`
            : content;

        const result = await chat.sendMessage(fullContent);
        const aiResponse = result.response.text();
        const aiContent = aiResponse || "Xin lỗi, tôi không thể trả lời lúc này.";

        // Save AI response
        const [assistantMessage] = await db
            .insert(aiChatMessages)
            .values({
                topicId: parseInt(topicId),
                studentId: session.user.id,
                role: "assistant",
                content: aiContent,
            })
            .returning();

        return NextResponse.json({ message: assistantMessage });
    } catch (error) {
        console.error("Error in chat:", error);
        return NextResponse.json(
            { error: "Failed to process message" },
            { status: 500 }
        );
    }
}