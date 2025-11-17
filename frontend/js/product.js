import { auth, db } from "../firebase/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Fade-in effect
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => document.body.style.opacity = 1, 50);
});

const logoutBtn = document.querySelector(".logout-btn");


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

const productBtns = document.querySelectorAll(".product-btn");

productBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const product = products[index]; // products is your array of product objects
    openProductModal(product);
  });
});
