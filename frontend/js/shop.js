import { loadShopProducts } from "../firebase/shop-firebase.js";

const productContainer = document.getElementById("productContainer");

// Load products from Firebase
async function initShop() {
  const products = await loadShopProducts();

  if (!products.length) {
    productContainer.innerHTML = "<p>No products available.</p>";
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.images[0] || 'images/placeholder.png'}" alt="${product.name}" />
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${product.currency} ${product.price.toLocaleString()}</p>
        <div class="creator-info">
          <img src="${product.creatorPhoto}" alt="${product.creatorName}">
          <span>Design by ${product.creatorName}</span>
        </div>
        <button class="product-btn">Shop Now</button>
      </div>
    `;
    productContainer.appendChild(card);

    // Navigate to shop-details.html on click
    card.querySelector(".product-btn").addEventListener("click", () => {
      window.location.href = `shop-details.html?productId=${product.id}`;
    });
  });
}

initShop();
