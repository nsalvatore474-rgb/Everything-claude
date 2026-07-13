(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav scroll state + mobile toggle ---------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const onScrollNav = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Progress bar ---------- */
  const progressBar = document.getElementById('progressBar');
  const onScrollProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    progressBar.style.width = height > 0 ? `${(scrolled / height) * 100}%` : '0%';
  };
  onScrollProgress();
  window.addEventListener('scroll', onScrollProgress, { passive: true });

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');
  const onScrollBackTop = () => backToTop.classList.toggle('is-visible', window.scrollY > 600);
  onScrollBackTop();
  window.addEventListener('scroll', onScrollBackTop, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  /* ---------- Custom cursor ---------- */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover && dot && ring) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateRing);
    };
    requestAnimationFrame(animateRing);

    document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
    document.querySelectorAll('[data-cursor="view"]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-view'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-view'));
    });
  } else {
    dot?.remove();
    ring?.remove();
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-up');
  if (reducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.stat__num');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    if (reducedMotion) el.textContent = target;
    else requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const counterIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => counterIo.observe(el));
  } else {
    counters.forEach(el => (el.textContent = el.dataset.count));
  }

  /* ---------- Testimonial slider ---------- */
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');
  if (track && dotsWrap) {
    const slides = Array.from(track.children);
    let current = 0;
    let autoplayTimer;

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      if (i === 0) b.classList.add('is-active');
      b.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(index, userInitiated) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
      if (userInitiated) restartAutoplay();
    }

    function restartAutoplay() {
      clearInterval(autoplayTimer);
      if (!reducedMotion) {
        autoplayTimer = setInterval(() => goTo(current + 1), 5500);
      }
    }
    restartAutoplay();
  }

  /* ---------- CTA form (client-side only demo) ---------- */
  const ctaForm = document.getElementById('ctaForm');
  const ctaNote = document.getElementById('ctaNote');
  if (ctaForm) {
    ctaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      ctaNote.textContent = 'Thanks! We\'ll be in touch within one business day.';
      ctaNote.classList.add('is-success');
      ctaForm.reset();
    });
  }
})();
