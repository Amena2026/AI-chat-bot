// firebase.js connects our react app to firebase

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDlBJy-ZJk-60ou3xXq64d5_i7QHDrrjDo",
  authDomain: "ai-chatbot-13281.firebaseapp.com",
  databaseURL: "https://ai-chatbot-13281-default-rtdb.firebaseio.com",
  projectId: "ai-chatbot-13281",
  storageBucket: "ai-chatbot-13281.firebasestorage.app",
  messagingSenderId: "430931339785",
  appId: "1:430931339785:web:a267a7aaae321e374c66d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export default app;