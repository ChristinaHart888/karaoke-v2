"use client";
import React, { useEffect } from "react";

export default function Profile() {
    useEffect(() => {
        let isLoggedIn = localStorage.getItem("userId");
        if (isLoggedIn) {
        } else {
            window.location.href = "/login";
        }
    }, []);
    return (
        <main className="container-fluid">
            <h1>Profile</h1>
        </main>
    );
}
