import { auth, db } from '../firebase/firebase.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Elements
const authModal = document.getElementById('authModal');
const profileContent = document.getElementById('profileContent');
const loader = document.getElementById('loaderWrapper');

const goLoginBtn = document.getElementById('goLogin');
const goSignupBtn = document.getElementById('goSignup');
const logoutBtn = document.getElementById('logoutBtn');

const avatarImg = document.getElementById('avatarImg');
const fullNameDisplay = document.getElementById('fullNameDisplay');
const emailDisplay = document.getElementById('emailDisplay');
const methodBadge = document.getElementById('methodBadge');

const infoEmail = document.getElementById('infoEmail');
const infoMethod = document.getElementById('infoMethod');
const infoCreated = document.getElementById('infoCreated');
const infoLastLogin = document.getElementById('infoLastLogin');

const editBtn = document.getElementById('editBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const editModal = document.getElementById('editModal');
const editFullName = document.getElementById('editFullName');
const editStatus = document.getElementById('editStatus');
const saveEdit = document.getElementById('saveEdit');
const cancelEdit = document.getElementById('cancelEdit');

const editPhotoFile = document.getElementById('editPhotoFile');
const photoPreview = document.getElementById('photoPreview');
const photoFileName = document.getElementById('photoFileName');

// Crop modal elements
const cropModal = document.getElementById('cropModal');
const cropStage = document.getElementById('cropStage');
const cropImage = document.getElementById('cropImage');
const cropZoom = document.getElementById('cropZoom');
const cropCancel = document.getElementById('cropCancel');
const cropConfirm = document.getElementById('cropConfirm');

let currentUser = null;
let currentPhotoURL = "";
let selectedBase64 = null;

// Crop state
const STAGE_SIZE = 260;
let naturalW = 0, naturalH = 0;
let baseScale = 1;
let zoom = 1;
let posX = 0, posY = 0;
let dragging = false;
let dragStartX = 0, dragStartY = 0;
let startPosX = 0, startPosY = 0;

// ---- Helpers ----
function hideLoader() {
  loader.style.opacity = "0";
  setTimeout(() => loader.style.display = "none", 400);
}

function formatDate(timestamp) {
  if (!timestamp) return "—";
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function openModal(modal) { modal.classList.add('show'); }
function closeModal(modal) { modal.classList.remove('show'); }

// ---- Auth Gate ----
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    hideLoader();
    openModal(authModal);
    return;
  }

  currentUser = user;

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const data = snap.exists() ? snap.data() : {};

    populateProfile(user, data);
    profileContent.style.display = "block";
  } catch (err) {
    console.error("Failed to load profile:", err);
  } finally {
    hideLoader();
  }
});

function populateProfile(user, data) {
  const name = data.fullName || user.displayName || "Unnamed User";
  const email = data.email || user.email;
  const photo = data.photoURL || user.photoURL || "images/placeholder-avatar.png";
  const method = data.signupMethod || "email";

  currentPhotoURL = data.photoURL || user.photoURL || "";

  avatarImg.src = photo;
  fullNameDisplay.textContent = name;
  emailDisplay.textContent = email;
  methodBadge.textContent = method === "google" ? "Google Account" : "Email Account";

  infoEmail.textContent = email;
  infoMethod.textContent = method === "google" ? "Google" : "Email & Password";
  infoCreated.textContent = formatDate(data.createdAt);
  infoLastLogin.textContent = formatDate(data.lastLogin);

  editFullName.value = name;
  photoPreview.src = photo;
}

// ---- Redirect buttons on auth modal ----
goLoginBtn.addEventListener('click', () => {
  window.location.href = "sign.html?mode=login";
});
goSignupBtn.addEventListener('click', () => {
  window.location.href = "sign.html?mode=signup";
});

// ---- Logout ----
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = "sign.html";
  } catch (err) {
    console.error("Logout failed:", err);
    alert("Failed to log out. Please try again.");
  }
});

// ---- Edit Profile Modal ----
function openEditModal() {
  editStatus.textContent = "";
  selectedBase64 = null;
  photoFileName.textContent = "No file selected";
  photoPreview.src = currentPhotoURL || "images/placeholder-avatar.png";
  openModal(editModal);
}
editBtn.addEventListener('click', openEditModal);
editProfileBtn.addEventListener('click', openEditModal);
cancelEdit.addEventListener('click', () => closeModal(editModal));

