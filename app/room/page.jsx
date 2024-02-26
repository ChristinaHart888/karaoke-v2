"use client";
import React, { useState } from "react";
import useDB from "../components/useDB";

export default function Page() {
    const [roomlist, setRoomlist] = useState([]);
    const { getRooms } = useDB();

    const getData = async () => {
        getRooms(setRoomlist);
    };

    useState(() => {
        getData();
    }, []);
    return (
        <main className="container-fluid">
            <h2>Room List</h2>
            {roomlist?.map((room) => {
                const roomData = room.data();
                console.log("room Data:", roomData);
                const roomName = roomData.name;
                return <div key={room.id}>{roomName}</div>;
            })}
        </main>
    );
}
