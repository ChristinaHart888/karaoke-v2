// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBo47GpjQdGsmVBfXsM9rzfWjEH1VtOoAY",
    authDomain: "karaoke-v2-1a2cc.firebaseapp.com",
    projectId: "karaoke-v2-1a2cc",
    storageBucket: "karaoke-v2-1a2cc.appspot.com",
    messagingSenderId: "946238484186",
    appId: "1:946238484186:web:d2b76a274e99888cee3fe3",
    measurementId: "G-2MBX93MRLT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export const firestore = db;
