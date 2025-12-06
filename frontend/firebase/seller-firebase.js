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


// ------------------------------
// IndexedDB Helper (same as saveDes.js)
// ------------------------------
const DB_NAME = "DesignStorageDB";
const STORE_NAME = "pendingDesigns";


function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}



async function loadFromIndexedDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);

    req.onsuccess = () =>
      resolve(req.result ? req.result.data : null);

    req.onerror = reject;
  });
}

/* ================================
   🔹 Load Saved Base64 Images
================================ */
async function loadSavedDesign() {
  const id = localStorage.getItem("pendingSellDesignId");
  console.log("[LOAD] pendingSellDesignId from localStorage:", id);

  if (!id) {
    console.warn("[LOAD] No pendingSellDesignId in localStorage");
    return;
  }

  try {
    const design = await loadFromIndexedDB(id);
    console.log("[LOAD] Loaded design from IndexedDB:", design);

    if (!design || !design.images) {
      console.warn("[LOAD] No design or images found in IndexedDB");
      imageList = [];
      renderImages();
      return;
    }

    // Flatten images array safely
    imageList = design.images
      .map((imgObj, idx) => {
        console.log(`[LOAD] Image #${idx}:`, imgObj);
        return imgObj?.data;
      })
      .filter(src => {
        const valid = src && !isBlankBase64(src);
        if (!valid) console.warn("[LOAD] Skipping blank or invalid base64 image");
        return valid;
      })
      .slice(0, 4); // max 4 images

    console.log("[LOAD] Final imageList to render:", imageList);
    renderImages();
  } catch (err) {
    console.error("[LOAD] Error loading design from IndexedDB:", err);
  }
}

/* ================================
   🔹 Handle New Image Uploads
================================ */
uploader.addEventListener("change", (e) => {
  const files = e.target.files;
  console.log("[UPLOAD] Files selected:", files);

  for (let file of files) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgSrc = event.target.result;
      console.log("[UPLOAD] File read as base64:", imgSrc?.substring(0, 50), "...");

      if (imageList.length < 4) {
        if (!isBlankBase64(imgSrc)) {
          imageList.push(imgSrc);
          console.log("[UPLOAD] Added image to imageList. New length:", imageList.length);
          renderImages();
        } else {
          console.warn("[UPLOAD] Ignored blank base64 image");
        }
      } else {
        alert("You can only have up to 4 images total.");
      }
    };
    reader.readAsDataURL(file);
  }
});

/* ================================
   🔹 Render Images
================================ */
function renderImages() {
  console.log("[RENDER] Rendering images. Current imageList length:", imageList.length);
  gallery.innerHTML = "";

  if (!imageList || imageList.length === 0) {
    console.log("[RENDER] No images to display");
    return;
  }

  imageList.forEach((imgSrc, index) => {
    if (!imgSrc || typeof imgSrc !== "string") {
      console.warn(`[RENDER] Skipping invalid image at index ${index}:`, imgSrc);
      return;
    }

    console.log(`[RENDER] Rendering image #${index}`, imgSrc?.substring(0, 50), "...");

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "image-wrapper";
    Object.assign(imgWrapper.style, {
      position: "relative",
      display: "inline-block",
      margin: "5px",
      width: "150px",
      height: "150px",
      overflow: "hidden",
      border: "1px solid #ccc",
      borderRadius: "8px",
      verticalAlign: "top",
    });

    const img = new Image();
    img.src = imgSrc.trim();
    Object.assign(img.style, {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    });

    img.onload = () => console.log(`[RENDER] Image #${index} loaded successfully`);
    img.onerror = () => console.error(`[RENDER] Failed to load image #${index}:`, imgSrc);

    imgWrapper.appendChild(img);

    const delBtn = document.createElement("button");
    delBtn.textContent = "×";
    Object.assign(delBtn.style, {
      position: "absolute",
      top: "2px",
      right: "2px",
      background: "red",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "20px",
      height: "20px",
      cursor: "pointer",
      fontWeight: "bold",
    });

    delBtn.addEventListener("click", () => {
      console.log(`[RENDER] Deleting image #${index}`);
      imageList.splice(index, 1);
      renderImages();
    });

    imgWrapper.appendChild(delBtn);
    gallery.appendChild(imgWrapper);
  });

  const uploadBox = document.querySelector(".upload-box");
  if (uploadBox) uploadBox.style.display = imageList.length < 4 ? "flex" : "none";
}

/* ================================
   🔹 Check if Base64 is Blank
================================ */
function isBlankBase64(base64Data) {
  // Only treat very tiny base64 images as blank (like 1x1 px PNG/JPEG)
  if (!base64Data) return true;
  const blankPatterns = [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB", // tiny PNG
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD", // tiny JPEG
  ];
  return blankPatterns.some(pattern => base64Data.startsWith(pattern));
}


/* ================================
   🔹 Product Form Submission
================================ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const productName = document.getElementById("productName").value.trim();
  const productType = document.getElementById("productType").value;
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
      type: productType,
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
