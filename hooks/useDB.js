import { firestore } from "../app/components/firestore";
import {
    collection,
    doc,
    getDoc,
    updateDoc,
    getDocs,
    query,
    where,
    setDoc,
    addDoc,
} from "firebase/firestore";
import bcrypt from "bcryptjs-react";

const useDB = () => {
    const SALT_ROUNDS = 10;
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const isValidEmail = (email) => {
        return EMAIL_REGEX.test(email);
    };

    const randomGuestNameGenerator = () => {
        let name = "";
        name += "Guest#";
        name += Math.floor(Math.random() * 10000);
        return name;
    };

    //User Functions
    const addUser = async ({
        email,
        username,
        password,
        collectionName = "users",
    }) => {
        try {
            if (!isValidEmail)
                return { status: "fail", message: "Email Not Valid" };
            const userRef = collection(firestore, collectionName);
            const q = query(userRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.size !== 0)
                return {
                    status: "fail",
                    message: "Account with this email already exists",
                };
            const newPass = await bcrypt.hash(password, SALT_ROUNDS);
            if (newPass) {
                const data = {
                    email: email,
                    username: username,
                    password: newPass,
                };
                let res = await addDoc(collection(firestore, "users"), data);
                console.log("resid", res.id);
                if (res.id) {
                    return { status: "success", userId: res.id };
                }
            }
        } catch (e) {
            console.error(e);
            return { status: "fail", message: e };
        }
    };

    const loginUser = async ({ email, password, collectionName = "users" }) => {
        if (!isValidEmail)
            return {
                status: "fail",
                message: "Please enter a valid Email Address",
            };
        const userRef = collection(firestore, collectionName);
        const q = query(userRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.size < 1)
            return {
                status: "fail",
                message: "User with email does not exist",
            };
        let res;
        await Promise.all(
            querySnapshot.docs.map(async (doc) => {
                const userData = doc?.data();
                const passwordHash = userData.password;
                const userId = doc.id;
                const role = userData.isAdmin ? "admin" : "user";
                const isCorrectPassword = await bcrypt.compare(
                    password,
                    passwordHash
                );
                if (!isCorrectPassword) {
                    res = { status: "fail", message: "Incorrect Password" };
                } else {
                    res = { status: "success", userId: userId, role: role };
                }
            })
        );
        return res;
    };

    const loginGuest = async () => {
        try {
            const data = {
                username: randomGuestNameGenerator(),
                isGuest: true,
            };
            const res = await addDoc(collection(firestore, "users"), data);
            if (res.id) return { status: "success", userId: res.id };
            return { status: "fail", message: "An Error Occured" };
        } catch (e) {
            console.error(e);
            return { status: "fail", message: e };
        }
    };

    //Room Functions
    const getRooms = async (setRooms = null) => {
        try {
            const querySnapshot = await getDocs(collection(firestore, "rooms"));
            setRooms && setRooms(querySnapshot.docs);
            console.log(querySnapshot.docs);
            return querySnapshot.docs;
        } catch (e) {
            console.error(e);
            return { status: "fail", message: e };
        }
    };

    return {
        getRooms,
        addUser,
        loginUser,
        loginGuest,
    };
};

export default useDB;
