"use client";
import React, { useRef, useState } from "react";
import useDB from "../../hooks/useDB";
import Modal from "react-modal";
import ReactModal from "react-modal";
import TextInput from "../components/TextInput";
import Card from "./Card";

export default function Page() {
    const [roomlist, setRoomlist] = useState([]);
    const [newRoomName, setNewRoomName] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [useClassicMode, setUseClassicMode] = useState(true);
    const userId = useRef();
    const username = useRef();
    const { getRooms, createRoom, addUserToRoom } = useDB();

    const getData = async () => {
        getRooms(setRoomlist);
        //TODO: Check if user is alr in a room
    };

    useState(() => {
        getData();
        userId.current = localStorage.getItem("userId");
        username.current = localStorage.getItem("username");
    }, []);

    const isInRoom = async () => {};

    const joinRoomHandler = async (roomID) => {
        let isLoggedIn = localStorage.getItem("userId");
        if (isLoggedIn) {
            //TODO: Validate Acc
            //TODO: Check if user is alr in a room
            const res = await addUserToRoom({
                userId: userId.current,
                roomId: roomID,
                username: username.current,
            });
            if (res.result === "success") {
                window.location.href = `/room/${roomID}`;
            } else {
                console.error(res.message);
            }
        } else {
            alert("You need to login bruv");
        }
    };

    const createRoomHandler = async (e) => {
        e.preventDefault();

        const res = await createRoom({
            userId: userId.current,
            username: username.current,
            roomName: newRoomName,
            classicMode: useClassicMode,
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
                    <div className="mode">
                        <h3>Mode</h3>
                        <div
                            className="modeSelector"
                            style={{
                                display: "flex",
                                gap: "1em",
                                marginBottom: "1em",
                            }}
                        >
                            <Card
                                title={"Classic Mode"}
                                description={"The OG"}
                                isSelcted={useClassicMode === true}
                                onClickHandler={() => setUseClassicMode(true)}
                            ></Card>
                            <Card
                                title={"Neo Mode"}
                                description={"New && Improved"}
                                isSelcted={useClassicMode !== true}
                                onClickHandler={() => setUseClassicMode(false)}
                            ></Card>
                        </div>
                    </div>
                    <button type="submit">Create</button>
                </form>
            </ReactModal>
            {roomlist?.map((room) => {
                const roomData = room.data();
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
