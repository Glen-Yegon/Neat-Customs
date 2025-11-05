// firebase/saveDes.js
import { app, auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// ================================
// 🔹 Wait for Firebase + DOM to load
// ================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page fully loaded. Checking user authentication...");

  onAuthStateChanged(auth, (user) => {
    console.log("Auth listener triggered. Current user:", user);

    if (user) {
      localStorage.setItem("loggedInUserId", user.uid);
      console.log("User logged in:", user.email);
    } else {
      console.warn("No user detected. Showing login modal...");
      showLoginModal();
    }
  });
});

// ================================
// 🔹 Modal UI setup
// ================================
function showLoginModal() {
  const modal = document.createElement("div");
  modal.classList.add("login-required-modal");
  modal.innerHTML = `
    <div class="login-modal-content">
      <h2 class="modal-title">Access Restricted</h2>
      <p class="modal-text">
        You need to <strong>sign in or sign up</strong> to start designing and save your work securely.
      </p>
      <div class="modal-actions">
        <button id="goToLogin" class="modal-btn primary">Sign In / Sign Up</button>
        <button id="goBack" class="modal-btn secondary">Go Back</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  setTimeout(() => modal.classList.add("visible"), 100);

  document.getElementById("goToLogin").addEventListener("click", () => {
    window.location.href = "sign.html";
  });
  document.getElementById("goBack").addEventListener("click", () => {
    window.history.back();
  });
}

// ================================
// 🔹 Save Design to Firestore
// ================================
const saveButton = document.getElementById("saveDesign");

saveButton.addEventListener("click", async function () {
  const user = auth.currentUser;

  if (!user) {
    alert("Please sign in to save your design.");
    showLoginModal();
    return;
  }

  const userId = user.uid;
  localStorage.setItem("loggedInUserId", userId);

  const lastSavedDesignId = localStorage.getItem("lastSavedDesignId");
  if (!lastSavedDesignId) {
    alert("No design found in localStorage!");
    return;
  }

  const savedDesignData = localStorage.getItem(lastSavedDesignId);
  if (!savedDesignData) {
    alert("No design data found in localStorage!");
    return;
  }

  const designData = JSON.parse(savedDesignData);
  const designName = prompt("Enter a name for your design:");
  if (!designName) {
    alert("Design name is required!");
    return;
  }

  try {
    // ✅ Generate thumbnail from the first canvas only
    const canvas = document.getElementById("canvas-0");
    let thumbnail = "";

    if (canvas) {
      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");
      tempCanvas.width = canvas.width / 2;
      tempCanvas.height = canvas.height / 2;
      ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
      thumbnail = tempCanvas.toDataURL("image/jpeg", 0.8);
    }

    // ✅ Prepare data for Firestore
    const firestoreDesignData = {
      name: designName,
      canvas1Objects: designData.canvas1 || null,
      canvas2Objects: designData.canvas2 || null,
      canvas3Objects: designData.canvas3 || null,
      canvas4Objects: designData.canvas4 || null,
      thumbnail: thumbnail,
      savedAt: new Date().toISOString(),
    };

    // ✅ Save under "designs/{userId}" — creates if missing
    const docRef = doc(db, "designs", userId);
    await setDoc(
      docRef,
      {
        userDesigns: arrayUnion(firestoreDesignData),
      },
      { merge: true }
    );

    alert("Design saved successfully!");
  } catch (error) {
    console.error("Error saving design to Firestore: ", error);
    alert("Error saving your design. Please try logging in again.");
  }
});

// ================================
// 🔹 Before unload handler
// ================================
window.addEventListener("beforeunload", function (event) {
  const isDesignSaved = sessionStorage.getItem("isDesignSaved") === "true";
  if (!isDesignSaved) {
    event.preventDefault();
    event.returnValue = "";
  }
});

function markDesignAsSaved() {
  sessionStorage.setItem("isDesignSaved", "true");
}
function markDesignAsUnsaved() {
  sessionStorage.setItem("isDesignSaved", "false");
}

// ================================
// 🔹 Load Designs (with thumbnail)
// ================================
async function loadDesignFromFirestore() {
  const userId = localStorage.getItem("loggedInUserId");
  if (!userId) {
    alert("User not logged in.");
    return;
  }

  const designDocRef = doc(db, "designs", userId);

  try {
    const docSnap = await getDoc(designDocRef);
    if (!docSnap.exists()) {
      alert("No design document found for this user.");
      return;
    }

    const designData = docSnap.data();
    if (!designData.userDesigns || designData.userDesigns.length === 0) {
      alert("No designs found for this user.");
      return;
    }

    const modal = document.getElementById("loadDesignModal");
    const designListContainer = document.getElementById("designListContainer");
    designListContainer.innerHTML = "";

    // ✅ Loop through saved designs and create UI items
    designData.userDesigns.forEach((design, index) => {
      const designItem = document.createElement("div");
      designItem.classList.add("load-design-item");

      const img = document.createElement("img");
      img.src = design.thumbnail || "default-preview.png";
      img.alt = design.name || "Design Preview";
      img.classList.add("design-preview");
      img.onerror = () => (img.src = "default-preview.png");

      const name = document.createElement("span");
      name.textContent = design.name || "Untitled Design";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "❌";
      deleteBtn.classList.add("delete-design-btn");
      deleteBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteDesign(userId, index, designItem);
      });

      // ✅ Load the selected design when clicked
      designItem.addEventListener("click", () => loadSelectedDesign(design));

      designItem.appendChild(img);
      designItem.appendChild(name);
      designItem.appendChild(deleteBtn);
      designListContainer.appendChild(designItem);
    });

    modal.style.display = "flex";
  } catch (error) {
    console.error("Error loading design from Firestore: ", error);
    alert("Error loading design.");
  }
}

// ================================
// 🔹 Load Selected Design into Multiple Canvases
// ================================
function loadSelectedDesign(design) {
  try {
    // Ensure canvases exist
    if (!window.canvases || window.canvases.length === 0) {
      alert("⚠️ No Fabric.js canvases found.");
      console.error("window.canvases is not defined or empty.");
      return;
    }

    // List of saved design data (JSON for each canvas)
    const savedCanvases = [
      design.canvas1Objects,
      design.canvas2Objects,
      design.canvas3Objects,
      design.canvas4Objects
    ];

    // Loop through each canvas
    savedCanvases.forEach((jsonData, index) => {
      const canvas = window.canvases[index];
      if (canvas) {
        // Clear the current canvas before loading
        canvas.clear();

        // Load JSON data if available
        if (jsonData) {
          canvas.loadFromJSON(jsonData, () => {
            canvas.renderAll();
            console.log(`✅ Canvas ${index + 1} loaded successfully.`);
          });
        } else {
          console.warn(`⚠️ No saved data for canvas ${index + 1}.`);
        }
      } else {
        console.warn(`⚠️ Canvas ${index + 1} not found in window.canvases.`);
      }
    });

    // Close the modal after loading
    const modal = document.getElementById("loadDesignModal");
    if (modal) modal.style.display = "none";

    // Confirmation
    alert(`✅ Design "${design.name || "Untitled Design"}" loaded successfully.`);
  } catch (error) {
    console.error("❌ Error loading design into canvases:", error);
    alert("Error loading design into canvases.");
  }
}

// ================================
// 🔹 Modal Logic
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const loadDesignModal = document.getElementById("loadDesignModal");
  const closeLoadDesignModal = document.querySelector(".load-design-close-modal");

  // Match correct button ID
  const loadDesignButton = document.getElementById("loadDesignButton");
  loadDesignButton.addEventListener("click", async () => {
    alert("Please wait, fetching your designs...");
    await loadDesignFromFirestore();
  });

  // Close modal (X button)
  closeLoadDesignModal.addEventListener("click", () => {
    loadDesignModal.style.display = "none";
  });

  // Close when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === loadDesignModal) {
      loadDesignModal.style.display = "none";
    }
  });
});

