"use client";

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Image from "next/image";
import searchIcon from "../../images/search.png";

export default function Room({ params }) {
    const id = params.id;
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const socket = io(
            location.hostname === "localhost"
                ? "http://localhost:8080"
                : "https://karaoke-v2-server.onrender.com"
        );
        socket.emit("join-room", id);
    }, []);

    return (
        <main className="container-fluid">
            <h2>Room</h2>
            <div className="content">
                <div className="search" style={{ display: "flex" }}>
                    <input
                        style={{
                            color: "black",
                            padding: "0.5em 1em",
                            borderRadius: "10em 0 0 10em",
                        }}
                        placeholder="Search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    ></input>
                    <div
                        className="searchBtn"
                        style={{
                            backgroundColor: "blue",
                            padding: "0.5em 1em",
                            borderRadius: "0 10em 10em 0",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Image src={searchIcon} alt="Enter"></Image>
                    </div>
                </div>
            </div>
        </main>
    );
}
