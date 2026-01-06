import { NextRequest, NextResponse } from "next/server";

// Using Web Speech API on client side or Google TTS
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            );
        }

        // Use Google Cloud Text-to-Speech API
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google AI API key not configured");
        }

        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    input: { text },
                    voice: {
                        languageCode: "vi-VN",
                        name: "vi-VN-Standard-A",
                        ssmlGender: "FEMALE",
                    },
                    audioConfig: {
                        audioEncoding: "MP3",
                        pitch: 0,
                        speakingRate: 1.0,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Google TTS API error:", errorData);

            // Return a message indicating client-side TTS should be used
            return NextResponse.json(
                { useClientTTS: true, text },
                { status: 200 }
            );
        }

        const data = await response.json();

        // Return base64 audio
        return NextResponse.json({
            audioContent: data.audioContent,
            useClientTTS: false,
        });
    } catch (error) {
        console.error("Error in text-to-speech:", error);

        // Fallback to client-side TTS
        const body = await request.json();
        return NextResponse.json(
            { useClientTTS: true, text: body.text },
            { status: 200 }
        );
    }
}
