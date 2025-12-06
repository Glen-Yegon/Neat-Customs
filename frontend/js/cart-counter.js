// cart-counter.js
const DB_NAME = "DesignStorageDB";
const STORE_NAME = "pendingDesigns";
const cartCountEl = document.querySelector(".cart-count");

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function updateCartCount() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  let count = 0;

  store.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      if (cursor.key.startsWith("cart-selection-")) {
        count += cursor.value?.data?.quantity || 1;
      }
      cursor.continue();
    } else {
      if (cartCountEl) cartCountEl.textContent = count;
      console.log("[CART COUNT] Updated:", count);
    }
  };

  store.openCursor().onerror = (e) => console.error("[DB] Cursor error:", e);
}


// Run on page load
updateCartCount();

// Optional: expose a function to update immediately after adding/removing items
window.refreshCartCount = updateCartCount;
