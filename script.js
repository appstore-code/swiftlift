/**
 * SwiftLift — script.js
 * Refactored per Emil Kowalski design-engineering principles:
 * - Strong ease-out on all JS-driven transitions
 * - Compound entrance (scale 0.95 → 1, never from 0)
 * - Spring-like check completion via classList sequencing
 * - Skip-delay logic: observer fires immediately on threshold
 * - GPU-safe: only transform + opacity mutations
 */

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
const DUR_SLOW = '600ms';

// ===== NAV SCROLL — precise padding transition =====
const nav = document.querySelector('.nav');
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      // Use transform-safe padding change (no "all")
      nav.style.padding = window.scrollY > 60 ? '12px 0' : '20px 0';
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ===== SCROLL REVEAL — Emil Compound Entrance =====
// Elements animate from scale(0.95) translateY(24px), never from scale(0)
const revealEls = document.querySelectorAll(
  '.feature-card, .compare-row, .section-label, .section-title, .download-text, .download-card'
);

// Pre-hide all reveal elements
revealEls.forEach(el => el.classList.add('reveal-hidden'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    // Emil: stagger delay — but cap it so late items don't drag
    const delay = Math.min(i * 60, 240);

    // Apply reveal-visible with staggered delay inline
    el.style.transitionDelay = `${delay}ms`;
    el.style.transition = `opacity ${DUR_SLOW} ${EASE}, transform ${DUR_SLOW} ${EASE}`;

    // Double rAF ensures class applies after transition is set
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.remove('reveal-hidden');
        el.classList.add('reveal-visible');
      });
    });

    revealObserver.unobserve(el);
  });
}, {
  threshold: 0.08, // Emil: fire early — skip-delay philosophy
  rootMargin: '0px 0px -32px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

// ===== STAT COUNTER — eased number animation =====
// Emil easing applied via cubic approximation in JS
function easedCounter(el, from, to, duration) {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    // Approximate --ease cubic-bezier(0.23, 1, 0.32, 1)
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.stat-num').forEach(el => {
      if (el.textContent === '0') easedCounter(el, 12, 0, 900);
    });
    statsObserver.disconnect();
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ===== PHONE SCREEN ANIMATION — Spring check completion =====
// Emil: spring pop via addClass → setTimeout → removeClass
const sets = document.querySelectorAll('.set-row');
let currentSet = 0;
let phoneInterval = null;

function advanceSet() {
  sets.forEach(s => s.classList.remove('active'));

  const row = sets[currentSet];
  if (!row) return;

  row.classList.add('active');

  const check = row.querySelector('.set-check');
  if (check && check.classList.contains('pending')) {
    // Emil: micro spring — scale up then settle
    setTimeout(() => {
      check.classList.add('completing');
      setTimeout(() => {
        check.classList.remove('pending', 'completing');
        check.textContent = '✓';
      }, 200);
    }, 500);
  }

  currentSet = (currentSet + 1) % sets.length;
}

// Only animate when phone is visible (perf)
const phoneObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (!phoneInterval) phoneInterval = setInterval(advanceSet, 2200);
    } else {
      clearInterval(phoneInterval);
      phoneInterval = null;
    }
  });
}, { threshold: 0.3 });

const heroPhone = document.querySelector('.hero-phone');
if (heroPhone) phoneObserver.observe(heroPhone);

// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== FEATURE CARD — Skip-delay hover (CSS handles it, JS guard) =====
// Ensures no accidental transition-delay leaks from scroll-reveal onto cards
document.querySelectorAll('.feature-card').forEach(card => {
  // Once revealed, clear the stagger delay so hover is instant (skip-delay)
  card.addEventListener('transitionend', () => {
    card.style.transitionDelay = '0ms';
  }, { once: true });
});
