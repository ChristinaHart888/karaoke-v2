"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { socket } from "../../components/socket";
import useDB from "@/hooks/useDB";
import ClassicDashboard from "./ClassicDashboard";
import NeoDashboard from "./NeoDashboard";

export default function Room({ params }) {
    const roomId = params.id;
    const [isConnected, setIsconnected] = useState(false);
    const [roomName, setRoomName] = useState();
    const [isMobile, setIsMobile] = useState();
    const isClassicMode = useRef(null);
    const isHost = useRef(null);
    const userId = useRef();
    const username = useRef("Unnamed");
    const { getRoomDetails } = useDB();

    useEffect(() => {
        initRoom();

        const onConnect = () => {
            setIsconnected(true);
            socket?.emit("join-room", roomId);
        };

        const onDisconnect = () => {
            setIsconnected(false);
            console.log("Disconnn");
            socket.connect();
        };

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        socket?.on("connect", onConnect);
        socket?.on("disconnect", onDisconnect);
        socket?.on("connect_error", (e) => {
            console.log("connect error");
            if (socket.active) {
                console.log("Socket active tho");
            } else {
                console.log(e.message);
            }
        });
        window.addEventListener("resize", handleResize);

        handleResize();

        return () => {
            socket?.off("connect", onConnect);
            socket?.off("disconnect", onDisconnect);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const initRoom = async () => {
        //TODO: Validate Room
        userId.current = localStorage.getItem("userId");
        username.current = localStorage.getItem("username");

        const roomDetails = await getRoomDetails({ roomId: roomId });
        if (roomDetails.result === "success") {
            isHost.current =
                localStorage.getItem("userId") == roomDetails.data.host;
            setRoomName(roomDetails.data.roomName);
            if (isHost.current && roomDetails.data.queue.length > 0) {
                isClassicMode.current = roomDetails.data.classicMode;
            }
        } else {
            alert(roomDetails.message);
        }
    };

    return (
        <main className="container-fluid">
            {isClassicMode.current ? (
                <ClassicDashboard
                    userId={userId.current}
                    username={username.current}
                    roomId={roomId}
                    isConnected={isConnected}
                    roomName={roomName}
                    isMobile={isMobile}
                    isHost={isHost}
                ></ClassicDashboard>
            ) : (
                <NeoDashboard
                    userId={userId.current}
                    username={username.current}
                    roomId={roomId}
                    isConnected={isConnected}
                    roomName={roomName}
                    isMobile={isMobile}
                    isHost={isHost}
                ></NeoDashboard>
            )}
        </main>
    );
}
