// firebase/sign-firebase.js

import { app, auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";


// Elements
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const googleSignupBtn = document.getElementById('google-btn');
const googleLoginBtn = document.getElementById('google-btn-login');
const statusBox = document.getElementById('status');

// Google Provider
const provider = new GoogleAuthProvider();

// ✅ Helper function: show status messages
function showStatus(message, type = "success") {
  statusBox.textContent = message;
  statusBox.className = `status show ${type}`;
  setTimeout(() => {
    statusBox.className = "status";
    statusBox.textContent = "";
  }, 3000);
}

// ✅ Unified Firestore user updater
async function saveOrUpdateUser(userData) {
  const userRef = doc(db, "users", userData.uid);
  const existingDoc = await getDoc(userRef);

  if (existingDoc.exists()) {
    // Merge new data with existing data
    const existingData = existingDoc.data();

    const updatedData = {
      fullName: userData.fullName || existingData.fullName || "Unknown User",
      email: userData.email || existingData.email,
      photoURL: userData.photoURL || existingData.photoURL || "",
      signupMethod: userData.signupMethod || existingData.signupMethod,
      lastLogin: serverTimestamp(), // Track most recent login
    };

    // ✅ If they signed in using a different method, update it
    if (userData.signupMethod && userData.signupMethod !== existingData.signupMethod) {
      updatedData.signupMethod = userData.signupMethod;
    }

    await updateDoc(userRef, updatedData);
  } else {
    // ✅ Create new document if not existing
    await setDoc(userRef, {
      fullName: userData.fullName || "Unknown User",
      email: userData.email,
      photoURL: userData.photoURL || "",
      signupMethod: userData.signupMethod,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  }
}

// ✅ Handle Sign-up
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = signupForm['su-email'].value.trim();
    const fullName = signupForm['su-fullname'].value.trim();
    const password = signupForm['su-password'].value;
    const confirm = signupForm['su-confirm'].value;

    if (password !== confirm) {
      showStatus("Passwords do not match", "error");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await saveOrUpdateUser({
        uid: user.uid,
        fullName,
        email,
        signupMethod: "email",
      });

      showStatus("Account created successfully!", "success");
      setTimeout(() => window.history.back(), 3000);
    } catch (error) {
      showStatus(error.message, "error");
    }
  });
}

// ✅ Handle Login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm['li-email'].value.trim();
    const password = loginForm['li-password'].value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await saveOrUpdateUser({
        uid: user.uid,
        email,
        signupMethod: "email",
      });

      showStatus("Login successful!", "success");
      setTimeout(() => window.history.back(), 3000);
    } catch (error) {
      showStatus(error.message, "error");
    }
  });
}

// ✅ Google Sign-up or Login
async function handleGoogleSignIn() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await saveOrUpdateUser({
      uid: user.uid,
      fullName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      signupMethod: "google",
    });

    showStatus("Signed in with Google!", "success");
    setTimeout(() => window.history.back(), 3000);
  } catch (error) {
    showStatus(error.message, "error");
  }
}

if (googleSignupBtn) googleSignupBtn.addEventListener('click', handleGoogleSignIn);
if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleSignIn);


// Wait for Firebase to initialize
onAuthStateChanged(auth, (user) => {
  const logoutSection = document.getElementById("logoutSection");

  if (user) {
    // Show logout option when user is signed in
    logoutSection.style.display = "block";
  } else {
    // Hide it when not signed in
    logoutSection.style.display = "none";
  }
});

// Handle logout click
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("loggedInUserId");
    alert("You have been signed out successfully.");
    window.location.reload();
  } catch (error) {
    console.error("Error signing out:", error);
    alert("Failed to sign out. Please try again.");
  }
});