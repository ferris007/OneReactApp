// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBI8S3_TaQ-PWmUsuhiXOvvN2OjWhLjgCo",
    authDomain: "one-ai-digital-twin.firebaseapp.com",
    projectId: "one-ai-digital-twin",
    storageBucket: "one-ai-digital-twin.firebasestorage.app",
    messagingSenderId: "810351594632",
    appId: "1:810351594632:web:49c531893d5ced2f99633d",
    measurementId: "G-4YP15CE1WB"

};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
