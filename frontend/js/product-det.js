import { loadProductDetails } from "../firebase/product-des-firebase.js";
import { db, auth } from "../firebase/firebase.js"; 
import { doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const productContent = document.getElementById("productContent");

// Get productId from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("productId");

// ---------- IndexedDB helper ----------
const DB_NAME = "DesignStorageDB";
const STORE_NAME = "pendingDesigns";

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

async function saveToIndexedDB(key, data) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await store.put({ id: key, data });
    console.log("[DB] Saved to IndexedDB:", key, data);
  } catch (err) {
    console.error("[DB] Error saving to IndexedDB:", err);
  }
}


// Show error if no ID
if (!productId) {
  productContent.innerHTML = `
    <p style="padding-top:100px; text-align:center;">Invalid product link.</p>
  `;
} else {
  initProduct();
}

async function initProduct() {
  const product = await loadProductDetails(productId);

  if (!product) {
    productContent.innerHTML = `
      <p style="padding-top:100px; text-align:center;">Product not found.</p>
    `;
    return;
  }

  const images = product.images || [];
  const tags = product.tags || "No tag";
  const sizes = ["S", "M", "L", "XL"]; // You can dynamically load later

  productContent.innerHTML = `
    <section class="product-des-wrapper">

      <!-- LEFT: IMAGE THUMBNAILS -->
      <div class="thumbs-column">
        ${images
          .map(
            (img, i) => `
            <img 
              class="thumb-img ${i === 0 ? "active-thumb" : ""}" 
              src="${img}" 
              data-index="${i}"
            />
          `
          )
          .join("")}
      </div>

      <!-- CENTER: MAIN IMAGE -->
      <div class="main-image-wrapper">
        <img id="mainDisplayImage" src="${images[0]}" class="main-image" />
      </div>

      <!-- FUTURISTIC DIVIDER -->
      <div class="neo-divider"></div>

      <!-- RIGHT: PRODUCT DETAILS -->
      <div class="info-column">
            <!-- BRAND -->
      <div class="pd-brand">NEAT CUSTOMS</div>

        <h1 class="pd-name">${product.name}</h1>

        <p class="pd-price">
          <span class="pd-currency">${product.currency}</span>
          <span class="pd-amount">${product.price.toLocaleString()}</span>
        </p>

        <!-- SIZE SELECTOR -->
        <div class="pd-size-selector">
          <span>Size:</span>
          ${sizes
            .map((size, i) => `<div class="size-box ${i === 0 ? 'selected-size' : ''}" data-size="${size}">${size}</div>`)
            .join('')}
        </div>

        <!-- QUANTITY SELECTOR -->
        <div class="pd-quantity-selector">
          <label>Quantity:</label>
          <div class="quantity-controls">
            <button id="qtyMinus">-</button>
            <input type="number" id="qtyInput" value="1" min="1" />
            <button id="qtyPlus">+</button>
          </div>
        </div>

        <!-- TAG -->
        <p class="pd-tag">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
  <path d="M2 1a1 1 0 0 0-1 1v4.586c0 .266.105.52.293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 4.586 1H2zm3 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>

          <span>${tags}</span>
        </p>

        <!-- PRODUCT DESCRIPTION -->
        <h2 class="pd-description-title">Product Description</h2>
        <p class="pd-description">${product.description || "No description available."}</p>

              <!-- ADD TO CART & CHECKOUT BUTTONS -->
      <div class="product-buttons">
        <button id="addToCartBtn">Add to Cart</button>
        <button id="checkoutBtn">Checkout</button>
      </div>
      </div>

    </section>

    <!-- ⭐ FUTURISTIC RATING SECTION ⭐ -->
<section class="neat-rating-section">
  <h2 class="rating-title">Rate This Product</h2>

  <div class="star-rating" id="starRating">
    <span data-value="1">★</span>
    <span data-value="2">★</span>
    <span data-value="3">★</span>
    <span data-value="4">★</span>
    <span data-value="5">★</span>
  </div>

  <div class="rating-output" id="ratingOutput">Tap a star to rate</div>

  <h1 class="nc-brand-watermark">Neat Customs</h1>
</section>


  `;

  // Thumbnail switching
  const mainDisplay = document.getElementById("mainDisplayImage");
  const thumbs = document.querySelectorAll(".thumb-img");

  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      thumbs.forEach(t => t.classList.remove("active-thumb"));
      thumb.classList.add("active-thumb");

      const index = thumb.dataset.index;
      mainDisplay.src = images[index];
    });
  });

  // Size selector logic
  const sizeBoxes = document.querySelectorAll(".size-box");
  sizeBoxes.forEach(box => {
    box.addEventListener("click", () => {
      sizeBoxes.forEach(b => b.classList.remove("selected-size"));
      box.classList.add("selected-size");
    });
  });

  // Quantity controls logic
  const qtyInput = document.getElementById("qtyInput");
  document.getElementById("qtyPlus").addEventListener("click", () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  });
  document.getElementById("qtyMinus").addEventListener("click", () => {
    if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
  });


