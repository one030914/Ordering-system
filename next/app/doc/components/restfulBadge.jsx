"use client";

import { useEffect, useState } from "react";

export default function RestfulBadge({ type }) {
    const [backgroundColor, setBackgroundColor] = useState("");
    const [text, setText] = useState(null);
    useEffect(() => {
        switch (type) {
            case "get":
                setBackgroundColor("#6bdd9a");
                setText("GET");
                return;
            case "delete":
                setBackgroundColor("#f7998e");
                setText("DELETE");
                return;
            case "put":
                setBackgroundColor("#fce47d");
                setText("PUT");
                return;
            case "patch":
                setBackgroundColor("#c0a9e1");
                setText("PATCH");
                return;
            case "post":
                setBackgroundColor("#cc8787");
                setText("POST");
                return;
            default:
                console.error("restfulBadge: 錯誤的type");
        }
    }, [type]);
    return (
        text !== null && (
            <code
                className="rounded-sm"
                style={{
                    backgroundColor: backgroundColor,
                    color: "black",
                    fontWeight: "bold",
                    padding: "0.2rem 0.4rem 0.2rem 0.4rem",
                }}
            >
                {text}
            </code>
        )
    );
}
