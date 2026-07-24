import { db } from "../firebase/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// DOM Elements
const cartContainer = document.getElementById("cartContainer");
const totalAmountEl = document.getElementById("totalAmount");
const backBtn = document.getElementById("backBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
checkoutBtn.addEventListener("click", () => {
  window.location.href = "checkout.html";
});

// Go back to previous page
backBtn.addEventListener("click", () => window.history.back());

// IndexedDB setup
const DB_NAME = "DesignStorageDB";
const STORE_NAME = "pendingDesigns";

function openDB() {
  return new Promise((resolve, reject) => {
    console.log("[DB] Opening IndexedDB...");
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log("[DB] Creating object store:", STORE_NAME);
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      console.log("[DB] IndexedDB opened successfully");
      resolve(request.result);
    };
    request.onerror = () => {
      console.error("[DB] Error opening IndexedDB:", request.error);
      reject(request.error);
    };
  });
}

// Load cart selections from IndexedDB
async function loadCart() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  const selections = [];
store.openCursor().onsuccess = async (event) => {
  const cursor = event.target.result;
  if (cursor) {
    console.log("[DB] Cursor key:", cursor.key, "value:", cursor.value);
    if (cursor.key.startsWith("cart-selection-")) {
      selections.push(cursor.value); // include both id and data
    }
    cursor.continue();
  } else {
    console.log("[DB] All selections loaded:", selections);
    renderCart(selections);
  }
};
  store.openCursor().onerror = (e) => console.error("[DB] Cursor error:", e);
}

// Render cart
async function renderCart(selections) {
  if (!selections.length) {
    cartContainer.innerHTML = "<p class='empty-cart-msg'>Your cart is empty.</p>";
    totalAmountEl.textContent = "Ksh 0";
    return;
  }

  // Fetch every product in parallel instead of one at a time
  const results = await Promise.all(
    selections.map(async (sel) => {
      const { productId, size, quantity } = sel.data;
      const productDoc = await getDoc(doc(db, "user_merch", productId));
      if (!productDoc.exists()) return null;
      return { sel, product: productDoc.data(), size, quantity };
    })
  );

  const validResults = results.filter(Boolean);

  cartContainer.innerHTML = "";

  if (!validResults.length) {
    cartContainer.innerHTML = "<p class='empty-cart-msg'>Your cart is empty.</p>";
    totalAmountEl.textContent = "Ksh 0";
    return;
  }

  validResults.forEach(({ sel, product, size, quantity }) => {
    const price = product.price || 0;
    const currency = product.currency || "Ksh";

    const card = document.createElement("div");
    card.className = "cart-card";
    card.innerHTML = `
      <img src="${product.images?.[0] || ''}" alt="${product.name}">
      <div class="cart-card-info">
        <div class="brand">heavychats</div>
        <div class="name">${product.name}</div>
        <div class="price">${currency} ${price.toLocaleString()}</div>
        <div class="details size">Size: ${size}</div>
        <div class="details quantity">Quantity: ${quantity}</div>
      </div>
      <button class="remove-btn">Remove</button>
    `;

    const removeBtn = card.querySelector(".remove-btn");
    removeBtn.addEventListener("click", async () => {
      const idb = await openDB();
      const tx = idb.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(sel.id);
      card.remove();
      updateTotal();
      if (window.refreshCartCount) window.refreshCartCount();
    });

    cartContainer.appendChild(card);
  });

  updateTotal();

  function updateTotal() {
    let sum = 0;
    const cards = document.querySelectorAll(".cart-card");
    cards.forEach(card => {
      const priceText = card.querySelector(".price").textContent.replace(/[^0-9]/g, '');
      const qtyText = card.querySelector(".details.quantity").textContent.replace(/[^0-9]/g, '');
      const qty = parseInt(qtyText) || 1;
      sum += parseInt(priceText) * qty;
    });
    totalAmountEl.textContent = `Ksh ${sum.toLocaleString()}`;
  }
}


// Initialize cart
loadCart();
