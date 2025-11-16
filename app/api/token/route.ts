import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.LIVEKIT_URL!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomName, userId, userName } = body;

    if (!roomName || !userId || !userName) {
      return NextResponse.json(
        { error: "Missing roomName / userId / userName" },
        { status: 400 }
      );
    }

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId, // unique per user
      name: userName,
    });

    // cấp quyền join room
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      url: LIVEKIT_URL,
    });
  } catch (error) {
    console.error("Error creating LiveKit token:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
