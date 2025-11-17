import { auth, db } from "../firebase/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Fade-in effect
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => document.body.style.opacity = 1, 50);
});

const userNameEl = document.getElementById("userName");
const logoutBtn = document.querySelector(".logout-btn");

// -----------------------------
// 🔹 Firebase Auth: Welcome User
// -----------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    userNameEl.textContent = "there";
    return;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    let userName = "there";

    if (userSnap.exists()) {
      const userData = userSnap.data();
      userName = userData.name || userData.fullName || "there";
    } else if (user.displayName) {
      userName = user.displayName;
    }

    userNameEl.textContent = userName;
  } catch (error) {
    console.error("Error fetching user data:", error);
    userNameEl.textContent = "there";
  }
});

// -----------------------------
// 🔹 Logout Button
// -----------------------------
logoutBtn.addEventListener("click", async () => {
  try {
    await auth.signOut();
    alert("Logged out successfully!");
    window.location.href = "sign.html";
  } catch (error) {
    console.error("Logout failed:", error);
  }
});

// -----------------------------
// Back Button
// -----------------------------
const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => window.history.back());
}


// Modal elements
const createModal = document.getElementById("createProductModal");
const closeModalBtn = document.querySelector(".modal-close");
const uploadExistingBtn = document.getElementById("uploadExistingBtn");
const newDesignBtn = document.getElementById("newDesignBtn");

// Open modal when clicking "Add" button in Create Product card
document.querySelectorAll(".dashboard-card .card-btn").forEach(btn => {
  if(btn.textContent.trim() === "Add") {
    btn.addEventListener("click", () => {
      createModal.style.display = "flex";
    });
  }
});

// Close modal
closeModalBtn.addEventListener("click", () => {
  createModal.style.display = "none";
});

// Close modal when clicking outside content
window.addEventListener("click", (e) => {
  if(e.target === createModal) {
    createModal.style.display = "none";
  }
});

// Button actions
uploadExistingBtn.addEventListener("click", () => {
  window.location.href = "seller.html";
});

newDesignBtn.addEventListener("click", () => {
  window.location.href = "index.html#featured-products";
});


// Navigate "My Products" card to product.html
document.querySelectorAll(".dashboard-card .card-btn").forEach(btn => {
  if(btn.textContent.trim() === "View") {
    btn.addEventListener("click", () => {
      window.location.href = "product.html";
    });
  }
});
