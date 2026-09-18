/* ============================================
   SCROLL PROGRESS + NAV STATE
   ============================================ */
const siteNav = document.getElementById('siteNav');
const scrollProgress = document.getElementById('scrollProgress');
const toTopBtn = document.getElementById('toTop');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  siteNav.classList.toggle('scrolled', y > 40);
  toTopBtn.classList.toggle('show', y > 600);
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = docH > 0 ? `${(y / docH) * 100}%` : '0%';
}, { passive: true });

/* ============================================
   MOBILE NAV TOGGLE
   ============================================ */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================
   HERO BUBBLES (decorative, CSS-driven)
   ============================================ */
const bubbleField = document.getElementById('heroBubbles');
const BUBBLE_COUNT = 16;
for (let i = 0; i < BUBBLE_COUNT; i++) {
  const b = document.createElement('span');
  const size = 6 + Math.random() * 22;
  b.style.width = `${size}px`;
  b.style.height = `${size}px`;
  b.style.left = `${Math.random() * 100}%`;
  b.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
  b.style.animationDuration = `${9 + Math.random() * 10}s`;
  b.style.animationDelay = `${Math.random() * 10}s`;
  bubbleField.appendChild(b);
}

/* ============================================
   ANIMATED COUNTERS
   ============================================ */
function animateCount(el){
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();
  function tick(now){
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const countEls = document.querySelectorAll('.count[data-count]');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
countEls.forEach(el => countObserver.observe(el));

/* ============================================
   SERVICES TABS
   ============================================ */
const tabButtons = document.querySelectorAll('#serviceIndex button');
const panels = document.querySelectorAll('.service-panel');
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.setAttribute('aria-selected', 'false'));
    btn.setAttribute('aria-selected', 'true');
    panels.forEach(p => p.classList.remove('active'));
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

/* ============================================
   BEFORE / AFTER SLIDER
   ============================================ */
const baSlider = document.getElementById('baSlider');
const baAfter = document.getElementById('baAfter');
const baHandle = document.getElementById('baHandle');
baHandle.setAttribute('tabindex', '0');
baHandle.setAttribute('role', 'slider');
baHandle.setAttribute('aria-valuemin', '0');
baHandle.setAttribute('aria-valuemax', '100');
baHandle.setAttribute('aria-valuenow', '50');

function setBaPosition(pct){
  pct = Math.max(2, Math.min(98, pct));
  baAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
  baHandle.style.left = `${pct}%`;
  baHandle.setAttribute('aria-valuenow', Math.round(pct));
}
function baFromClientX(clientX){
  const rect = baSlider.getBoundingClientRect();
  const pct = ((clientX - rect.left) / rect.width) * 100;
  setBaPosition(pct);
}
let baDragging = false;
baHandle.addEventListener('pointerdown', (e) => { baDragging = true; baHandle.setPointerCapture(e.pointerId); });
baSlider.addEventListener('pointerdown', (e) => { baDragging = true; baFromClientX(e.clientX); });
window.addEventListener('pointermove', (e) => { if (baDragging) baFromClientX(e.clientX); });
window.addEventListener('pointerup', () => { baDragging = false; });
baHandle.addEventListener('keydown', (e) => {
  const current = parseFloat(baHandle.style.left) || 50;
  if (e.key === 'ArrowLeft') setBaPosition(current - 4);
  if (e.key === 'ArrowRight') setBaPosition(current + 4);
});

/* ============================================
   GALLERY FILTERS + LIGHTBOX
   ============================================ */
const filterButtons = document.querySelectorAll('#galleryFilters button');
const galleryButtons = Array.from(document.querySelectorAll('#galleryGrid button'));

filterButtons.forEach(fb => {
  fb.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    fb.classList.add('active');
    const filter = fb.dataset.filter;
    galleryButtons.forEach(gb => {
      const show = filter === 'all' || gb.dataset.cat === filter;
      gb.classList.toggle('hidden', !show);
    });
  });
});

