import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Elements
const productContainer = document.getElementById("userProducts");
const productModal = document.getElementById("productModal");
const modalClose = document.querySelector(".modal-close");
const modalImages = document.getElementById("modalImages");
const modalProductName = document.getElementById("modalProductName");
const modalProductPrice = document.getElementById("modalProductPrice");
const modalProductDesc = document.getElementById("modalProductDesc");
const modalProductTags = document.getElementById("modalProductTags");
const editProductBtn = document.getElementById("editProductBtn");
const deleteProductBtn = document.getElementById("deleteProductBtn");

let products = [];
let currentProductId = null;
let currentProductData = null;

// Fetch logged-in user's products
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    productContainer.innerHTML = `<p>Please log in to view your products.</p>`;
    return;
  }

  try {
    const q = query(collection(db, "user_merch"), where("user.uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    productContainer.innerHTML = "";
    products = [];

    if (querySnapshot.empty) {
      productContainer.innerHTML = `<p>You have no products yet.</p>`;
      return;
    }

    querySnapshot.forEach(docSnap => {
      const product = docSnap.data();
      product.id = docSnap.id;
      products.push(product);

      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-image">
          <img src="${product.images[0] || 'images/placeholder.png'}" alt="${product.name}" />
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">${product.currency} ${product.price.toLocaleString()}</p>
          <button class="product-btn">View Details</button>
        </div>
      `;
      productContainer.appendChild(card);

      // Open modal on click
      card.querySelector(".product-btn").addEventListener("click", () => openProductModal(product));
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    productContainer.innerHTML = `<p>Failed to load products. Check console for details.</p>`;
  }
});

// Open modal
function openProductModal(product) {
  currentProductId = product.id;
  currentProductData = product;

  // Images
  modalImages.innerHTML = "";
  product.images.forEach(img => {
    const imgEl = document.createElement("img");
    imgEl.src = img;
    modalImages.appendChild(imgEl);
  });

  // Info
  modalProductName.textContent = product.name;
  modalProductPrice.textContent = `${product.currency} ${product.price.toLocaleString()}`;
  modalProductDesc.textContent = product.description;
  modalProductTags.textContent = product.tags.join(", ");

  productModal.style.display = "block";
}

// Close modal
modalClose.addEventListener("click", () => productModal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === productModal) productModal.style.display = "none";
});

// Edit product
editProductBtn.addEventListener("click", async () => {
  const newName = prompt("Enter new product name:", currentProductData.name);
  const newPrice = prompt("Enter new product price:", currentProductData.price);
  const newDesc = prompt("Enter new product description:", currentProductData.description);

  if (newName && newPrice && newDesc) {
    try {
      await updateDoc(doc(db, "user_merch", currentProductId), {
        name: newName,
        price: parseFloat(newPrice),
        description: newDesc
      });
      alert("✅ Product updated successfully!");
      currentProductData.name = newName;
      currentProductData.price = parseFloat(newPrice);
      currentProductData.description = newDesc;
      openProductModal(currentProductData);
      // Refresh product grid
      window.location.reload();
    } catch (err) {
      console.error("Error updating product:", err);
      alert("❌ Failed to update product.");
    }
  }
});

// Delete product
deleteProductBtn.addEventListener("click", async () => {
  const confirmName = prompt(`Type the product name (${currentProductData.name}) to confirm deletion:`);
  if (confirmName === currentProductData.name) {
    try {
      await deleteDoc(doc(db, "user_merch", currentProductId));
      alert("✅ Product deleted successfully!");
      productModal.style.display = "none";
      window.location.reload();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("❌ Failed to delete product.");
    }
  } else {
    alert("❌ Product name does not match. Deletion cancelled.");
  }
});
