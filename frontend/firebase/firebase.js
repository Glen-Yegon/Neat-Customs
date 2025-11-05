// firebase/firebase.js

// Import Firebase SDKs (v12.5.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// ✅ Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDN0i_bE8Wwy-cQ347nG02CJ5m0nAEhg_0",
  authDomain: "neat-customs.firebaseapp.com",
  projectId: "neat-customs",
  storageBucket: "neat-customs.appspot.com", // ✅ corrected
  messagingSenderId: "992622616093",
  appId: "1:992622616093:web:66e4edb18981b21e0070f4",
  measurementId: "G-9VF6SSE32Y",
};

// ✅ Initialize Firebase Services
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
