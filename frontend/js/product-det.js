import { loadProductDetails } from "../firebase/product-des-firebase.js";

const productContent = document.getElementById("productContent");

// Get productId from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("productId");

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
}
