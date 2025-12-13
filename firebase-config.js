import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDJgE7MWVoAmbPARI1TMtrNnfwATxyfj74",
  authDomain: "freedip-27d92.firebaseapp.com",
  projectId: "freedip-27d92",
  storageBucket: "freedip-27d92.firebasestorage.app",
  messagingSenderId: "2527270256",
  appId: "1:2527270256:web:61f43055f0907cd792abb5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);














