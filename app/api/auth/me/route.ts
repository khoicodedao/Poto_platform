import { type NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Không có phiên đăng nhập" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        avatar: session.user.avatar,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
