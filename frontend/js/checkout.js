import { db } from "../firebase/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// ---------- Shared IndexedDB (same store used by product-det.js & cart.js) ----------
const DB_NAME = "DesignStorageDB";
const STORE_NAME = "pendingDesigns";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const dbInstance = request.result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function loadSelections() {
  return openDB().then((idb) => {
    const tx = idb.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const selections = [];
      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.key.startsWith("cart-selection-")) selections.push(cursor.value);
          cursor.continue();
        } else {
          resolve(selections);
        }
      };
      store.openCursor().onerror = () => resolve(selections);
    });
  });
}

function clearSelections(ids) {
  return openDB().then((idb) => {
    const tx = idb.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    ids.forEach((id) => store.delete(id));
  });
}

// ---------- DOM refs ----------
const orderItemsEl = document.getElementById("orderItems");
const orderTotalRowEl = document.getElementById("orderTotalRow");
const orderTotalEl = document.getElementById("orderTotal");
const checkoutFormsEl = document.querySelector(".checkout-forms");
const payBtn = document.getElementById("payBtn");

let orderSelectionIds = [];
let orderItems = [];   // [{ id, product, size, quantity }]
let grandTotal = 0;
let orderCurrency = "";

// ---------- Render ----------
function renderEmpty() {
  orderItemsEl.innerHTML = `
    <div class="empty-order">
      <p>Your cart is empty.</p>
      <a href="index.html" class="empty-link">Continue shopping</a>
    </div>`;
  orderTotalRowEl.classList.add("hidden");
  checkoutFormsEl.classList.add("hidden");
}

function renderItems(items) {
  orderItemsEl.innerHTML = items.map(({ product, size, quantity }) => `
    <div class="order-item">
      <img src="${product.images?.[0] || ''}" alt="${product.name || 'Product'}">
      <div class="order-item-info">
        <div class="order-item-name">${product.name || 'Unnamed item'}</div>
        <div class="order-item-meta">Size: ${size} · Qty: ${quantity}</div>
      </div>
      <div class="order-item-price">${product.currency || ''} ${((product.price || 0) * quantity).toLocaleString()}</div>
    </div>
  `).join("");
}

// ---------- Init ----------
async function init() {
  const selections = await loadSelections();

  if (!selections.length) {
    renderEmpty();
    return;
  }

  const resolved = [];
  for (const sel of selections) {
    const { productId, size, quantity } = sel.data;
    const snap = await getDoc(doc(db, "user_merch", productId));
    if (!snap.exists()) continue;
    resolved.push({ id: sel.id, product: { id: snap.id, ...snap.data() }, size, quantity });
  }

  if (!resolved.length) {
    renderEmpty();
    return;
  }

  orderSelectionIds = resolved.map((r) => r.id);
  orderItems = resolved;
  grandTotal = resolved.reduce((sum, r) => sum + (r.product.price || 0) * r.quantity, 0);
  orderCurrency = resolved[0].product.currency || "";

  renderItems(resolved);
  orderTotalEl.textContent = `${orderCurrency} ${grandTotal.toLocaleString()}`;
}

init();

// ---------- Toast ----------
function showToast(message, duration = 4000) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ---------- Validation ----------
function validateFields() {
  const required = [
    ["full-name", "full name"],
    ["email", "email"],
    ["phone-number", "phone number"],
    ["country-region", "country"],
    ["delivery-city", "city"],
    ["address", "address"],
  ];
  for (const [id, label] of required) {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      showToast(`Please enter your ${label}.`);
      el.focus();
      return false;
    }
  }
  return true;
}

// ---------- Collect order payload ----------
function collectOrderData() {
  return {
    items: orderItems.map(({ product, size, quantity }) => ({
      productId: product.id,
      name: product.name,
      size,
      quantity,
      price: product.price,
    })),
    contact: {
      name: document.getElementById("full-name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone-number").value,
      newsOffers: document.getElementById("news-offers").checked ? "Yes" : "No",
    },
    delivery: {
      country: document.getElementById("country-region").value || "N/A",
      city: document.getElementById("delivery-city").value || "N/A",
      address: document.getElementById("address").value || "N/A",
      apartment: document.getElementById("apartment-suite").value || "N/A",
    },
    total: grandTotal,
    currency: orderCurrency,
  };
}

// ---------- Submit order to backend ----------
async function submitOrder() {
  try {
    const response = await fetch("/pay3-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectOrderData()),
    });
    const result = await response.json();

    if (result.success) {
      await clearSelections(orderSelectionIds);
      if (window.refreshCartCount) window.refreshCartCount();
      showToast("Order confirmed. A confirmation email is on its way.");
      setTimeout(() => { window.location.href = "index.html"; }, 2500);
    } else {
      showToast("Something went wrong. Please try again or contact support.");
    }
  } catch (error) {
    console.error("Order submission error:", error);
    showToast("Something went wrong. Please try again.");
  }
}

// ---------- Paystack ----------
payBtn.addEventListener("click", () => {
  if (!orderItems.length) { showToast("Your cart is empty."); return; }
  if (!validateFields()) return;
  if (!grandTotal || grandTotal <= 0) { showToast("Invalid order amount."); return; }

  const handler = PaystackPop.setup({
    key: "pk_live_ebc463d4a263695caa52983243908de4c27ab205",
    email: document.getElementById("email").value,
    amount: grandTotal * 100,
    currency: "KES",
    ref: "" + Math.floor(Math.random() * 1_000_000_000 + 1),

    callback: function (response) {
      showToast("Payment complete. Confirming your order…");

      fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: response.reference }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            submitOrder();
          } else {
            showToast("Payment verification failed.");
          }
        })
        .catch((err) => {
          console.error("Verification error:", err);
          showToast("Error verifying payment.");
        });
    },

    onClose: function () { showToast("Payment cancelled."); },
  });

  handler.openIframe();
});