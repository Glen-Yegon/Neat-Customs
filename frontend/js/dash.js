import { auth, db } from "../firebase/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, getCountFromServer } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Fade-in effect
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => document.body.style.opacity = 1, 50);
});

const userNameEl = document.getElementById("userName");
const logoutBtn = document.querySelector(".logout-btn");

const statProductsEl = document.getElementById("statProducts");
const statOrdersEl = document.getElementById("statOrders");
const statRevenueEl = document.getElementById("statRevenue");
const statPendingEl = document.getElementById("statPending");

const statEls = [statProductsEl, statOrdersEl, statRevenueEl, statPendingEl];

// -----------------------------
// 🔹 Firebase Auth: Welcome User + Load Stats
// -----------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    userNameEl.textContent = "there";
    setStatsUnavailable();
    return;
  }

  setStatsLoading();

  // Fire both reads in parallel instead of one-after-another — cuts wait time roughly in half
  const [userName] = await Promise.all([
    getUserName(user),
    loadProductStat(user.uid)
  ]);

  userNameEl.textContent = userName;

  // Orders / revenue / pending — not wired up yet
  setOrderStatsUnavailable();
});

// -----------------------------
// 🔹 Get display name
// -----------------------------
async function getUserName(user) {
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.name || userData.fullName || user.displayName || "there";
    }
    return user.displayName || "there";
  } catch (error) {
    console.error("Error fetching user data:", error);
    return "there";
  }
}

// -----------------------------
// 🔹 Stats: Products (live)
// -----------------------------
async function loadProductStat(uid) {
  if (!statProductsEl) return;
  try {
    const q = query(collection(db, "user_merch"), where("user.uid", "==", uid));
    const snapshot = await getCountFromServer(q);
    setStatValue(statProductsEl, snapshot.data().count);
  } catch (error) {
    console.error("Error fetching product count:", error);
    setStatValue(statProductsEl, "—");
  }
}

// -----------------------------
// 🔹 Stat display helpers
// -----------------------------
function setStatsLoading() {
  statEls.forEach(el => {
    if (!el) return;
    el.textContent = "0";
    el.classList.add("loading");
  });
}

function setStatValue(el, value) {
  if (!el) return;
  el.textContent = value;
  el.classList.remove("loading");
}

function setOrderStatsUnavailable() {
  setStatValue(statOrdersEl, "—");
  setStatValue(statRevenueEl, "—");
  setStatValue(statPendingEl, "—");
}

function setStatsUnavailable() {
  setStatValue(statProductsEl, "—");
  setOrderStatsUnavailable();
}

// -----------------------------
// 🔹 Logout Button
// -----------------------------
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await auth.signOut();
      alert("Logged out successfully!");
      window.location.href = "sign.html";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}

// -----------------------------
// Back Button
// -----------------------------
const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

// -----------------------------
// 🔹 Modal elements
// -----------------------------
const createModal = document.getElementById("createProductModal");
const closeModalBtn = document.querySelector(".modal-close");
const uploadExistingBtn = document.getElementById("uploadExistingBtn");
const newDesignBtn = document.getElementById("newDesignBtn");

// -----------------------------
// 🔹 Action buttons (dashboard cards)
// -----------------------------
document.querySelectorAll(".action-btn[data-action]").forEach(btn => {
  const action = btn.dataset.action;

  btn.addEventListener("click", () => {
    switch (action) {
      case "view-products":
        window.location.href = "product.html";
        break;
      case "create-product":
        if (createModal) createModal.style.display = "flex";
        break;
      case "view-orders":
        window.location.href = "orders.html";
        break;
    }
  });
});

// Close modal
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    createModal.style.display = "none";
  });
}

// Close modal when clicking outside content
window.addEventListener("click", (e) => {
  if (e.target === createModal) {
    createModal.style.display = "none";
  }
});

// Button actions inside "Create Product" modal
if (uploadExistingBtn) {
  uploadExistingBtn.addEventListener("click", () => {
    window.location.href = "seller.html";
  });
}

if (newDesignBtn) {
  newDesignBtn.addEventListener("click", () => {
    window.location.href = "index.html#featured-products";
  });
}