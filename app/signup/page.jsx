"use client";
import { useState } from "react";
import styles from "../styles/signin.module.css";
import Link from "next/link";
import Popup from "../components/popup";
import useDB from "@/hooks/useDB";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { registerUser } = useDB();

    const signUpHandler = async () => {
        if (username && password) {
            const result = await registerUser({
                email: email,
                username: username,
                password: password,
            });
            if (result.status === "success" && result.userId) {
                localStorage.setItem("userId", result.userId);
                window.location.href = "./profile";
            } else if (result.message) {
                setErrorMessage(result.message);
                setTimeout(() => {
                    setErrorMessage("");
                }, 5000);
            }
        }
    };

    return (
        <main>
            <div className={styles.container}>
                <div className={styles.loginBox}>
                    <h1>Sign Up</h1>
                    <form>
                        <div className={styles.inputContainer}>
                            <input
                                type="email"
                                id="email"
                                placeholder=""
                                className={styles.formInput}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            ></input>
                            <label htmlFor="email" className={styles.label}>
                                Email
                            </label>
                        </div>
                        <div className={styles.inputContainer}>
                            <input
                                type="text"
                                placeholder=""
                                id="username"
                                className={styles.formInput}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            ></input>
                            <label htmlFor="username" className={styles.label}>
                                Username
                            </label>
                        </div>
                        <div className={styles.inputContainer}>
                            <input
                                type="password"
                                placeholder=""
                                id="password"
                                className={styles.formInput}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            ></input>
                            <label htmlFor="password" className={styles.label}>
                                Password
                            </label>
                        </div>
                    </form>
                    <button onClick={signUpHandler} className={styles.formBtn}>
                        Sign Up
                    </button>
                    <small>
                        Already have an account?{" "}
                        <Link href="./login" className={styles.signUpLink}>
                            Login
                        </Link>{" "}
                        now!
                    </small>
                </div>
                <Popup
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                ></Popup>
            </div>
        </main>
    );
};

export default SignUp;
