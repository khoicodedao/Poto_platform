import { NextRequest, NextResponse } from "next/server";
import { getAllTAs } from "@/lib/actions/teaching-assistant";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getCurrentSession();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 401 }
            );
        }

        const result = await getAllTAs();

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error in admin TAs API:", error);
        return NextResponse.json(
            { error: "Failed to fetch TAs" },
            { status: 500 }
        );
    }
}
