import React from "react";
import styles from "../styles/login.module.css";

export default function TextInput({
    label,
    type = "text",
    onChange,
    required = false,
}) {
    return (
        <div className={styles.inputContainer}>
            {required ? (
                <input
                    type={type}
                    id="email"
                    className={styles.formInput}
                    placeholder=""
                    onChange={(e) => onChange(e.target.value)}
                    required
                ></input>
            ) : (
                <input
                    type={type}
                    id="email"
                    className={styles.formInput}
                    placeholder=""
                    onChange={(e) => onChange(e.target.value)}
                ></input>
            )}
            <label htmlFor="email" className={styles.label}>
                {label}
            </label>
        </div>
    );
}
