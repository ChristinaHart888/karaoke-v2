"use client";
import Image from "next/image";
import editBtn from "../images/edit-button.png";
import cancelBtn from "../images/close.png";
import { useState } from "react";

export default function ProfileForm({ user }) {
    const [editMode, setEditMode] = useState(false);
    const [newUsername, setNewUsername] = useState("");

    const logOut = () => {
        localStorage.clear();
        window.location.href = "./login";
    };

    return (
        <>
            <div
                className="heading"
                style={{ display: "flex", justifyContent: "space-between" }}
            >
                <h1>Profile</h1>
                <div className="editBtn">
                    {editMode ? (
                        <Image
                            src={cancelBtn}
                            width={32}
                            alt="X"
                            onClick={() => setEditMode(false)}
                        ></Image>
                    ) : (
                        <Image
                            src={editBtn}
                            alt="edit"
                            width={32}
                            onClick={() => setEditMode(true)}
                        ></Image>
                    )}
                </div>
            </div>
            <form
                style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "60%",
                }}
            >
                <h4>Username</h4>
                {!editMode ? (
                    <p>{user?.username}</p>
                ) : (
                    <input
                        style={{ color: "black", padding: "0.2em 0.5em" }}
                        defaultValue={user?.username}
                        onChange={(e) => setNewUsername(e.target.value)}
                    ></input>
                )}
                {editMode && (
                    <button className="btn btn-success">Save Changes</button>
                )}
                <button className="btn btn-danger" onClick={logOut}>
                    Log Out
                </button>
            </form>
        </>
    );
}
