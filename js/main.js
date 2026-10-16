/* =========================================================
   CHARIS MODA — minimal vanilla JS (~3 KB)
   nav state · mobile menu · scroll reveal · CSS 3D tilt · DM helper
   ========================================================= */
(() => {
  "use strict";

  const doc = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Navbar: glass state on scroll ---------- */
  const nav = document.getElementById("nav");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("mobile-menu");
  const setMenu = (open) => {
    body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    menu.setAttribute("aria-hidden", String(!open));
  };
  toggle.addEventListener("click", () => setMenu(!body.classList.contains("nav-open")));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Active nav link ---------- */
  const navLinks = [...document.querySelectorAll(".nav__links a")];
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["elbiseler", "atolye", "korseler", "randevu"].forEach((id) => {
      const s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- CSS 3D tilt (desktop / fine pointer only) ---------- */
  const bindTilt = (stage, max) => {
    const target = stage.querySelector(".tilt-target");
    if (!target) return;
    let rect = null, x = 0.5, y = 0.5, raf = 0;

    const paint = () => {
      raf = 0;
      target.style.setProperty("--rx", ((0.5 - y) * max).toFixed(2) + "deg");
      target.style.setProperty("--ry", ((x - 0.5) * max).toFixed(2) + "deg");
      target.style.setProperty("--px", (x - 0.5).toFixed(3));
      target.style.setProperty("--py", (y - 0.5).toFixed(3));
      target.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
      target.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
    };

    stage.addEventListener("pointerenter", () => {
      rect = stage.getBoundingClientRect();
      target.classList.add("is-tilting");
    });
    stage.addEventListener("pointermove", (e) => {
      if (!rect) rect = stage.getBoundingClientRect();
      x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
      if (!raf) raf = requestAnimationFrame(paint);
    });
    stage.addEventListener("pointerleave", () => {
      rect = null;
      x = 0.5; y = 0.5;
      target.classList.remove("is-tilting");
      if (raf) cancelAnimationFrame(raf);
      paint();
    });
    window.addEventListener("scroll", () => { rect = null; }, { passive: true });
  };

  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".product__stage[data-tilt]").forEach((el) => bindTilt(el, 14));
    const heroVisual = document.querySelector('[data-tilt="hero"]');
    if (heroVisual) bindTilt(heroVisual, 16);

    /* Hero ambient spotlight follows the cursor */
    const hero = document.querySelector(".hero");
    const spot = document.querySelector(".hero__spot");
    let sRaf = 0, sx = 0, sy = 0;
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      sx = e.clientX - r.left;
      sy = e.clientY - r.top;
      if (!sRaf) sRaf = requestAnimationFrame(() => {
        spot.style.setProperty("--mx", sx + "px");
        spot.style.setProperty("--my", sy + "px");
        sRaf = 0;
      });
    });
  }

  /* ---------- Instagram DM helper ----------
     Instagram does not allow prefilled DMs, so we copy a ready message
     to the clipboard; the link itself still opens Instagram in a new tab. */
  const toast = document.getElementById("toast");
  let toastTimer = 0;
  const showToast = (html) => {
    toast.innerHTML = html;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-show"), 4200);
  };

  document.querySelectorAll("[data-product]").forEach((link) => {
    link.addEventListener("click", () => {
      const product = link.dataset.product;
      const message = product === "randevu"
        ? "Merhaba Charis Moda, randevu ve sipariş hakkında bilgi almak istiyorum."
        : `Merhaba Charis Moda, "${product}" hakkında bilgi almak istiyorum.`;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(message)
          .then(() => showToast("<strong>Mesajınız kopyalandı.</strong> Instagram DM'e yapıştırmanız yeterli ✦"))
          .catch(() => {});
      }
    });
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  doc.classList.add("is-ready");
})();