const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lbImage');
let lbIndex = 0;

function visibleGalleryButtons(){ return galleryButtons.filter(b => !b.classList.contains('hidden')); }
function openLightbox(btn){
  const list = visibleGalleryButtons();
  lbIndex = list.indexOf(btn);
  lbImage.src = btn.dataset.full;
  lbImage.alt = btn.dataset.cap || '';
  lightbox.classList.add('open');
}
function closeLightbox(){ lightbox.classList.remove('open'); }
function showRelative(delta){
  const list = visibleGalleryButtons();
  lbIndex = (lbIndex + delta + list.length) % list.length;
  openLightbox(list[lbIndex]);
}
galleryButtons.forEach(btn => btn.addEventListener('click', () => openLightbox(btn)));
document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => showRelative(-1));
document.getElementById('lbNext').addEventListener('click', () => showRelative(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showRelative(-1);
  if (e.key === 'ArrowRight') showRelative(1);
});

/* ============================================
   TESTIMONIAL CAROUSEL
   ============================================ */
const testiSlides = document.querySelectorAll('.testi-slide');
const testiDots = document.querySelectorAll('#testiDots button');
let testiIndex = 0;
let testiTimer;

function showTesti(i){
  testiSlides.forEach(s => s.classList.remove('active'));
  testiDots.forEach(d => d.classList.remove('active'));
  testiSlides[i].classList.add('active');
  testiDots[i].classList.add('active');
  testiIndex = i;
}
function nextTesti(){ showTesti((testiIndex + 1) % testiSlides.length); }
function startTestiAuto(){ testiTimer = setInterval(nextTesti, 6000); }
function resetTestiAuto(){ clearInterval(testiTimer); startTestiAuto(); }

testiDots.forEach(dot => dot.addEventListener('click', () => {
  showTesti(parseInt(dot.dataset.i, 10));
  resetTestiAuto();
}));
startTestiAuto();

/* ============================================
   CONTACT FORM VALIDATION (client-side only)
   ============================================ */
const form = document.getElementById('quoteForm');
const formMsg = document.getElementById('formMsg');
const kenyanPhone = /^(?:\+254|0)(7|1)\d{8}$/;

function setInvalid(fieldId, invalid){
  document.getElementById(fieldId).classList.toggle('invalid', invalid);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formMsg.classList.remove('show');

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim().replace(/\s+/g, '');
  const service = document.getElementById('service').value;
  const message = document.getElementById('message').value.trim();

  let valid = true;
  if (name.length < 2) { setInvalid('f-name', true); valid = false; } else setInvalid('f-name', false);
  if (!kenyanPhone.test(phone)) { setInvalid('f-phone', true); valid = false; } else setInvalid('f-phone', false);
  if (!service) { setInvalid('f-service', true); valid = false; } else setInvalid('f-service', false);
  if (message.length < 5) { setInvalid('f-message', true); valid = false; } else setInvalid('f-message', false);

  if (!valid) {
    form.querySelector('.invalid input, .invalid select, .invalid textarea')?.focus();
    return;
  }

  // No backend is connected in this static build — this hands the enquiry to WhatsApp
  // so it reaches the team immediately. Swap this block for a real form submission
  // once a backend / form endpoint is available.
  formMsg.classList.add('show');
  form.reset();

  const waText = `New quote request from the website\nName: ${name}\nPhone: ${phone}\nService: ${service}\nMessage: ${message}`;
  const waUrl = `https://wa.me/254726117905?text=${encodeURIComponent(waText)}`;
  setTimeout(() => window.open(waUrl, '_blank', 'noopener'), 900);
});

/* ============================================
   REVEAL ON SCROLL
   ============================================ */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

/* ============================================
   FOOTER YEAR
   ============================================ */
document.getElementById('year').textContent = new Date().getFullYear();
