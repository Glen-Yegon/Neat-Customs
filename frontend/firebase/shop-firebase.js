import { db } from "./firebase.js";
import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

export async function loadShopProducts() {
    try {
        const productSnapshot = await getDocs(collection(db, "user_merch"));
        const products = [];

        for (const docSnap of productSnapshot.docs) {
            const product = docSnap.data();
            product.id = docSnap.id;

            // Default values
            product.creatorName = "Unknown";
            product.creatorPhoto = "images/placeholder.png";

            // Fetch creator information from users collection
            if (product.user && product.user.uid) {
                const creatorDoc = await getDoc(
                    doc(db, "users", product.user.uid)
                );

                if (creatorDoc.exists()) {
                    const creatorData = creatorDoc.data();

                    product.creatorName =
                        creatorData.fullName || "Unknown";

                    product.creatorPhoto =
                        creatorData.photoURL || "images/placeholder.png";
                }
            }

            products.push(product);
        }

        return products;
    } catch (err) {
        console.error("Error loading shop products:", err);
        return [];
    }
}