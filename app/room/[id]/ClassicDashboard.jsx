"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { socket } from "../../components/socket";
import Image from "next/image";
import searchIcon from "../../images/search.png";
import ReactPlayer from "react-player";
import useDB from "@/hooks/useDB";
import { query } from "firebase/firestore";
import he from "he";

export default function ClassicDashboard({
    userId,
    username,
    roomId,
    isConnected,
    roomName,
    isMobile,
    isHost,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const cachedResults = useMemo(() => new Map(), []);
    const [suggestedVideos, setSuggestedVideos] = useState();
    const [queue, setQueue] = useState([]);
    const [playing, setPlaying] = useState(true);
    const [members, setMembers] = useState([]);

    const { deleteRoom, removeUserFromRoom, updateQueue, getRoomLiveData } =
        useDB();

    const handleAddSong = ({ link, title, thumbnail }) => {
        if (isHost.current) {
            setQueue((prev) => [...prev, { link, title, thumbnail }]);
        } else {
            socket.emit("add-song", {
                roomId: roomId,
                userId: userId,
                username: username,
                link: link,
                title: title,
                thumbnail: thumbnail,
            });
        }
    };

    useEffect(() => {
        const onNewSong = (message) => {
            console.log("Message received:", message, "isHost", isHost.current);
            isHost.current &&
                handleAddSong({
                    link: message.link,
                    thumbnail: message.thumbnail,
                    title: message.title,
                });
        };

        socket?.on("new-song", onNewSong);

        //Get Real Time data on the room members
        getRoomLiveData({
            setRoomMembers: setMembers,
            roomId: roomId,
            setQueue: isHost.current ? null : setQueue,
        });

        return () => {
            socket?.off("new-song", onNewSong);
        };
    }, []);

    useEffect(() => {
        updateQueueHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queue]);

    function changeImageUrlToMqDefault(url) {
        if (url.includes("mqdefault.jpg")) {
            return url;
        }
        return url.replace("default.jpg", "mqdefault.jpg");
    }

    const updateQueueHandler = async () => {
        const res = await updateQueue({
            roomId: roomId,
            userId: userId,
            newQueue: queue,
        });
        if (res.result !== "success") {
            console.error(res.message);
        }
    };

    const handleSearch = async () => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY;
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

    const leaveRoomHandler = async () => {
        const res = await removeUserFromRoom({
            userId: userId,
            roomId: roomId,
        });
        if (res.result === "success") {
            window.location.href = "/room";
            console.log("redir");
        } else {
            console.error(res.message);
        }
    };

    const deleteRoomHandler = async () => {
        console.log("del room");
        const res = await deleteRoom({
            roomId: roomId,
            userId: userId,
        });
        if (res.result === "success") {
            window.location.href = "/room";
            console.log("redir");
        } else {
            console.error(res.message);
        }
    };

    return (
        <main className="container-fluid">
            <h2 style={{ color: "#dc3545" }}>{roomName ? roomName : "Room"}</h2>
            <div className="top" style={{ display: "flex", margin: "1em 0" }}>
                <small style={{ color: isConnected ? "green" : "red" }}>
                    {isConnected ? "Connected" : "Disconnected"}
                </small>
                <div
                    className="buttonGroup"
                    style={{ marginRight: "0", marginLeft: "auto" }}
                >
                    {!isConnected && (
                        <button
                            onClick={() => {
                                socket.disconnect();
                                socket.connect();
                            }}
                        >
                            Re Connect
                        </button>
                    )}
                    {isHost.current ? (
                        <button onClick={deleteRoomHandler}>Delete Room</button>
                    ) : (
                        <button onClick={leaveRoomHandler}>Leave Room</button>
                    )}
                </div>
            </div>

            {/* <small style={{ color: isHost.current ? "green" : "red" }}>
                {isHost.current ? "Host" : "Not Host"}
            </small> */}

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
                        const newImageUrl = changeImageUrlToMqDefault(
                            item.snippet.thumbnails.medium.url
                        );
                        const decodedTitle = he.decode(item.snippet.title);
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
                                        link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                                        thumbnail: newImageUrl,
                                        title: decodedTitle,
                                    });
                                    setSearchTerm("");
                                    setSuggestedVideos([]);
                                }}
                            >
                                <Image
                                    src={newImageUrl}
                                    alt=""
                                    width={isMobile ? 160 : 320}
                                    height={isMobile ? 90 : 180}
                                />
                                <p>{decodedTitle}</p>
                            </div>
                        );
                    })}
                {/* End Search */}
                {queue.length > 0 && isHost.current && (
                    <>
                        <div className="player" style={{ maxWidth: "640px" }}>
                            <ReactPlayer
                                url={queue[0].link}
                                playing={playing}
                                onEnded={() => {
                                    const newQueue = [...queue];
                                    newQueue.splice(0, 1);
                                    setQueue(newQueue);
                                }}
                                width="100%"
                                height={isMobile ? "100%" : undefined}
                            ></ReactPlayer>
                        </div>

                        <div className="controls">
                            <div
                                className="playPause"
                                onClick={() => setPlaying((prev) => !prev)}
                            >
                                {playing ? "Pause" : "Play"}
                            </div>
                        </div>
                    </>
                )}
                <div className="queue">
                    {queue.length > 0 && (
                        <h4 style={{ color: "#dc3545" }}>Queue</h4>
                    )}
                    {queue.map((song, index) => {
                        return (
                            <div key={index}>
                                <Image
                                    src={song.thumbnail}
                                    alt=""
                                    width={320}
                                    height={180}
                                ></Image>
                                <p style={{ color: "white" }}>{song.title}</p>
                            </div>
                        );
                    })}
                </div>
                <div className="members">
                    <h4 style={{ marginTop: "0.5em", color: "#dc3545" }}>
                        Members
                    </h4>
                    <div
                        className="memberNames"
                        style={{
                            backgroundColor: "#222",
                            paddingTop: "0.2em ",
                        }}
                    >
                        {members.length > 0 &&
                            members.map((member) => {
                                return (
                                    <div
                                        key={member.userId}
                                        style={{
                                            color: "white",
                                            margin: "0.5em 1em",
                                            borderBottom: "1px solid black",
                                            padding: "0.5em",
                                        }}
                                    >
                                        {member.username}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
            {/* End Content */}
        </main>
    );
}
