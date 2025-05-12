// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxhPEpdTKP_yJN8PySKAiZnROzmd_5LiA",
  authDomain: "hamsafar-6f7e1.firebaseapp.com",
  projectId: "hamsafar-6f7e1",
  storageBucket: "hamsafar-6f7e1.appspot.com",
  messagingSenderId: "802031051366",
  appId: "1:802031051366:web:7146b195bafedbfbaf03a7",
  measurementId: "G-C3DXL2L0BZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export app as default
export default app;