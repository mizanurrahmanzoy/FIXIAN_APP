import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
// ✅ Prevent reinitialization
let firebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

// ✅ Export instances
export const app = firebaseApp;
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export default firebaseApp;