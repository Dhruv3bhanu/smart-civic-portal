import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBvHKp7Qy3gdqphghjaAQNZK2O7wMBeCrw",
  authDomain: "smartcivicportal.firebaseapp.com",
  projectId: "smartcivicportal",
  storageBucket: "smartcivicportal.firebasestorage.app",
  messagingSenderId: "4076580007",
  appId: "1:4076580007:web:8f7d2859e61b18d7537f82",
  measurementId: "G-Q06044E7GZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services so we can use them across our React app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);