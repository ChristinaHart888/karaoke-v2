"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { socket } from "../../components/socket";
import Image from "next/image";
import searchIcon from "../../images/search.png";
import ReactPlayer from "react-player";
import useDB from "@/hooks/useDB";
import { query } from "firebase/firestore";
import he from "he";
import UserDropdown from "./UserDropdown";

export default function NeoDashboard({
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
    const [playing, setPlaying] = useState(true);
    const membersRef = useRef([]);
    const [doneMembers, setDoneMembers] = useState([]);
    const [membersState, setMembersState] = useState([]);
    const [currentMember, setCurrentMember] = useState();
    const [playlist, setPlaylist] = useState([]);

    const {
        deleteRoom,
        removeUserFromRoom,
        getRoomLiveData,
        getUserDetails,
        updateMembers,
        editUserPlaylist,
    } = useDB();

    const handleEditPlaylist = async ({ newPlaylist, clientUserId }) => {
        console.log("ne wplaylist", newPlaylist, "isHost", isHost);
        if (isHost.current) {
            //TODO: Edit member's playlist
            updateMembers({
                roomId: roomId,
                userId: userId,
                newMembers: membersRef.current,
            });
            const newMembers = membersRef.current.map((member) => {
                if (member.userId === clientUserId) {
                    return { ...member, playlist: newPlaylist };
                }
                return member;
            });
            // console.log(membersRef.current);
            membersRef.current = newMembers;
            //TODO: update members on firebase
            console.log("handleEditPlaylis UserId", userId);
            const res = await updateMembers({
                roomId: roomId,
                userId: userId,
                newMembers: newMembers,
            });
            if (res.result != "success") {
                console.error(res.message);
            }
        } else {
            socket.emit("edit-playlist", {
                roomId: roomId,
                userId: userId,
                username: username,
                playlist: newPlaylist,
            });
        }
    };

    useEffect(() => {
        const onNewPlaylist = (message) => {
            console.log("Message received:", message, "isHost", isHost.current);
            isHost.current &&
                handleEditPlaylist({
                    newPlaylist: message.playlist,
                    clientUserId: message.userId,
                });
        };

        socket?.on("new-playlist", onNewPlaylist);

        initPlaylist();

        //Get Real Time data on the room membersRef
        getRoomLiveData({
            setRoomMembers: (newMembers) => {
                membersRef.current = newMembers;
                setMembersState(newMembers);
                console.log("newMems", newMembers);
            },
            roomId: roomId,
        });

        return () => {
            socket?.off("new-song", onNewPlaylist);
        };
    }, []);

    // useEffect(() => {
    //     updateMembers({
    //         roomId: roomId,
    //         userId: userId,
    //         newMembers: membersRef.current,
    //     });
    //     // setMembersState(membersRef.current);
    //     // console.log("Changing member state");
    // }, [membersRef]);

    const initPlaylist = async () => {
        let uid = localStorage.getItem("userId");
        const res = await getUserDetails(uid);
        if (res?.result === "success" && res.data.playlist?.length > 0) {
            setPlaylist(res.data.playlist);
        } else {
            console.log("Something is off");
            console.log(res);
        }
    };

    function changeImageUrlToMqDefault(url) {
        if (url.includes("mqdefault.jpg")) {
            return url;
        }
        return url.replace("default.jpg", "mqdefault.jpg");
    }

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
        if (res.result === "success" || res.message === "Room is not valid") {
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

    const onEndHandler = () => {
        //TODO: Handle Member list
        //TODO: Find Next member
    };

    const suggestedVideoHandler = ({ item, thumbnail, title }) => {
        let newPlaylist = [...playlist];
        newPlaylist.push({
            link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: thumbnail,
            title: title,
        });
        console.log("New playlist", newPlaylist);
        setPlaylist(newPlaylist);
        handleEditPlaylist({
            newPlaylist: newPlaylist,
            clientUserId: userId,
        });
        setSearchTerm("");
        setSuggestedVideos([]);
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
                                onClick={() =>
                                    suggestedVideoHandler({
                                        item: item,
                                        thumbnail: newImageUrl,
                                        title: decodedTitle,
                                    })
                                }
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
                <div className="playlist">
                    <h4 style={{ marginTop: "0.5em", color: "#dc3545" }}>
                        Your Playlist
                    </h4>
                    <small>{userId}</small>

                    {playlist.length > 0 && (
                        <button
                            onClick={() =>
                                editUserPlaylist({
                                    userId: userId,
                                    playlist: playlist,
                                })
                            }
                        >
                            Update Playlist
                        </button>
                    )}
                    {playlist.map((song, index) => {
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
                {currentMember?.playlist.length > 0 && isHost.current && (
                    <>
                        <div className="player" style={{ maxWidth: "640px" }}>
                            <ReactPlayer
                                url={currentMember.playlist[0]}
                                playing={playing}
                                onEnded={onEndHandler}
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
                <div className="membersRef">
                    <h4 style={{ marginTop: "0.5em", color: "#dc3545" }}>
                        Members ({membersState.length})
                    </h4>
                    <div
                        className="memberNames"
                        style={{
                            backgroundColor: "#222",
                            paddingTop: "0.2em ",
                        }}
                    >
                        {membersState.length > 0 &&
                            membersState.map((member) => {
                                return (
                                    <UserDropdown
                                        key={member.userId}
                                        member={member}
                                    ></UserDropdown>
                                );
                            })}
                    </div>
                </div>
            </div>
            {/* End Content */}
        </main>
    );
}