// ---- Photo selection -> open crop modal ----
editPhotoFile.addEventListener('change', () => {
  const file = editPhotoFile.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    editStatus.textContent = "Please select a valid image file.";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    editStatus.textContent = "Image is too large. Please choose a smaller file.";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    cropImage.onload = () => {
      naturalW = cropImage.naturalWidth;
      naturalH = cropImage.naturalHeight;

      baseScale = Math.max(STAGE_SIZE / naturalW, STAGE_SIZE / naturalH);
      zoom = 1;
      cropZoom.value = 1;

      const scaledW = naturalW * baseScale;
      const scaledH = naturalH * baseScale;
      posX = (STAGE_SIZE - scaledW) / 2;
      posY = (STAGE_SIZE - scaledH) / 2;

      applyCropTransform();
      openModal(cropModal);
    };
    cropImage.src = e.target.result;
  };
  reader.readAsDataURL(file);

  editPhotoFile.value = "";
});

// ---- Apply current pan/zoom to the crop image ----
function applyCropTransform() {
  const scale = baseScale * zoom;
  cropImage.style.width = `${naturalW}px`;
  cropImage.style.height = `${naturalH}px`;
  cropImage.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// ---- Clamp panning so the circle never shows empty space ----
function clampPosition() {
  const scale = baseScale * zoom;
  const scaledW = naturalW * scale;
  const scaledH = naturalH * scale;

  const minX = STAGE_SIZE - scaledW;
  const minY = STAGE_SIZE - scaledH;

  posX = Math.min(0, Math.max(minX, posX));
  posY = Math.min(0, Math.max(minY, posY));
}

// ---- Zoom slider ----
cropZoom.addEventListener('input', () => {
  zoom = parseFloat(cropZoom.value);
  clampPosition();
  applyCropTransform();
});

// ---- Drag to reposition (mouse + touch) ----
function startDrag(clientX, clientY) {
  dragging = true;
  dragStartX = clientX;
  dragStartY = clientY;
  startPosX = posX;
  startPosY = posY;
  cropStage.classList.add('dragging');
}

function moveDrag(clientX, clientY) {
  if (!dragging) return;
  posX = startPosX + (clientX - dragStartX);
  posY = startPosY + (clientY - dragStartY);
  clampPosition();
  applyCropTransform();
}

function endDrag() {
  dragging = false;
  cropStage.classList.remove('dragging');
}

cropStage.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
window.addEventListener('mouseup', endDrag);

cropStage.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  startDrag(t.clientX, t.clientY);
}, { passive: true });

cropStage.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  moveDrag(t.clientX, t.clientY);
}, { passive: true });

cropStage.addEventListener('touchend', endDrag);

// ---- Cancel crop ----
cropCancel.addEventListener('click', () => {
  closeModal(cropModal);
});

// ---- Confirm crop -> render final circular crop to compressed base64 ----
cropConfirm.addEventListener('click', () => {
  const OUTPUT_SIZE = 300;
  const scale = baseScale * zoom;

  const sx = -posX / scale;
  const sy = -posY / scale;
  const sSize = STAGE_SIZE / scale;

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    cropImage,
    sx, sy, sSize, sSize,
    0, 0, OUTPUT_SIZE, OUTPUT_SIZE
  );

  const base64 = canvas.toDataURL('image/jpeg', 0.8);

  const approxBytes = Math.round((base64.length * 3) / 4);
  if (approxBytes > 700 * 1024) {
    editStatus.textContent = "Image still too large. Try a different photo.";
    closeModal(cropModal);
    return;
  }

  selectedBase64 = base64;
  photoPreview.src = base64;
  photoFileName.textContent = "Photo adjusted";
  editStatus.textContent = "";
  closeModal(cropModal);
});

// ---- Save changes ----
saveEdit.addEventListener('click', async () => {
  if (!currentUser) return;

  const newName = editFullName.value.trim();

  if (!newName) {
    editStatus.textContent = "Full name can't be empty.";
    return;
  }

  saveEdit.disabled = true;
  editStatus.textContent = "Saving...";

  try {
    const photoURL = selectedBase64 || currentPhotoURL;

    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      fullName: newName,
      photoURL: photoURL
    });

    // Keep the public-facing profile doc in sync (name + photo only)
    const publicRef = doc(db, "publicProfiles", currentUser.uid);
    await setDoc(publicRef, {
      fullName: newName,
      photoURL: photoURL
    });

    currentPhotoURL = photoURL;

    fullNameDisplay.textContent = newName;
    avatarImg.src = photoURL || "images/placeholder-avatar.png";

    editStatus.textContent = "Saved!";
    setTimeout(() => closeModal(editModal), 700);
  } catch (err) {
    console.error("Update failed:", err);
    editStatus.textContent = "Something went wrong. Try again.";
  } finally {
    saveEdit.disabled = false;
  }
});