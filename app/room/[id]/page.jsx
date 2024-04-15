"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { socket } from "../../components/socket";
import Image from "next/image";
import searchIcon from "../../images/search.png";
import ReactPlayer from "react-player";
import useDB from "@/hooks/useDB";
import { query } from "firebase/firestore";
import he from "he";

export default function Room({ params }) {
    const roomId = params.id;
    const [searchTerm, setSearchTerm] = useState("");
    const [members, setMembers] = useState([]);
    const [currentVideoLink, setCurrentVideoLink] = useState("");
    const [isConnected, setIsconnected] = useState(false);
    const { getRoomLiveData } = useDB();
    const cachedResults = useMemo(() => new Map(), []);
    const [suggestedVideos, setSuggestedVideos] = useState();
    const [isHost, setIsHost] = useState(null);

    const userId = useRef(localStorage.getItem("userId"));

    useEffect(() => {
        initRoom();

        const onConnect = () => {
            setIsconnected(true);
            socket?.emit("join-room", roomId);
        };

        const onNewSong = (message) => {
            console.log("Message received:", message);
        };

        const onDisconnect = () => {
            setIsconnected(false);
            console.log("Disconnn");
        };

        socket?.on("connect", onConnect);
        socket?.on("new-song", onNewSong);
        socket?.on("disconnect", onDisconnect);

        return () => {
            socket?.off("connect", onConnect);
            socket?.off("new-song", onNewSong);
            socket?.off("disconnect", onDisconnect);
        };
    }, []);

    const initRoom = async () => {
        //TODO: Validate Room
        //Get Real Time data on the room members
        getRoomLiveData({ setRoomMembers: setMembers, roomId: roomId });
    };

    const handleAddSong = ({ link }) => {
        socket.emit("add-song", { roomId: roomId, userId: userId, link: link });
    };

    const handleSearch = async () => {
        const apiKey = process.env.GOOGLE_CLOUD_API_KEY
            ? process.env.GOOGLE_CLOUD_API_KEY
            : "AIzaSyAxgBn1w01vsaA24uIE2TkUw8iMaUrF8fk";
        if (searchTerm === "") {
            setSuggestedVideos([]);
        } else if (cachedResults.has(searchTerm) && cachedResults.get(query)) {
            setSuggestedVideos(cachedResults.get(query));
        } else {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchTerm}&type=video&key=${apiKey}`
            );
            const data = await response.json();
            cachedResults.set(searchTerm, data.items);
            setSuggestedVideos(data.items);
        }
    };

    return (
        <main className="container-fluid">
            <h2>Room</h2>
            <div className="content">
                <div className="search">
                    <form action={handleSearch} style={{ display: "flex" }}>
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
                        <button
                            className="searchBtn"
                            style={{
                                backgroundColor: "blue",
                                padding: "0.5em 1em",
                                borderRadius: "0 10em 10em 0",
                                display: "flex",
                                justifyContent: "center",
                            }}
                            type="submit"
                        >
                            <Image
                                src={searchIcon}
                                alt="Enter"
                                style={{ cursor: "pointer" }}
                            ></Image>
                        </button>
                    </form>
                </div>
                {suggestedVideos?.length > 0 &&
                    suggestedVideos.map((item, index) => {
                        return (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    backgroundColor: "#444",
                                    color: "white",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    console.log(item);
                                    handleAddSong({
                                        link: item.id.videoId,
                                    });
                                    setSearchTerm("");
                                    setSuggestedVideos([]);
                                }}
                            >
                                <img
                                    src={item.snippet.thumbnails.default.url}
                                    alt=""
                                />
                                <p>{he.decode(item.snippet.title)}</p>
                            </div>
                        );
                    })}
                {/* End Search */}
                {currentVideoLink && (
                    <ReactPlayer
                        url={currentVideoLink}
                        playing={true}
                    ></ReactPlayer>
                )}
            </div>
            {/* End Content */}
        </main>
    );
}
