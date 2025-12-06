import { db } from "../firebase/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// DOM Elements
const cartContainer = document.getElementById("cartContainer");
const totalAmountEl = document.getElementById("totalAmount");
const backBtn = document.getElementById("backBtn");

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
  cartContainer.innerHTML = "";
  if (!selections.length) {
    console.warn("[CART] No items in cart.");
    cartContainer.innerHTML = "<p style='text-align:center; padding:50px;'>Your cart is empty.</p>";
    totalAmountEl.textContent = "₦0";
    return;
  }

  let total = 0;

  for (let sel of selections) {
    // sel has structure: { id: "...", data: { productId, size, quantity } }
    const { productId, size, quantity } = sel.data;

    console.log("[CART] Fetching product from Firebase:", productId);
    const productDoc = await getDoc(doc(db, "user_merch", productId));

    if (!productDoc.exists()) {
      console.warn("[CART] Product not found in Firebase:", productId);
      continue;
    }

    const product = productDoc.data();
    const price = product.price || 0;
    const currency = product.currency || "₦";
    const subtotal = price * quantity;
    total += subtotal;

    const card = document.createElement("div");
    card.className = "cart-card";

    card.innerHTML = `
      <img src="${product.images?.[0] || ''}" alt="${product.name}">
      <div class="cart-card-info">
        <div class="brand">Neat Customs</div>
        <div class="name">${product.name}</div>
        <div class="price">${currency}${price.toLocaleString()}</div>
        <div class="details size">Size: ${size}</div>
        <div class="details quantity">Quantity: ${quantity}</div>
      </div>
      <button class="remove-btn">Remove</button>
    `;

    const removeBtn = card.querySelector(".remove-btn");
    removeBtn.addEventListener("click", async () => {
      console.log("[CART] Removing item:", sel.id);
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(sel.id); // sel.id now exists
      card.remove();
      updateTotal();
       window.refreshCartCount();
      // Update cart count badge
      if (window.refreshCartCount) window.refreshCartCount();
    });

    cartContainer.appendChild(card);
  }

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
    console.log("[CART] Calculated total:", sum);
    totalAmountEl.textContent = `₦${sum.toLocaleString()}`;
  }
}


// Initialize cart
loadCart();
