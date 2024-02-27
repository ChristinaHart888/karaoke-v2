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

    const joinRoomHandler = async (roomID) => {
        let isLoggedIn = localStorage.getItem("userId");
        if (isLoggedIn) {
            //TODO: Validate Acc
            window.location.href = `/room/${roomID}`;
        } else {
            alert("You need to login bruv");
        }
    };
    return (
        <main className="container-fluid">
            <h2>Room List</h2>
            {roomlist?.map((room) => {
                const roomData = room.data();
                console.log("room Data:", roomData);
                const roomName = roomData.name;
                return (
                    <div
                        key={room.id}
                        style={{
                            backgroundColor: "gray",
                            padding: "0.5em 1em",
                            display: "flex",
                        }}
                    >
                        <div className="roomInfo" style={{ width: "90%" }}>
                            {roomName}
                        </div>

                        <button
                            style={{
                                backgroundColor: "green",
                                padding: "0.5em 1em",
                            }}
                            onClick={() => joinRoomHandler(room.id)}
                        >
                            Join Room
                        </button>
                    </div>
                );
            })}
        </main>
    );
}
