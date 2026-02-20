// ====== НАСТРОЙТЕ ЭТО (см. шаг 5 ниже) ======
const GOOGLE_FORM_ACTION_URL = "PASTE_GOOGLE_FORM_ACTION_URL_HERE"; // .../formResponse
const FALLBACK_FORM_PUBLIC_URL = "PASTE_GOOGLE_FORM_PUBLIC_URL_HERE"; // .../viewform

// entry IDs из вашей формы:
const ENTRY_FULL_NAME   = "entry.1111111111";
const ENTRY_ATTENDANCE  = "entry.2222222222";
const ENTRY_DRINKS      = "entry.3333333333";
// ===========================================

const form = document.getElementById("rsvpForm");
const okMsg = document.getElementById("okMsg");
const errMsg = document.getElementById("errMsg");
const submitBtn = document.getElementById("submitBtn");
const fallbackLink = document.getElementById("fallbackFormLink");

fallbackLink.href = FALLBACK_FORM_PUBLIC_URL;

function show(el){ el.hidden = false; }
function hide(el){ el.hidden = true; }

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hide(okMsg); hide(errMsg);

  const fd = new FormData(form);

  const fullName = (fd.get("fullName") || "").toString().trim();
  const attendance = (fd.get("attendance") || "").toString();
  const drinks = fd.getAll("drinks"); // массив

  if (!fullName || !attendance) {
    show(errMsg);
    errMsg.textContent = "Пожалуйста, заполните имя и отметьте участие.";
    return;
  }

  // Готовим payload в формате Google Form
  const payload = new URLSearchParams();
  payload.append(ENTRY_FULL_NAME, fullName);
  payload.append(ENTRY_ATTENDANCE, attendance);

  // Чекбоксы в Google Form обычно принимают несколько значений по одному entry
  drinks.forEach(d => payload.append(ENTRY_DRINKS, d));

  submitBtn.disabled = true;
  submitBtn.textContent = "ОТПРАВЛЯЕМ…";

  try {
    // Важно: no-cors — иначе браузер заблокирует ответ.
    // Мы не сможем прочитать результат, но запрос уйдет.
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
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "ПОДТВЕРДИТЬ";
  }
});

// Крутилка ромашки при скролле (мягко через rAF)
const spinners = document.querySelectorAll(".spin-on-scroll");
let ticking = false;

function updateSpin() {
  const y = window.scrollY || 0;

  // скорость вращения: больше число = быстрее
  const deg = y * 0.15;

  spinners.forEach((el) => {
    el.style.setProperty("--rot", `${deg}deg`);
  });

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateSpin);
  }
});

// начальное положение
updateSpin();

// ===== HERO slider (buttons + dots + swipe) =====
const slider = document.getElementById("heroSlider");
if (slider) {
  const track = slider.querySelector(".hero__track");
  const slides = Array.from(slider.querySelectorAll(".hero__slide"));
  const prevBtn = slider.querySelector(".hero__nav--prev");
  const nextBtn = slider.querySelector(".hero__nav--next");
  const dots = Array.from(slider.querySelectorAll(".hero__dot"));

  let index = 0;

  function render() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    render();
  }

  prevBtn?.addEventListener("click", () => goTo(index - 1));
  nextBtn?.addEventListener("click", () => goTo(index + 1));
  dots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));

  // клавиши на ПК (опционально)
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  });

  // свайп на телефоне
  // свайп (только по картинке/треку, кнопки не трогаем)
const trackEl = slider.querySelector(".hero__track");

let startX = 0, dx = 0, down = false;

trackEl.addEventListener("pointerdown", (e) => {
  // если вдруг попали по кнопке/точке — не запускаем свайп
  if (e.target.closest(".hero__nav, .hero__dot")) return;

  down = true;
  startX = e.clientX;
  dx = 0;

  trackEl.setPointerCapture(e.pointerId);
});

trackEl.addEventListener("pointermove", (e) => {
  if (!down) return;
  dx = e.clientX - startX;
});

trackEl.addEventListener("pointerup", () => {
  if (!down) return;
  down = false;

  const threshold = 40;
  if (dx > threshold) goTo(index - 1);
  else if (dx < -threshold) goTo(index + 1);
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("slider init"); // должно появиться в Console

  const slider = document.getElementById("heroSlider");
  if (!slider) return;

  const track = slider.querySelector(".hero__track");
  const slides = Array.from(slider.querySelectorAll(".hero__slide"));
  const prevBtn = slider.querySelector(".hero__nav--prev");
  const nextBtn = slider.querySelector(".hero__nav--next");
  const dots = Array.from(slider.querySelectorAll(".hero__dot"));

  let index = 0;

  function render() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    render();
  }

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));
  dots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));

  render();
})}
