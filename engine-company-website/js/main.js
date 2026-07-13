/* =========================================================
   VULCAN — Interactions
   Lenis smooth scroll, GSAP reveals, nav, click-glow, product
   catalog + filtering + detail modal + compare, testimonials,
   FAQ, contact form, animated counters.
   ========================================================= */

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------
   Smooth scroll (Lenis) + GSAP ScrollTrigger sync
--------------------------------------------------------- */
let lenis = null;
if (window.Lenis && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, easing: (t) => 1 - Math.pow(1 - t, 3) });
  lenis.on('scroll', () => ScrollTrigger && ScrollTrigger.update());
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  if (gsap) gsap.ticker.add((time) => lenis.raf(time * 1000));
}

/* ---------------------------------------------------------
   Loader
--------------------------------------------------------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader && loader.classList.add('is-hidden'), 500);
});

/* ---------------------------------------------------------
   Navbar: scrolled state + active section + mobile menu
--------------------------------------------------------- */
const navbar = document.getElementById('navbar');
const burger = document.getElementById('burger');
const navLinks = document.querySelectorAll('.navbar__link');
const sections = ['home', 'about', 'products', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);

function onScrollNav() {
  navbar.classList.toggle('is-scrolled', window.scrollY > 40);
  let current = sections[0]?.id;
  const probe = window.scrollY + window.innerHeight * 0.35;
  sections.forEach((sec) => { if (sec.offsetTop <= probe) current = sec.id; });
  navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.section === current));
}
window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();

burger?.addEventListener('click', () => {
  const open = navbar.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
});
navLinks.forEach((link) => link.addEventListener('click', () => {
  navbar.classList.remove('is-open');
  burger?.classList.remove('is-open');
}));

/* ---------------------------------------------------------
   Cursor glow (desktop only)
--------------------------------------------------------- */
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
  window.addEventListener('pointermove', (e) => {
    cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });
}

/* ---------------------------------------------------------
   Click glow — any [data-glow] element emits a soft radial pulse
--------------------------------------------------------- */
const glowLayer = document.getElementById('glowLayer');
const GLOW_COLORS = ['#2dd4ff', '#f5a623', '#f4f6f8'];
let glowIndex = 0;
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-glow]');
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const dot = document.createElement('span');
  dot.className = 'click-glow';
  dot.style.left = `${rect.left + rect.width / 2}px`;
  dot.style.top = `${rect.top + rect.height / 2}px`;
  dot.style.color = GLOW_COLORS[glowIndex % GLOW_COLORS.length];
  glowIndex++;
  glowLayer.appendChild(dot);
  dot.addEventListener('animationend', () => dot.remove());
});

/* ---------------------------------------------------------
   Reveal-on-scroll (IntersectionObserver)
--------------------------------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

function observeReveals(root = document) {
  root.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => revealObserver.observe(el));
}
observeReveals();

/* ---------------------------------------------------------
   Feature card tilt + click-to-expand
--------------------------------------------------------- */
document.querySelectorAll('[data-tilt]').forEach((card) => {
  revealObserver.observe(card);
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--rx', `${px * 10}deg`);
    card.style.setProperty('--ry', `${-py * 10}deg`);
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
  card.addEventListener('click', () => card.classList.toggle('is-open'));
});

