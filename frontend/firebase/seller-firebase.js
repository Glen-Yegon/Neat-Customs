// seller-firebase.js
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

/* ================================
   🔹 DOM ELEMENTS
================================ */
const welcomeMessage = document.getElementById("welcomeMessage");
const gallery = document.getElementById("imageGallery");
const uploader = document.getElementById("imageUploader");
const form = document.getElementById("productForm");

let imageList = []; // base64 images

/* ================================
   🔹 Check Auth + Fetch User Name
================================ */
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      welcomeMessage.textContent = "Welcome to the Seller Dashboard!";
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      let userName = "there";

      if (userSnap.exists()) {
        const userData = userSnap.data();
        userName = userData.name || userData.fullName || "there";
      } else if (user.displayName) {
        userName = user.displayName;
      }

      welcomeMessage.textContent = `Welcome, ${userName}!`;
    } catch (error) {
      console.error("Error fetching user data:", error);
      welcomeMessage.textContent = "Welcome back!";
    }

    // After user check, also load saved design
    loadSavedDesign();
  });
});

/* ================================
   🔹 Load Saved Base64 Images
================================ */
function loadSavedDesign() {
  const savedData = localStorage.getItem("pendingSellDesign");
  if (savedData) {
    try {
      const design = JSON.parse(savedData);
      if (design.images && design.images.length > 0) {
        // ✅ map valid images and take only first 2
        imageList = design.images
          .map(img => img.data || img)
          .filter(imgSrc => !isBlankBase64(imgSrc))
          .slice(0, 2); // <-- only first 2
      }
    } catch (e) {
      console.error("Error parsing saved design:", e);
      imageList = [];
    }
  } else {
    imageList = [];
  }

  renderImages(); // display first 2
}


/* ================================
   🔹 Handle New Image Uploads
================================ */
uploader.addEventListener("change", (e) => {
  const files = e.target.files;
  for (let file of files) {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (imageList.length < 4) {
        const imgSrc = event.target.result;
        if (!isBlankBase64(imgSrc)) {
          imageList.push(imgSrc);
          renderImages();
        }
      } else {
        alert("You can only have up to 4 images total.");
      }
    };
    reader.readAsDataURL(file);
  }
});

/* ================================
   🔹 Render Images with Delete Option
================================ */
function renderImages() {
  gallery.innerHTML = "";

  if (imageList.length > 0) {
    imageList.forEach((imgSrc, index) => {
      const imgWrapper = document.createElement("div");
      imgWrapper.classList.add("image-wrapper");
      imgWrapper.style.position = "relative";
      imgWrapper.style.display = "inline-block";
      imgWrapper.style.margin = "5px";

      // Image
      const img = document.createElement("img");
      img.src = typeof imgSrc === "string" ? imgSrc : imgSrc.data;
      imgWrapper.appendChild(img);

      // Delete button
      const delBtn = document.createElement("button");
      delBtn.textContent = "×"; // X symbol
      delBtn.style.position = "absolute";
      delBtn.style.top = "2px";
      delBtn.style.right = "2px";
      delBtn.style.background = "red";
      delBtn.style.color = "white";
      delBtn.style.border = "none";
      delBtn.style.borderRadius = "50%";
      delBtn.style.width = "20px";
      delBtn.style.height = "20px";
      delBtn.style.cursor = "pointer";
      delBtn.style.fontWeight = "bold";
      delBtn.addEventListener("click", () => {
        // Remove image from array
        imageList.splice(index, 1);
        renderImages(); // re-render gallery
      });

      imgWrapper.appendChild(delBtn);
      gallery.appendChild(imgWrapper);
    });
  }

  // Show upload box if less than 4 images
  const uploadBox = document.querySelector(".upload-box");
  uploadBox.style.display = imageList.length < 4 ? "flex" : "none";
}


/* ================================
   🔹 Check if Base64 is Blank
================================ */
function isBlankBase64(base64Data) {
  const blankPatterns = [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD",
  ];
  return blankPatterns.some(pattern => base64Data.startsWith(pattern));
}


/* ================================
   🔹 Product Form Submission
================================ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const productName = document.getElementById("productName").value.trim();
  const productPrice = parseFloat(document.getElementById("productPrice").value);
  const currency = document.getElementById("currency").value;
  const productDesc = document.getElementById("productDesc").value.trim();
  const productTags = document.getElementById("productTags").value.trim();

  if (!imageList.length) {
    alert("Please upload at least one image.");
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You must be logged in to submit a product.");
      return;
    }

    const productId = `product_${Date.now()}`;

    const productData = {
      id: productId,
      name: productName,
      description: productDesc,
      price: productPrice,
      currency: currency,
      tags: productTags
        ? productTags.split(",").map((t) => t.trim())
        : [],
      images: imageList,
      createdAt: serverTimestamp(),
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "Unknown Seller",
      },
    };

    try {
      await setDoc(doc(collection(db, "user_merch"), productId), productData);
      alert("✅ Product saved successfully!");
      form.reset();
      imageList = [];
      renderImages();

      // ✅ Redirect to dashboard after successful submission
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Error saving product:", err);
      alert("❌ Failed to save product. Check console for details.");
    }
  });
});
