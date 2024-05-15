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
    onSnapshot,
    deleteDoc,
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
    const registerUser = async ({
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
            if (res.id)
                return {
                    status: "success",
                    userId: res.id,
                    username: data.username,
                };
            return { status: "fail", message: "An Error Occured" };
        } catch (e) {
            console.error(e);
            return { status: "fail", message: e };
        }
    };

    const getUserDetails = async (userId) => {
        if (!userId)
            return { result: "fail", message: "No valid userId Provided" };
        try {
            const docRef = doc(firestore, "users", userId);
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                return { result: "success", data: data };
            } else {
                return { result: "fail", message: "User does not exist" };
            }
        } catch (e) {
            console.error(e);
            return { result: "fail", message: e };
        }
    };

    const editUserPlaylist = async ({ userId, playlist }) => {
        try {
            const userDetails = await getUserDetails(userId);
            if (userDetails.result !== "success") return userDetails;
            await updateDoc(doc(firestore, "users", roomId), {
                playlist: playlist,
            });
            return { result: "success" };
        } catch (e) {
            return { result: "fail", message: e };
        }
    };

    //Room Functions

    const createRoom = async ({
        userId,
        username = "user",
        roomName,
        classicMode,
    }) => {
        try {
            //TODO: Authenticate userId
            const user = await getUserDetails(userId);
            if (user.result !== "success") return user;
            const newRoom = await addDoc(collection(firestore, "rooms"), {
                host: userId,
                roomName: roomName,
                members: [{ userId, username }],
                classicMode: classicMode,
                queue: [],
            });
            if (newRoom.id) {
                return { result: "success", roomId: newRoom.id };
            }
        } catch (e) {
            console.error(e);
            return { result: "fail", message: e };
        }
    };

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

    const addUserToRoom = async ({ userId, roomId, username }) => {
        try {
            const roomData = await getRoomDetails({ roomId: roomId });
            const currentMembers = roomData?.data?.members;

            if (
                roomData.result === "success" &&
                Array.isArray(currentMembers) &&
                currentMembers?.every((member) => member.userId != userId)
            ) {
                const newMembers = [...currentMembers, { userId, username }];
                await updateDoc(doc(firestore, "rooms", roomId), {
                    members: newMembers,
                });
                //TODO: Update Users
                return { result: "success" };
            } else {
                return { result: "fail", message: "Room is not valid" };
            }
        } catch (e) {
            console.error(e);
            return { result: "fail", message: e };
        }
    };

    const removeUserFromRoom = async ({ userId, roomId }) => {
        try {
            const roomData = await getRoomDetails({ roomId: roomId });
            const currentMembers = roomData?.data?.members;
            if (
                roomData.result === "success" &&
                Array.isArray(currentMembers)
            ) {
                console.log(currentMembers);
                const newMembers = currentMembers.filter(
                    (member) => member.userId !== userId
                );
                await updateDoc(doc(firestore, "rooms", roomId), {
                    members: newMembers,
                });
                return { result: "success" };
            } else {
                return { result: "fail", message: "Room is not valid" };
            }
        } catch (e) {
            console.error(e);
            return { result: "fail", message: e };
        }
    };

    const getRoomDetails = async ({ roomId }) => {
        try {
            const docRef = doc(collection(firestore, "rooms"), roomId);
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
                const snapshot = docSnapshot.data();
                return { result: "success", data: snapshot };
            } else {
                return { result: "fail", message: "Room does not exist" };
            }
        } catch (e) {
            console.error(e);
            return { result: "fail", message: e };
        }
    };

    const getRoomMemberDetails = async ({ userId, roomId }) => {
        try {
            const docRef = doc(collection(firestore, "rooms"), roomId);
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
                const snapshot = docSnapshot.data();
                const members = snapshot.data.members;
                const member = members.find(
                    (member) => member.userId === userId
                );
                if (member === undefined) {
                    return { result: "fail", message: "User does not exist" };
                } else {
                    return { result: "success", data: member };
                }
            } else {
                return { result: "fail", message: "Room does not exist" };
            }
        } catch (e) {
            console.error(e);
            return { result: "fail", message: e };
        }
    };

    const getRoomLiveData = async ({ roomId, setRoomMembers, setQueue }) => {
        const docRef = doc(firestore, "rooms", roomId);
        const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                if (data) {
                    setRoomMembers(data.members);
                    setQueue && setQueue(data.queue);
                }
            }
        });

        return () => {
            unsubscribe();
        };
    };

    const deleteRoom = async ({ roomId, userId }) => {
        const docRef = doc(firestore, "rooms", roomId);

        try {
            const roomDetails = await getRoomDetails({ roomId: roomId });
            if (
                roomDetails.result === "success" &&
                roomDetails.data.host === userId
            ) {
                await deleteDoc(docRef);
                return { result: "success" };
            } else if (roomDetails.result !== "success") {
                return { result: "fail", message: "Room Not Found" };
            } else {
                return { result: "fail", message: "Unauthorized" };
            }
        } catch (e) {
            return {
                result: "fail",
                message: e,
            };
        }
    };

    const updateQueue = async ({ roomId, userId, newQueue }) => {
        //TODO: Verify User is Host of room
        const res = await getRoomDetails({ roomId });

        //Check if room exists
        if (res.result !== "success")
            return { result: "fail", message: res.message };

        //Check if User is Host
        if (res?.data?.host !== userId) {
            console.log(res?.data?.host, userId);
            return { result: "fail", message: "Unauthorized Action" };
        }

        await updateDoc(doc(firestore, "rooms", roomId), { queue: newQueue });
        return { result: "success" };
    };

    const updateMembers = async ({ roomId, userId, newMembers }) => {
        //TODO: Verify User is Host of room
        const res = await getRoomDetails({ roomId });

        //Check if room exists
        if (res.result !== "success")
            return { result: "fail", message: res.message };

        //Check if User is Host
        if (res?.data?.host !== userId) {
            console.log(res?.data?.host, userId);
            return { result: "fail", message: "Unauthorized Action" };
        }

        await updateDoc(doc(firestore, "rooms", roomId), {
            members: newMembers,
        });
        return { result: "success" };
    };

    return {
        getRooms,
        registerUser,
        loginUser,
        loginGuest,
        getUserDetails,
        editUserPlaylist,
        createRoom,
        getRoomDetails,
        getRoomMemberDetails,
        removeUserFromRoom,
        addUserToRoom,
        getRoomLiveData,
        deleteRoom,
        updateQueue,
        updateMembers,
    };
};

export default useDB;
