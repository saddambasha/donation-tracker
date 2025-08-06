// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDr6idqrnKGYnbDAXZ_XapC7x5Zn2ZQjQQ",
  authDomain: "my-app-df28d.firebaseapp.com",
  projectId: "my-app-df28d",
  storageBucket: "my-app-df28d.firebasestorage.app",
  messagingSenderId: "689386332477",
  appId: "1:689386332477:web:5ed14a9ceab462f52f2554",
  measurementId: "G-WF7VSYPFX2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// ✅ Define Firestore instance
const db = getFirestore(app);

export { db };