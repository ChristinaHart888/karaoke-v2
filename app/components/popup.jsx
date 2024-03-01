/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import styles from "../styles/signin.module.css";

const Popup = ({
    errorMessage: errorMessage,
    setErrorMessage: setErrorMessage,
    timeout: timeout,
}) => {
    useEffect(() => {
        timeout &&
            typeof timeout === "number" &&
            errorMessage != "" &&
            setTimeout(() => setErrorMessage(""), timeout);
    }, [errorMessage]);

    return (
        <div className={errorMessage ? styles.popUpShow : styles.popUpHide}>
            <div
                className="heading"
                style={{ display: "flex", justifyContent: "space-around" }}
            >
                <h4 style={{ margin: "0px", width: "50%" }}>Error</h4>
                <small
                    style={{ width: "50%", textAlign: "right" }}
                    onClick={() => setErrorMessage("")}
                >
                    Close
                </small>
            </div>

            <p className={styles.errorMessage}>{errorMessage}</p>
        </div>
    );
};

export default Popup;
