// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPlnNGjSXUEtSRjp-dFgr9iNCGmvksFIM",
  authDomain: "fixian2.firebaseapp.com",
  databaseURL: "https://fixian2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fixian2",
  storageBucket: "fixian2.firebasestorage.app",
  messagingSenderId: "15335037261",
  appId: "1:15335037261:web:2f640e912d1c833ce13f04",
  measurementId: "G-759CPRX9JE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



// Export both Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);