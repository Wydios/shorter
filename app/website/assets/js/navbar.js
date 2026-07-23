const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navOverlay = document.getElementById("navOverlay");

function closeMenu() {
    nav.classList.remove("open");
    navOverlay.classList.remove("active");
    navToggle.textContent = "☰";
}

navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");

    navOverlay.classList.toggle("active", open);
    navToggle.textContent = open ? "✕" : "☰";
});

navOverlay.addEventListener("click", closeMenu);