const stars = document.querySelectorAll("#starRating span");
const output = document.getElementById("ratingOutput");
let currentRating = 0;


const user = auth.currentUser;


// Load existing ratings and calculate average
async function loadAverageRating() {
  try {
    const productRatingDoc = doc(db, "ratings", productId);
    const userRatingsCol = collection(productRatingDoc, "userRatings");
    const snapshot = await getDocs(userRatingsCol);

    if (snapshot.empty) {
      output.textContent = "Tap a star to rate";
      highlightStars(0);
      return;
    }

    let sum = 0;
    snapshot.forEach(doc => sum += doc.data().rating);
    const avg = (sum / snapshot.size).toFixed(1);

    currentRating = avg;
    highlightStars(Math.round(avg));
    output.textContent = `Average rating: ${avg} / 5`;

    // If user is logged in, show their rating differently
    if (user) {
      const userRatingDoc = doc(userRatingsCol, user.uid);
      const userSnap = await getDoc(userRatingDoc);
      if (userSnap.exists()) {
        const userRating = userSnap.data().rating;
        highlightStars(userRating);
        output.textContent = `Your rating: ${userRating} / 5 (avg: ${avg})`;
      }
    }

  } catch (err) {
    console.error("Error loading ratings:", err);
  }
}

await loadAverageRating();

stars.forEach(star => {
  star.addEventListener("mouseover", () => {
    const value = star.dataset.value;
    highlightStars(value);
  });
  star.addEventListener("mouseleave", () => {
    highlightStars(currentRating);
  });
  star.addEventListener("click", async () => {
    const value = Number(star.dataset.value);
    if (!user) return alert("You must be logged in to rate");

    try {
      const productRatingDoc = doc(db, "ratings", productId);
      const userRatingsCol = collection(productRatingDoc, "userRatings");
      const userRatingDoc = doc(userRatingsCol, user.uid);

      await setDoc(userRatingDoc, {
        rating: value,
        updatedAt: new Date()
      });

      // reload average rating
      await loadAverageRating();
    } catch (err) {
      console.error("Error saving rating:", err);
    }
  });
});

function highlightStars(level) {
  stars.forEach(s => {
    s.classList.toggle("active", s.dataset.value <= level);
  });
}



// Add this at the end of your initProduct() function, after rendering productContent

const addToCartBtn = document.getElementById("addToCartBtn");

// -----------------------------
// Handle Add to Cart & Checkout
// -----------------------------
const checkoutBtn = document.getElementById("checkoutBtn");

function saveSelection() {
  const selectedSize = document.querySelector(".size-box.selected-size")?.dataset.size;
  const quantity = parseInt(document.getElementById("qtyInput").value) || 1;

  if (!selectedSize) {
    alert("Please select a size before proceeding.");
    return null;
  }

  const selectionData = {
    id: `cart-selection-${productId}-${Date.now()}`, // unique ID per selection
    productId,
    size: selectedSize,
    quantity,
    timestamp: new Date().toISOString()
  };

  console.log("[SELECTION] Saved selection:", selectionData);

  // Save to IndexedDB
  saveToIndexedDB(selectionData.id, selectionData).then(() => {
    // Update cart badge immediately
    if (window.refreshCartCount) window.refreshCartCount();
  });

  return selectionData;
}



// Add to Cart
addToCartBtn.addEventListener("click", () => {
  const data = saveSelection();
  if (!data) return; // size not selected
  // Redirect to cart
  window.location.href = "cart.html";
});

// Checkout (can go to checkout page later)
checkoutBtn.addEventListener("click", () => {
  const data = saveSelection();
  if (!data) return;
  // Redirect to cart for now
  window.location.href = "cart.html";
});



}
