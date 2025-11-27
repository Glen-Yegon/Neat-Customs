import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

export async function loadProductDetails(productId) {
  try {
    // Use the correct collection
    const ref = doc(db, "user_merch", productId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("Error loading product:", err);
    return null;
  }
}
