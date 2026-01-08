"use client";

import { useEffect } from "react";

export function ZaloChatWidget() {
    useEffect(() => {
        // Load Zalo SDK script
        const script = document.createElement("script");
        script.src = "https://sp.zalo.me/plugins/sdk.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Cleanup script when component unmounts
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return (
        <div
            className="zalo-chat-widget"
            data-oaid="194643797257239355"
            data-welcome-message="Rất vui khi được hỗ trợ bạn!"
            data-autopopup="0"
            data-width=""
            data-height=""
        />
    );
}
