// ===== NAV SCROLL EFFECT =====
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.style.padding = '12px 0';
  } else {
    nav.style.padding = '20px 0';
  }
});

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll(
  '.feature-card, .compare-row, .section-label, .section-title, .download-text, .download-card'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '0';
      entry.target.style.transform = 'translateY(32px)';
      entry.target.style.transition = `opacity 0.6s ease ${i * 0.07}s, transform 0.6s ease ${i * 0.07}s`;

      requestAnimationFrame(() => {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 50);
      });

      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => {
  el.style.opacity = '0';
  revealObserver.observe(el);
});

// ===== STAT COUNTER ANIMATION =====
function animateValue(el, start, end, duration, symbol = '') {
  const startTime = performance.now();
  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * eased);
    el.textContent = current + symbol;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNums = document.querySelectorAll('.stat-num');
      statNums.forEach(el => {
        const text = el.textContent;
        if (text === '0') animateValue(el, 10, 0, 1000);
        if (text === '∞') return;
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ===== PHONE SCREEN ANIMATION =====
const sets = document.querySelectorAll('.set-row');
let currentSet = 0;

setInterval(() => {
  sets.forEach(s => s.classList.remove('active'));
  if (sets[currentSet]) {
    sets[currentSet].classList.add('active');
    const check = sets[currentSet].querySelector('.set-check');
    if (check && check.classList.contains('pending')) {
      setTimeout(() => {
        check.classList.remove('pending');
        check.textContent = '✓';
      }, 600);
    }
  }
  currentSet = (currentSet + 1) % sets.length;
}, 2000);

// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