/* ---------------------------------------------------------
   Animated stat counters
--------------------------------------------------------- */
const counters = document.querySelectorAll('.stat__num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach((c) => counterObserver.observe(c));

/* ---------------------------------------------------------
   Product catalog data
--------------------------------------------------------- */
const PRODUCTS = [
  {
    id: 'titan', name: 'Vulcan V8 TITAN', cat: 'performance', catLabel: 'Performance', extraCat: 'automotive',
    hp: 720, torque: '650 lb-ft', fuel: 'Gasoline (E85 capable)', applications: 'Supercars, track cars',
    availability: 'In Stock', status: 'instock', price: '$68,500', rating: 4.9, reviews: 214,
    features: ['Twin-turbo billet block', 'Dry-sump lubrication', 'Forged titanium rods', 'Active exhaust valves', 'Track-tuned ECU mapping', '3-year performance warranty'],
    chart: [82, 91, 96, 88, 100, 94],
    chartLabels: ['Power', 'Efficiency', 'Response', 'Durability', 'Sound', 'Cooling'],
  },
  {
    id: 'forge', name: 'Vulcan I6 FORGE', cat: 'industrial', catLabel: 'Industrial', extraCat: 'industrial',
    hp: 450, torque: '900 lb-ft', fuel: 'Diesel', applications: 'Generators, industrial plants',
    availability: 'Made to Order', status: 'order', price: 'Request Quote', rating: 4.8, reviews: 132,
    features: ['Continuous-duty rated', 'Common-rail injection', 'Redundant cooling loop', 'Remote telemetry ready', 'Low-vibration mounts', '5-year industrial warranty'],
    chart: [78, 96, 74, 98, 60, 90],
    chartLabels: ['Power', 'Efficiency', 'Response', 'Durability', 'Sound', 'Cooling'],
  },
  {
    id: 'trireme', name: 'Vulcan V12 TRIREME', cat: 'marine', catLabel: 'Marine', extraCat: 'marine',
    hp: 1200, torque: '1450 lb-ft', fuel: 'Marine Diesel', applications: 'Yachts, commercial vessels',
    availability: 'Limited', status: 'limited', price: 'Request Quote', rating: 4.9, reviews: 58,
    features: ['Corrosion-resistant alloy block', 'Twin turbochargers', 'Keel-cooled thermal system', 'Marine-grade wiring harness', 'Vibration-isolated mounts', '5-year marine warranty'],
    chart: [95, 84, 80, 92, 55, 88],
    chartLabels: ['Power', 'Efficiency', 'Response', 'Durability', 'Sound', 'Cooling'],
  },
  {
    id: 'colossus', name: 'Vulcan V8 COLOSSUS', cat: 'heavy-duty', catLabel: 'Heavy Duty', extraCat: 'heavy-duty',
    hp: 600, torque: '1850 lb-ft', fuel: 'Diesel', applications: 'Trucks, construction equipment',
    availability: 'In Stock', status: 'instock', price: '$54,900', rating: 4.8, reviews: 176,
    features: ['Reinforced cast-iron block', 'Heavy-duty timing gears', 'Engine brake compatible', 'Extended service intervals', 'High-capacity oil cooling', '5-year / 500k-mile warranty'],
    chart: [88, 90, 70, 99, 58, 92],
    chartLabels: ['Power', 'Efficiency', 'Response', 'Durability', 'Sound', 'Cooling'],
  },
  {
    id: 'harvest', name: 'Vulcan I4 HARVEST', cat: 'agricultural', catLabel: 'Agricultural', extraCat: 'agricultural',
    hp: 340, torque: '780 lb-ft', fuel: 'Diesel', applications: 'Tractors, combines',
    availability: 'In Stock', status: 'instock', price: '$31,200', rating: 4.7, reviews: 94,
    features: ['Dust-sealed intake system', 'PTO-optimized torque curve', 'Field-serviceable filters', 'Cold-start assist', 'Reinforced sump guard', '4-year agricultural warranty'],
    chart: [70, 92, 76, 95, 62, 85],
    chartLabels: ['Power', 'Efficiency', 'Response', 'Durability', 'Sound', 'Cooling'],
  },
  {
    id: 'phantom', name: 'Vulcan V6 PHANTOM', cat: 'performance', catLabel: 'Performance', extraCat: 'automotive',
    hp: 550, torque: '520 lb-ft', fuel: 'Hybrid-Electric', applications: 'Sports sedans, GT coupes',
    availability: 'In Stock', status: 'instock', price: '$46,750', rating: 4.8, reviews: 141,
    features: ['Electric-assist turbo spool', '48V mild-hybrid boost', 'Regenerative deceleration', 'Cylinder deactivation', 'Adaptive sound tuning', '4-year powertrain warranty'],
    chart: [84, 97, 92, 90, 80, 89],
    chartLabels: ['Power', 'Efficiency', 'Response', 'Durability', 'Sound', 'Cooling'],
  },
];

const ENGINE_GLYPH = (color) => `
<svg class="engine-glyph" viewBox="0 0 100 100" fill="none">
  <rect x="24" y="34" width="52" height="34" rx="4" fill="#2a2d33" stroke="${color}" stroke-opacity="0.5"/>
  <rect x="30" y="18" width="40" height="20" rx="3" fill="#3a3d43"/>
  <rect x="34" y="10" width="14" height="10" rx="2" fill="${color}" fill-opacity="0.85"/>
  <rect x="52" y="10" width="14" height="10" rx="2" fill="${color}" fill-opacity="0.55"/>
  <circle cx="26" cy="78" r="10" fill="#1a1b1e" stroke="${color}" stroke-width="2"/>
  <circle cx="74" cy="78" r="10" fill="#1a1b1e" stroke="${color}" stroke-width="2"/>
  <rect x="20" y="66" width="60" height="6" rx="3" fill="#141416"/>
  <circle cx="26" cy="78" r="3" fill="${color}"/>
  <circle cx="74" cy="78" r="3" fill="${color}"/>
</svg>`;

/* ---------------------------------------------------------
   Render product grid
--------------------------------------------------------- */
const productGrid = document.getElementById('productGrid');
const compareState = new Set();

function renderProducts() {
  productGrid.innerHTML = PRODUCTS.map((p) => `
    <article class="product-card" data-cat="${p.cat} ${p.extraCat}" data-id="${p.id}" data-glow>
      <div class="product-card__media">
        <span class="product-card__badge status-${p.status}">${p.availability}</span>
        ${ENGINE_GLYPH(p.status === 'instock' ? '#2dd4ff' : p.status === 'limited' ? '#f5a623' : '#2dd4ff')}
      </div>
      <div class="product-card__body">
        <p class="product-card__cat">${p.catLabel}</p>
        <h3 class="product-card__name">${p.name}</h3>
        <div class="product-card__specs">
          <div class="product-card__spec"><b>${p.hp} HP</b><span>Power</span></div>
          <div class="product-card__spec"><b>${p.torque}</b><span>Torque</span></div>
          <div class="product-card__spec"><b>${p.fuel}</b><span>Fuel Type</span></div>
          <div class="product-card__spec"><b>${p.applications}</b><span>Applications</span></div>
        </div>
        <div class="product-card__rating">
          <span class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}</span>
          ${p.rating} (${p.reviews})
        </div>
        <div class="product-card__footer">
          <span class="product-card__price">${p.price}</span>
          <div class="product-card__actions">
            <button class="icon-btn" data-compare="${p.id}" data-glow title="Add to compare" aria-label="Add to compare">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M12 4v16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
            <button class="btn btn--primary btn--sm" data-view="${p.id}" data-glow>Buy Now</button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
  productGrid.querySelectorAll('.product-card').forEach((card) => revealObserver.observe(card));
}
renderProducts();

/* Filtering */
const filterChips = document.querySelectorAll('.filter-chip');
filterChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    filterChips.forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    const filter = chip.dataset.filter;
    document.querySelectorAll('.product-card').forEach((card) => {
      const cats = card.dataset.cat.split(' ');
      const show = filter === 'all' || cats.includes(filter);
      card.hidden = !show;
    });
  });
});

/* ---------------------------------------------------------
   Product detail modal
--------------------------------------------------------- */
const modal = document.getElementById('productModal');
const modalPanel = document.getElementById('modalPanel');

function openProductModal(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  modalPanel.innerHTML = `
    <button class="modal__close" data-close-modal aria-label="Close">&times;</button>
    <div class="modal__hero">${ENGINE_GLYPH('#2dd4ff')}</div>
    <div class="modal__body">
      <p class="modal__cat">${p.catLabel}</p>
      <h2 class="modal__title">${p.name}</h2>
      <div class="modal__spec-grid">
        <div class="modal__spec"><b>${p.hp} HP</b><span>Power</span></div>
        <div class="modal__spec"><b>${p.torque}</b><span>Torque</span></div>
        <div class="modal__spec"><b>${p.fuel}</b><span>Fuel Type</span></div>
        <div class="modal__spec"><b>${p.rating} ★</b><span>${p.reviews} Reviews</span></div>
      </div>

      <p class="modal__section-label">Performance Profile</p>
      <div class="modal__chart">
        ${p.chart.map((v, i) => `
          <div class="modal__chart-bar">
            <i style="height:${v}%; animation-delay:${i * 0.06}s"></i>
            <span>${p.chartLabels[i]}</span>
          </div>`).join('')}
      </div>

      <p class="modal__section-label">Feature Highlights</p>
      <ul class="modal__features">
        ${p.features.map((f) => `<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>${f}</li>`).join('')}
      </ul>

      <div class="modal__footer">
        <span class="modal__price">${p.price}</span>
        <div style="display:flex; gap:10px;">
          <button class="btn btn--ghost" data-compare="${p.id}" data-glow>Add to Compare</button>
          <a href="#contact" class="btn btn--primary glow-on-hover" data-close-modal data-glow>Buy Now</a>
        </div>
      </div>
    </div>
  `;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  const viewBtn = e.target.closest('[data-view]');
  if (viewBtn) { openProductModal(viewBtn.dataset.view); return; }

  const cardMedia = e.target.closest('.product-card');
  if (cardMedia && !e.target.closest('button')) { openProductModal(cardMedia.dataset.id); return; }

  if (e.target.closest('[data-close-modal]')) closeModal();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ---------------------------------------------------------
   Compare tray
--------------------------------------------------------- */
const compareTray = document.getElementById('compareTray');
const compareItems = document.getElementById('compareItems');
const compareClose = document.getElementById('compareClose');
const compareViewBtn = document.getElementById('compareViewBtn');
const compareToggle = document.getElementById('compareToggle');

function renderCompareTray() {
  compareItems.innerHTML = [...compareState].map((id) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return `<span class="compare-tray__chip">${p.name}</span>`;
  }).join('');
  compareTray.classList.toggle('is-visible', compareState.size > 0);
  compareTray.setAttribute('aria-hidden', String(compareState.size === 0));
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-compare]');
  if (!btn) return;
  const id = btn.dataset.compare;
  if (compareState.has(id)) {
    compareState.delete(id);
    btn.classList.remove('is-active');
  } else {
    if (compareState.size >= 3) { compareState.delete([...compareState][0]); }
    compareState.add(id);
    btn.classList.add('is-active');
  }
  renderCompareTray();
});

compareClose?.addEventListener('click', () => { compareState.clear(); document.querySelectorAll('[data-compare].is-active').forEach((b) => b.classList.remove('is-active')); renderCompareTray(); });

compareToggle?.addEventListener('click', () => {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});

compareViewBtn?.addEventListener('click', () => {
  if (compareState.size === 0) return;
  const items = [...compareState].map((id) => PRODUCTS.find((x) => x.id === id));
  modalPanel.innerHTML = `
    <button class="modal__close" data-close-modal aria-label="Close">&times;</button>
    <div class="modal__body" style="padding-top: 60px;">
      <h2 class="modal__title" style="margin-bottom:24px;">Engine Comparison</h2>
      <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; min-width:480px;">
        <thead><tr>
          <th style="text-align:left; padding:10px; color:var(--text-tertiary); font-size:0.78rem; text-transform:uppercase;">Spec</th>
          ${items.map((p) => `<th style="text-align:left; padding:10px; font-family:var(--font-display);">${p.name}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${['hp', 'torque', 'fuel', 'applications', 'availability', 'price'].map((key) => `
            <tr style="border-top:1px solid var(--border-soft);">
              <td style="padding:12px 10px; color:var(--text-tertiary); text-transform:capitalize;">${key}</td>
              ${items.map((p) => `<td style="padding:12px 10px;">${key === 'hp' ? p.hp + ' HP' : p[key]}</td>`).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
      </div>
    </div>
  `;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
});

/* ---------------------------------------------------------
   Testimonials
--------------------------------------------------------- */
const TESTIMONIALS = [
  { name: 'Marcus Whitfield', role: 'Fleet Director, Whitfield Logistics', quote: 'The COLOSSUS engines have run 400,000+ miles across our fleet with zero major failures. VULCAN’s support team treats every ticket like an emergency.', initials: 'MW' },
  { name: 'Elena Reyes', role: 'Team Principal, Reyes Motorsport', quote: 'We switched our GT program to the TITAN block and shaved four tenths off our lap time in one season. The response off throttle is unreal.', initials: 'ER' },
  { name: 'Captain Dae-ho Lim', role: 'Chief Engineer, Pacific Marine Charters', quote: 'Salt water, 300 days a year, full throttle. The TRIREME hasn’t missed a beat in three seasons. That’s the whole review.', initials: 'DL' },
];
document.getElementById('testimonialTrack').innerHTML = TESTIMONIALS.map((t) => `
  <div class="testimonial-card" data-glow>
    <div class="stars">★★★★★</div>
    <p class="quote">“${t.quote}”</p>
    <div class="person">
      <span class="avatar">${t.initials}</span>
      <div><b>${t.name}</b><span>${t.role}</span></div>
    </div>
  </div>
`).join('');

/* ---------------------------------------------------------
   FAQ
--------------------------------------------------------- */
const FAQS = [
  { q: 'What warranty comes standard with a VULCAN engine?', a: 'Every engine ships with a baseline 3-year / unlimited-mile warranty; industrial and heavy-duty platforms extend to 5 years or 500,000 miles. Extended coverage plans are available at checkout.' },
  { q: 'What are current lead times?', a: 'In-stock platforms ship within 5–10 business days. Made-to-order and limited-run engines typically take 6–10 weeks depending on configuration and current production volume.' },
  { q: 'Can an engine be customized for my application?', a: 'Yes — our engineering team supports custom ECU mapping, mounting configurations, cooling solutions, and emissions certifications for regional compliance.' },
  { q: 'Do you ship internationally?', a: 'We ship to 40+ countries with dedicated freight partners and customs handling. Contact our team for a landed-cost quote to your region.' },
  { q: 'Is financing available?', a: 'We offer commercial financing and leasing programs through our lending partners for qualified fleet, marine, and industrial buyers.' },
  { q: 'What ongoing support is included?', a: 'All customers get access to our 24/7 technical hotline, remote diagnostics enrollment, and a certified service network for scheduled maintenance.' },
];
document.getElementById('faqList').innerHTML = FAQS.map((f, i) => `
  <div class="faq-item">
    <button class="faq-item__q" data-faq="${i}">
      <span>${f.q}</span><span class="plus">+</span>
    </button>
    <div class="faq-item__a"><p>${f.a}</p></div>
  </div>
`).join('');
document.querySelectorAll('.faq-item__q').forEach((btn) => {
  btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('is-open'));
});

/* ---------------------------------------------------------
   Contact form
--------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;
  ['fName', 'fEmail', 'fMessage'].forEach((id) => {
    const input = document.getElementById(id);
    const field = input.closest('.field');
    const ok = id === 'fEmail' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value) : input.value.trim().length > 0;
    field.classList.toggle('is-invalid', !ok);
    if (!ok) valid = false;
  });
  if (!valid) return;

  submitBtn.classList.add('is-loading');
  submitBtn.disabled = true;
  window.__vulcanEnginePulse && window.__vulcanEnginePulse();

  setTimeout(() => {
    submitBtn.classList.remove('is-loading');
    submitBtn.disabled = false;
    formSuccess.classList.add('is-visible');
    contactForm.reset();
    setTimeout(() => formSuccess.classList.remove('is-visible'), 5000);
  }, 1300);
});

document.getElementById('directionsBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.open('https://www.google.com/maps/dir/?api=1&destination=4200+Forge+Way+Detroit+MI', '_blank', 'noopener');
});

/* ---------------------------------------------------------
   Footer year
--------------------------------------------------------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------------------------------------------------------
   Refresh ScrollTrigger after dynamic content renders
--------------------------------------------------------- */
if (ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
