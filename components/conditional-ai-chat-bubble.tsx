"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AIChatBubble } from "./ai-chat-bubble";

export function ConditionalAIChatBubble() {
    const pathname = usePathname();
    const [classId, setClassId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        // Extract classId from pathname if in a class route
        const match = pathname?.match(/\/classes\/(\d+)/);
        if (match) {
            setClassId(parseInt(match[1]));
        } else {
            setClassId(null);
        }
    }, [pathname]);

    const fetchUserInfo = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setStudentId(data.user?.id || null);
                setUserRole(data.user?.role || null);
            }
        } catch (e) {
            console.error("Failed to fetch user info:", e);
        }
    };

    // Only show for students in a class route
    const shouldShow = userRole === "student" && classId && studentId;

    if (!shouldShow) return null;

    return <AIChatBubble classId={classId} studentId={studentId} />;
}
