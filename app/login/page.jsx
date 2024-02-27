"use client";
import { useEffect } from "react";

export default function Room() {
    useEffect(() => {
        let isLoggedIn = localStorage.getItem("userId");
        if (isLoggedIn) {
            window.location.href = "/";
        }
    }, []);
    return (
        <main className="container-fluid">
            <h1>Login</h1>
            <form
                style={{
                    backgroundColor: "gray",
                    padding: "2em",
                    display: "flex",
                    flexDirection: "column",
                }}
                className="col-xl-7 mx-auto"
            >
                <div className="email">
                    <label>Email</label>
                    <input type="email" placeholder="Email"></input>
                </div>
                <div className="password">
                    <label>Password</label>
                    <input type="password" placeholder="Password"></input>
                </div>
                <button className="mx-auto bg-warning">Login</button>
            </form>
        </main>
    );
}
