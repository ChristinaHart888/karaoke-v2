"use client";
import React, { useState } from "react";
import useDB from "../../hooks/useDB";
import Modal from "react-modal";
import ReactModal from "react-modal";
import TextInput from "../components/TextInput";

export default function Page() {
    const [roomlist, setRoomlist] = useState([]);
    const [newRoomName, setNewRoomName] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { getRooms, createRoom } = useDB();

    const getData = async () => {
        getRooms(setRoomlist);
        //TODO: Check if user is alr in a room
    };

    useState(() => {
        getData();
    }, []);

    const isInRoom = async () => {};

    const joinRoomHandler = async (roomID) => {
        let isLoggedIn = localStorage.getItem("userId");
        if (isLoggedIn) {
            //TODO: Validate Acc
            window.location.href = `/room/${roomID}`;
            //TODO: Handle firebase
        } else {
            alert("You need to login bruv");
        }
    };

    const createRoomHandler = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");
        const username = localStorage.getItem("username");

        const res = await createRoom({
            userId: userId,
            username: username,
            roomName: newRoomName,
        });

        if (res.result === "success") {
            window.location.href = `room/${res.roomId}`;
        }
        console.log(res);
    };

    return (
        <main className="container">
            <h1 style={{ color: "#dc3545" }}>Room List</h1>
            <button onClick={() => setModalIsOpen(true)}>Add Room</button>
            <ReactModal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}
            >
                <form onSubmit={createRoomHandler}>
                    <h2>Create New Room</h2>
                    <TextInput
                        onChange={setNewRoomName}
                        label={"Room Name"}
                        required={true}
                    ></TextInput>
                    <button type="submit">Create</button>
                </form>
            </ReactModal>
            {roomlist?.map((room) => {
                const roomData = room.data();
                console.log("room Data:", roomData);
                const roomName = roomData.roomName;
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
