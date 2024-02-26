"use client";

import React, { useEffect } from "react";
import { io } from "socket.io-client";

export default function Room({ id }) {
  useEffect(() => {
    console.log("hi");
    const socket = io(
      location.hostname === "localhost"
        ? "http://localhost:8080"
        : "https://karaoke-v2-server.onrender.com"
    );
  }, []);

  return (
    <main className="container-fluid">
      <h2>Room</h2>
    </main>
  );
}
