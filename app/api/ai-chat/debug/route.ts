import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        // Check auth just to be safe, though for debug sometimes we want it open. 
        // Let's keep it safe.
        const session = await getCurrentSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key not found" }, { status: 500 });
        }

        // Direct call to list models
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            { method: "GET" }
        );

        const data = await response.json();

        return NextResponse.json({
            status: response.status,
            data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
