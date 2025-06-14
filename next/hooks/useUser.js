"use client";

import { useEffect, useState } from "react";

export default function useUser() {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = sessionStorage.getItem("user");
        setUser(JSON.parse(user));
        setLoading(false);
    }, []);
    const userSetter = (user) => {
        if (!user) {
            sessionStorage.removeItem("user");
            setUser({});
            return;
        }
        sessionStorage.setItem("user", JSON.stringify(user));
        setUser(user);
    };

    return { user, setUser: userSetter, loading };
}
