"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Popup from "../components/popup";
import styles from "../styles/login.module.css";
import useDB from "@/hooks/useDB";

export default function Room() {
    const [isDisabled, setIsDisabled] = useState();
    const [errorMessage, setErrorMessage] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    const { loginUser, loginGuest } = useDB();

    useEffect(() => {
        let isLoggedIn = localStorage.getItem("userId");
        if (isLoggedIn) {
            window.location.href = "/";
        }
    }, []);

    const loginHandler = async () => {
        setIsDisabled(true);
        if (email && password) {
            let result = await loginUser({ email: email, password: password });
            if (result.status === "success") {
                const userId = result.userId;
                const role = result.role;
                localStorage.setItem("userId", userId);
                localStorage.setItem("role", role);
                window.location.href = "./profile";
            } else {
                setErrorMessage(result.message);
            }
        } else {
            setErrorMessage("Please enter Email and Password");
        }
    };
    const guestButtonHandler = () => {};

    return (
        <main className="">
            <div className={styles.container}>
                <div className={styles.loginBox}>
                    <h1>Login</h1>
                    <form>
                        <div className={styles.inputContainer}>
                            <input
                                type="email"
                                placeholder=""
                                id="email"
                                className={styles.formInput}
                                onChange={(e) => setEmail(e.target.value)}
                            ></input>
                            <label htmlFor="email" className={styles.label}>
                                Email
                            </label>
                        </div>
                        <div className={styles.inputContainer}>
                            <input
                                type="password"
                                placeholder=""
                                id="password"
                                className={styles.formInput}
                                onChange={(e) => setPassword(e.target.value)}
                            ></input>
                            <label htmlFor="password" className={styles.label}>
                                Password
                            </label>
                        </div>
                    </form>
                    <button
                        onClick={loginHandler}
                        className={styles.formBtn}
                        id={styles.loginBtn}
                        disabled={isDisabled}
                    >
                        Log In
                    </button>
                    {/* <button
                        onClick={logInWithGoogleHandler}
                        className={styles.formBtn}
                        id={styles.guestBtn}
                        disabled
                    >
                        Log in with Google
                    </button> */}
                    <button
                        onClick={guestButtonHandler}
                        className={styles.formBtn}
                        id={styles.guestBtn}
                        disabled={isDisabled}
                    >
                        Continue as guest
                    </button>
                    <small>
                        New to Karaoke-v1?{" "}
                        <Link href="./signup" className={styles.signUpLink}>
                            Sign up
                        </Link>{" "}
                        now!
                    </small>
                </div>
                <Popup
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                    timeout={5000}
                ></Popup>
            </div>
        </main>
    );
}
