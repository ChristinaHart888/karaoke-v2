"use client";
import React, { useEffect, useState } from "react";
import ProfileForm from "./ProfileForm";
import useDB from "@/hooks/useDB";
import Popup from "../components/popup";

export default function Profile() {
    const { getUserDetails } = useDB();
    const [user, setUser] = useState();
    const [windowWidth, setWindowWidth] = useState();
    const [errorMessage, setErrorMessage] = useState();

    //TODO: Convert windowWidth state to useMobileView

    useEffect(() => {
        let userId = localStorage.getItem("userId");
        if (userId) {
            initUser(userId);
        } else {
            window.location.href = "/login";
        }
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const updateDimensions = () => {
        setWindowWidth(window.innerWidth);
    };

    const initUser = async (userId) => {
        let result = await getUserDetails(userId);
        if (result.result === "success") {
            setUser(result.data);
        } else {
            setErrorMessage(result.message);
        }
    };

    const [currentTab, setCurrentTab] = useState("Profile");

    return (
        <main className="container-fluid">
            <h1>Profile</h1>
            <div
                className="content"
                style={{
                    color: "white",
                    display: "flex",
                    width: "100%",
                    backgroundColor: "#444",
                    padding: "0.5em 1em",
                    flexDirection: windowWidth >= 768 ? "row" : "column",
                }}
            >
                <div
                    className="sidebar col-md-2 p-1 py-4 col-12"
                    style={{
                        display: "flex",
                        flexDirection: windowWidth >= 768 ? "column" : "row",
                    }}
                >
                    <div
                        className="profile"
                        onClick={() => setCurrentTab("Profile")}
                    >
                        Profile
                    </div>
                    <div
                        className="settings"
                        onClick={() => setCurrentTab("Settings")}
                    >
                        Settings
                    </div>
                </div>
                <div
                    className="fields col-md-10 col-12"
                    style={{
                        padding: "1em",
                    }}
                >
                    {currentTab === "Profile" && <ProfileForm user={user} />}
                </div>
            </div>
            <Popup
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                timeout={5000}
            ></Popup>
        </main>
    );
}
