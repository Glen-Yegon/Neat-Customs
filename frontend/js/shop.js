import { loadShopProducts } from "../firebase/shop-firebase.js";

const productContainer = document.getElementById("productContainer");
const categorySelect = document.getElementById("categorySelect");
const filterSelect = document.getElementById("filterSelect");

// Store all products globally for filtering
let allProducts = [];

// Load products from Firebase
// Load products from Firebase
async function initShop() {
  // Show loader
  const loader = document.getElementById("loaderWrapper");
  loader.style.display = "flex";

  const products = await loadShopProducts();
  allProducts = products;

  // Hide loader
  loader.style.opacity = "0";
  setTimeout(() => loader.style.display = "none", 400);

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
      </div>
    `;

    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      window.location.href = `product-des.html?productId=${product.id}`;
    });

    productContainer.appendChild(card);
  });
}

initShop();

function renderFilteredProducts(products) {
  productContainer.innerHTML = "";

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

    card.querySelector(".product-btn").addEventListener("click", () => {
      window.location.href = `product-des.html?productId=${product.id}`;
    });
  });
}


categorySelect.addEventListener("change", applyFilters);
filterSelect.addEventListener("change", applyFilters);

function applyFilters() {
  let filteredProducts = [...allProducts];

  // Filter by category
  const selectedCategory = categorySelect.value;
  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter(p => p.type === selectedCategory);
  }

  // Sort by filter
  const selectedFilter = filterSelect.value;
  if (selectedFilter === "priceLowHigh") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (selectedFilter === "priceHighLow") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  renderFilteredProducts(filteredProducts);
}
