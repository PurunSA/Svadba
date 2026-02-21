// ================== GOOGLE FORM SETTINGS ==================
// Вставьте сюда ваши ссылки и entry ID
const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfueRdSEg7kvs6mFFb6ScV6ePsdS_O-hO1XwMc7Qb-q_UH6nw/formResponse"; // .../formResponse
const FALLBACK_FORM_PUBLIC_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfueRdSEg7kvs6mFFb6ScV6ePsdS_O-hO1XwMc7Qb-q_UH6nw/viewform?usp=publish-editor"; // .../viewform

const ENTRY_FULL_NAME  = "entry.873844360";
const ENTRY_ATTENDANCE = "entry.1470779588";
const ENTRY_DRINKS     = "entry.330147117";
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  // ---------- RSVP FORM ----------
  const form = document.getElementById("rsvpForm");
  const okMsg = document.getElementById("okMsg");
  const errMsg = document.getElementById("errMsg");
  const submitBtn = document.getElementById("submitBtn");
  const fallbackLink = document.getElementById("fallbackFormLink");

  function show(el){ if (el) el.hidden = false; }
  function hide(el){ if (el) el.hidden = true; }

  if (fallbackLink && FALLBACK_FORM_PUBLIC_URL && !FALLBACK_FORM_PUBLIC_URL.includes("PASTE_")) {
    fallbackLink.href = FALLBACK_FORM_PUBLIC_URL;
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hide(okMsg); hide(errMsg);

      // проверим, что ссылки настроены
      if (!GOOGLE_FORM_ACTION_URL || GOOGLE_FORM_ACTION_URL.includes("PASTE_")) {
        show(errMsg);
        errMsg.textContent = "Форма ещё не настроена. Вставьте ссылку formResponse в script.js.";
        return;
      }

      const fd = new FormData(form);
      const fullName = (fd.get("fullName") || "").toString().trim();
      const attendance = (fd.get("attendance") || "").toString().trim();
      const drinks = fd.getAll("drinks");

      if (!fullName || !attendance) {
        show(errMsg);
        errMsg.textContent = "Пожалуйста, заполните имя и отметьте участие.";
        return;
      }

      const payload = new URLSearchParams();
      payload.append(ENTRY_FULL_NAME, fullName);
      payload.append(ENTRY_ATTENDANCE, attendance);
      drinks.forEach((d) => payload.append(ENTRY_DRINKS, d));

      submitBtn.disabled = true;
      submitBtn.textContent = "ОТПРАВЛЯЕМ…";

      try {
        // no-cors — чтобы браузер не блокировал запрос
        await fetch(GOOGLE_FORM_ACTION_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: payload.toString()
        });

        show(okMsg);
        form.reset();
      } catch (err) {
        show(errMsg);
        errMsg.textContent = "Не получилось отправить. Попробуйте ещё раз или откройте Google Form.";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "ПОДТВЕРДИТЬ";
      }
    });
  }

  // ---------- DAISY SPIN ON SCROLL ----------
  const spinners = document.querySelectorAll(".spin-on-scroll");
  let ticking = false;

  function updateSpin() {
    const y = window.scrollY || 0;
    const deg = y * 0.15; // скорость
    spinners.forEach((el) => el.style.setProperty("--rot", `${deg}deg`));
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateSpin);
    }
  }, { passive: true });

  updateSpin();

  // ---------- HERO SLIDER (iOS-safe) ----------
  initHeroSlider();
});

function initHeroSlider() {
  const slider = document.getElementById("heroSlider");
  if (!slider) return;

  const track = slider.querySelector(".hero__track");
  const slides = Array.from(slider.querySelectorAll(".hero__slide"));
  const prevBtn = slider.querySelector(".hero__nav--prev");
  const nextBtn = slider.querySelector(".hero__nav--next");
  const dots = Array.from(slider.querySelectorAll(".hero__dot"));

  if (!track || slides.length === 0) return;

  let index = 0;

  function render() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    render();
  }

  // Кнопки (на iOS click надёжен, если не мешает drag)
  if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1));
  dots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));

  // Клавиши (ПК)
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  });

  // iOS свайп через touch (самый стабильный вариант)
  // Разрешаем вертикальный скролл, но ловим горизонтальный жест
  track.style.touchAction = "pan-y";

  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dy = 0;

  function onTouchStart(e) {
    // если попали по кнопкам/точкам — не считаем свайп
    if (e.target.closest(".hero__nav, .hero__dot")) return;

    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    dx = 0;
    dy = 0;
  }

  function onTouchMove(e) {
    const t = e.touches[0];
    dx = t.clientX - startX;
    dy = t.clientY - startY;
    // ничего не preventDefault, чтобы скролл не ломался
  }

  function onTouchEnd() {
    const threshold = 40; // порог свайпа
    // если жест скорее вертикальный — игнор
    if (Math.abs(dy) > Math.abs(dx)) return;

    if (dx > threshold) goTo(index - 1);
    else if (dx < -threshold) goTo(index + 1);
  }

  track.addEventListener("touchstart", onTouchStart, { passive: true });
  track.addEventListener("touchmove", onTouchMove, { passive: true });
  track.addEventListener("touchend", onTouchEnd, { passive: true });

  render();

}

