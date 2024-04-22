import React from "react";
import styles from "../styles/createRoom.module.css";

export default function Card({
    title,
    description,
    bgImg,
    isSelcted,
    onClickHandler,
}) {
    return (
        <div
            className={styles.card}
            style={{
                cursor: !isSelcted && "pointer",
                boxShadow: !isSelcted && "5px 5px 5px black",
                border: `2px solid ${isSelcted ? "green" : "black"}`,
                backgroundColor: isSelcted ? "lime" : "white",
            }}
            onClick={isSelcted ? undefined : onClickHandler}
        >
            <h4 style={{ marginTop: "auto" }}>{title}</h4>
            <small>{description}</small>
        </div>
    );
}
