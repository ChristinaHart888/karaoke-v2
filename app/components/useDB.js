import { firestore } from "./Firestore";
import {
    collection,
    doc,
    getDoc,
    updateDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";

const useDB = () => {
    const getRooms = async (setRooms = null) => {
        try {
            const querySnapshot = await getDocs(collection(firestore, "rooms"));
            setRooms && setRooms(querySnapshot.docs);
            console.log(querySnapshot.docs);
            return querySnapshot.docs;
        } catch (e) {
            console.error(e);
        }
    };
    return {
        getRooms,
    };
};

export default useDB;
