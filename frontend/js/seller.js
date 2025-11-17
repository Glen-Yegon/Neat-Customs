// ================ SELLER NAVBAR INTERACTIONS ================

// Back button navigation
const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.history.back();
  });
}

// Smooth fade-in effect for page content
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = 0;
  document.body.style.transition = "opacity 0.6s ease-in-out";
  setTimeout(() => (document.body.style.opacity = 1), 50);
});
