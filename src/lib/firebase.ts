import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBTXvp8VMix8ceUB2Ji-OoZDUsLU9pt3eA",
  authDomain: "luckyapp-d8f28.firebaseapp.com",
  projectId: "luckyapp-d8f28",
  storageBucket: "luckyapp-d8f28.firebasestorage.app",
  messagingSenderId: "404111374472",
  appId: "1:404111374472:web:38934aa3cde354e798073d",
  measurementId: "G-V708ZEMLRN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;
