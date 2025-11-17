// SELECT NAV ITEMS AND SIDE MENUS
const navItems = document.querySelectorAll('.nav-item');
const toteMenu = document.getElementById('tote-menu');
const teesMenu = document.getElementById('tees-menu');
const phoneMenu = document.getElementById('phone-menu');
const closeBtns = document.querySelectorAll('.close-btn');

// HELPER FUNCTION TO CLOSE ALL DESKTOP SIDE MENUS
function closeMenus() {
  toteMenu.classList.remove('active');
  teesMenu.classList.remove('active');
  phoneMenu.classList.remove('active');
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    const menuType = item.getAttribute('data-menu');
    
    // Toggle menu
    if (menuType === 'tote') toteMenu.classList.toggle('active');
    if (menuType === 'phone') phoneMenu.classList.toggle('active');
    if (menuType === 'tees') teesMenu.classList.toggle('active');
    
    // Close other menus
    if (menuType !== 'tote') toteMenu.classList.remove('active');
    if (menuType !== 'phone') phoneMenu.classList.remove('active');
    if (menuType !== 'tees') teesMenu.classList.remove('active');
  });
});




const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) { // change scroll distance if needed
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});



closeBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close desktop menus
    closeMenus();
    // Close mobile menu
    mobileMenu.classList.remove('active');
  });
});


// CLICK OUTSIDE TO CLOSE DESKTOP SIDE MENUS
document.body.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-item') && !e.target.closest('.side-menu') && !e.target.closest('.mobile-menu') && !e.target.closest('.hamburger')) {
    closeMenus();
    mobileMenu.classList.remove('active');
  }
});

// SELECT ELEMENTS
const fancyHamburger = document.getElementById('fancyHamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileCloseBtn = mobileMenu.querySelector('.close-btn');

// TOGGLE MOBILE MENU WHEN HAMBURGER IS CLICKED
fancyHamburger.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent body click handler from immediately closing
  fancyHamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});

// CLOSE MOBILE MENU WHEN CLOSE BUTTON IS CLICKED
mobileCloseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fancyHamburger.classList.remove('active');
  mobileMenu.classList.remove('active');
});

// OPTIONAL: CLOSE MOBILE MENU WHEN CLICKING OUTSIDE
document.addEventListener('click', (e) => {
  if (!e.target.closest('.mobile-menu') && !e.target.closest('#fancyHamburger')) {
    fancyHamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll("#what-we-offer .card");

  const revealCard = (card, delay) => {
    setTimeout(() => {
      card.classList.add("visible");
    }, delay);
  };

  cards.forEach((card) => {
    const delay = parseInt(card.getAttribute("data-delay")) || 0;
    revealCard(card, delay);
  });
});

window.addEventListener("load", () => {
  const slides = document.querySelectorAll(".slideshow img");
  const navbar = document.getElementById("navbar");
  const brand = document.querySelector(".brand");
  const leftS = document.querySelector(".r-left");
  const rightS = document.querySelector(".r-right");
  const bottomS = document.querySelector(".r-bottom");
  const heroVideo = document.getElementById("hero-video"); // select your hero video
  let current = 0;
  const delay = 200;

  function showSlide(index) {
    slides[index].classList.add("active");
  }

  function startSlideshow() {
    const interval = setInterval(() => {
      if (current < slides.length) {
        showSlide(current);
        current++;
      } else {
        clearInterval(interval);

        // Fade out brand first
        brand.style.opacity = "0";

        // Delay movement of letters by 1 second
        setTimeout(() => {
          leftS.classList.add("move-left");
          rightS.classList.add("move-right");
          bottomS.classList.add("move-bottom");
        }, 1000);

        // Transition background
        const preloader = document.getElementById("preloader");
        const mainContent = document.getElementById("main-content");

        mainContent.style.display = "block";
        preloader.style.transition = "opacity 1s ease";
        preloader.style.opacity = "0";

        setTimeout(() => {
          preloader.style.display = "none";
          document.body.style.overflow = "auto";

          // ✅ Start hero video after preloader
          if (heroVideo) {
            heroVideo.play().catch(err => {
              console.log("Video autoplay failed:", err);
            });
          }

        }, 1000);
      }
    }, delay);
  }

  startSlideshow();
});
