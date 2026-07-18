/* ===========================================
   HEAVYCHATS BULK HERO
=========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ============================
       SMOOTH SCROLL
    ============================ */

    const scrollLinks = document.querySelectorAll('a[href^="#"]');

    scrollLinks.forEach(link => {

        link.addEventListener("click", function (e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });



    /* ============================
       FADE IN CONTENT
    ============================ */

    const heroContent = document.querySelector(".hero-content");

    heroContent.style.opacity = "0";
    heroContent.style.transform = "translateY(30px)";

    requestAnimationFrame(() => {

        heroContent.style.transition =
            "opacity .9s ease, transform .9s ease";

        heroContent.style.opacity = "1";
        heroContent.style.transform = "translateY(0)";

    });



    /* ============================
       PARALLAX BLOBS
    ============================ */

    const blob1 = document.querySelector(".blob-1");
    const blob2 = document.querySelector(".blob-2");

    document.addEventListener("mousemove", (e) => {

        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;

        blob1.style.transform =
            `translate(${x}px, ${y}px)`;

        blob2.style.transform =
            `translate(${-x}px, ${-y}px)`;

    });



    /* ============================
       BUTTON RIPPLE
    ============================ */

    const button = document.querySelector(".btn-primary");

    button.addEventListener("mousemove", e => {

        const rect = button.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        button.style.setProperty("--x", `${x}px`);
        button.style.setProperty("--y", `${y}px`);

    });

});

/* ==========================================
   BUILT FOR
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       REVEAL ON SCROLL
    ========================== */

    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("active");

            }

        });

    }, {

        threshold: .15

    });

    reveals.forEach(card => observer.observe(card));



    /* ==========================
       PREMIUM TILT
    ========================== */

    const cards = document.querySelectorAll(".built-card");

    cards.forEach(card => {

        card.addEventListener("mousemove", e => {

            const rect = card.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rotateY = ((x / rect.width) - .5) * 8;
            const rotateX = ((y / rect.height) - .5) * -8;

            card.style.transform =
                `perspective(1200px)
                 rotateX(${rotateX}deg)
                 rotateY(${rotateY}deg)
                 translateY(-12px)`;

        });

        card.addEventListener("mouseleave", () => {

            card.style.transform =
                "perspective(1200px) rotateX(0) rotateY(0) translateY(0)";

        });

    });



    /* ==========================
       CURSOR GLOW
    ========================== */

    cards.forEach(card => {

        card.addEventListener("mousemove", e => {

            const rect = card.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty("--x", `${x}px`);
            card.style.setProperty("--y", `${y}px`);

        });

    });

});

document.addEventListener("DOMContentLoaded",()=>{

    const reveals=document.querySelectorAll(".reveal");

    const progress=document.querySelector(".timeline-progress");

    const steps=document.querySelectorAll(".process-step");

    const observer=new IntersectionObserver((entries)=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.classList.add("active");

            }

        });

    },{threshold:.15});

    reveals.forEach(el=>observer.observe(el));

    const timeline=document.querySelector(".process-timeline");

    const progressObserver=new IntersectionObserver((entries)=>{

        entries.forEach(entry=>{

            if(!entry.isIntersecting) return;

            progress.classList.add("animate");

            steps.forEach((step,index)=>{

                setTimeout(()=>{

                    step.classList.add("active");

                },index*420);

            });

        });

    },{threshold:.35});

    progressObserver.observe(timeline);

});

/* ==========================================
   HEAVYCHATS BULK FORM
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

const form=document.querySelector(".bulk-form");
const upload=document.getElementById("upload");
const uploadBox=document.querySelector(".upload-box");
const uploadTitle=uploadBox.querySelector("h4");
const uploadText=uploadBox.querySelector("span");
const submitBtn=document.querySelector(".quote-btn");

/* ==========================================
   FLOATING LABELS
========================================== */

document.querySelectorAll(".form-group input,.form-group textarea").forEach(input=>{

    input.setAttribute("placeholder"," ");

});

/* ==========================================
   DRAG & DROP
========================================== */

["dragenter","dragover"].forEach(event=>{

    uploadBox.addEventListener(event,e=>{

        e.preventDefault();

        uploadBox.classList.add("dragging");

    });

});

["dragleave","dragend"].forEach(event=>{

    uploadBox.addEventListener(event,()=>{

        uploadBox.classList.remove("dragging");

    });

});

uploadBox.addEventListener("drop",e=>{

    e.preventDefault();

    uploadBox.classList.remove("dragging");

    if(e.dataTransfer.files.length){

        upload.files=e.dataTransfer.files;

        updateFile(upload.files[0]);

    }

});

/* ==========================================
   FILE SELECT
========================================== */

upload.addEventListener("change",()=>{

    if(upload.files.length){

        updateFile(upload.files[0]);

    }

});

function updateFile(file){

    const size=(file.size/1024/1024).toFixed(2);

    uploadBox.classList.add("uploaded");

    uploadBox.querySelector("i").className="fa-solid fa-circle-check";

    uploadTitle.textContent=file.name;

    uploadText.textContent=size+" MB";

}

/* ==========================================
   SUBMIT
========================================== */

form.addEventListener("submit",e=>{

    e.preventDefault();

    submitBtn.disabled=true;

    submitBtn.innerHTML=`
        <i class="fa-solid fa-spinner fa-spin"></i>
        Preparing Quote...
    `;

    setTimeout(()=>{

        submitBtn.innerHTML=`
            <i class="fa-solid fa-circle-check"></i>
            Quote Request Sent
        `;

        submitBtn.style.background="#16a34a";

    },1800);

});

/* ==========================================
   REVEAL
========================================== */

const reveals=document.querySelectorAll(".reveal");

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

},{threshold:.15});

reveals.forEach(el=>observer.observe(el));

});