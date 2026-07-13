/*
 * Urbanglow.ng — site behaviour
 * Reads PRODUCTS / COLLECTIONS from products.js (loaded first).
 * No backend: the cart lives in sessionStorage and checkout hands
 * off to WhatsApp with a pre-filled order message.
 */

const WHATSAPP_NUMBER = '2348064141612';
const CART_STORAGE_KEY = 'urbanglow-cart';

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function formatPrice(amount) {
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function findCollection(slug) {
  return COLLECTIONS.find((c) => c.slug === slug);
}

/* Image errors don't bubble, so we listen with the capture phase
   on a container and let any broken <img> fall back to the
   gradient + name placeholder that's already sitting behind it. */
function attachImageFallback(container) {
  container.addEventListener(
    'error',
    (e) => {
      if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
      }
    },
    true
  );
}

/* ---------------------------------------------------------
   Cart state
--------------------------------------------------------- */

let cart = loadCart();

function loadCart() {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCart() {
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function cartItemCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function cartSubtotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = findProduct(id);
    return product ? sum + product.price * qty : sum;
  }, 0);
}

function addToCart(id, qty = 1) {
  cart[id] = (cart[id] || 0) + qty;
  saveCart();
  renderCart();
  const product = findProduct(id);
  if (product) showToast(`Added "${product.name}" to cart`);
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

/* ---------------------------------------------------------
   Product card rendering
--------------------------------------------------------- */

function productCardHTML(product) {
  const collection = findCollection(product.collection);
  const hasSale = typeof product.oldPrice === 'number' && product.oldPrice > product.price;

  return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-image">
        ${hasSale ? '<span class="product-badge">Sale</span>' : ''}
        <div class="product-image-fallback">${product.name}</div>
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-collection">${collection ? collection.name : ''}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-price-row">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${hasSale ? `<span class="price-old">${formatPrice(product.oldPrice)}</span>` : ''}
        </div>
        <button class="add-to-cart-btn" data-add="${product.id}">Add to Cart</button>
      </div>
    </article>
  `;
}

function renderProductGrid(container, products) {
  if (!products.length) {
    container.innerHTML = '<p class="empty-state">No products found in this collection yet.</p>';
    return;
  }
  container.innerHTML = products.map(productCardHTML).join('');
}

/* ---------------------------------------------------------
   Collections
--------------------------------------------------------- */

function renderCollections() {
  const grid = document.getElementById('collectionsGrid');
  grid.innerHTML = COLLECTIONS.map(
    (c) => `
      <div class="collection-card" data-collection="${c.slug}">
        <div class="collection-thumb">${c.name.charAt(0)}</div>
        <h3>${c.name}</h3>
        <p>${c.description}</p>
      </div>
    `
  ).join('');

  grid.querySelectorAll('.collection-card').forEach((card) => {
    card.addEventListener('click', () => {
      goToShopWithFilter(card.dataset.collection);
    });
  });
}

function renderFilterButtons() {
  const group = document.getElementById('filterGroup');
  const extra = COLLECTIONS.map(
    (c) => `<button class="filter-btn" data-filter="${c.slug}">${c.name}</button>`
  ).join('');
  group.insertAdjacentHTML('beforeend', extra);

  group.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => setActiveFilter(btn.dataset.filter));
  });
}

function setActiveFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderShop();
}

function goToShopWithFilter(slug) {
  setActiveFilter(slug);
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
}

/* ---------------------------------------------------------
   Featured products
--------------------------------------------------------- */

function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  const featured = PRODUCTS.filter((p) => p.featured);
  renderProductGrid(grid, featured);
}

/* ---------------------------------------------------------
   Shop grid: filter + sort
--------------------------------------------------------- */

let currentFilter = 'all';

function renderShop() {
  const grid = document.getElementById('shopGrid');
  const sortValue = document.getElementById('sortSelect').value;

  let list = currentFilter === 'all' ? [...PRODUCTS] : PRODUCTS.filter((p) => p.collection === currentFilter);

  if (sortValue === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sortValue === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (sortValue === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));

  renderProductGrid(grid, list);
}

/* ---------------------------------------------------------
   Cart drawer rendering
--------------------------------------------------------- */

function cartItemHTML(id, qty) {
  const product = findProduct(id);
  if (!product) return '';
  return `
    <div class="cart-item" data-id="${id}">
      <div class="cart-item-thumb">
        <span class="fallback-initial">${product.name.charAt(0)}</span>
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div>
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-price">${formatPrice(product.price)} &times; ${qty}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-decrease="${id}" aria-label="Decrease quantity">&minus;</button>
          <span>${qty}</span>
          <button class="qty-btn" data-increase="${id}" aria-label="Increase quantity">&plus;</button>
        </div>
      </div>
      <button class="cart-item-remove" data-remove="${id}">Remove</button>
    </div>
  `;
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const entries = Object.entries(cart);

  if (!entries.length) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. Start adding some glow ✨</p>';
  } else {
    itemsEl.innerHTML = entries.map(([id, qty]) => cartItemHTML(id, qty)).join('');
  }

  document.getElementById('cartCount').textContent = cartItemCount();
  document.getElementById('cartSubtotal').textContent = formatPrice(cartSubtotal());
}

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

/* ---------------------------------------------------------
   Toast
--------------------------------------------------------- */

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}

/* ---------------------------------------------------------
   WhatsApp checkout
--------------------------------------------------------- */

function buildWhatsAppMessage() {
  const entries = Object.entries(cart);
  const lines = entries.map(([id, qty]) => {
    const product = findProduct(id);
    if (!product) return '';
    return `${qty}x ${product.name} (${formatPrice(product.price * qty)})`;
  });

  const name = document.getElementById('checkoutName').value.trim() || '___';
  const address = document.getElementById('checkoutAddress').value.trim() || '___';

  const message =
    `Hello Urbanglow, I'd like to order: ${lines.join(', ')}. ` +
    `Total: ${formatPrice(cartSubtotal())}. ` +
    `Name: ${name} | Delivery address: ${address}`;

  return message;
}

function checkoutOnWhatsApp() {
  if (!Object.keys(cart).length) {
    showToast('Your cart is empty');
    return;
  }
  const message = buildWhatsAppMessage();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
}

/* ---------------------------------------------------------
   Event wiring
--------------------------------------------------------- */

function initEventDelegation() {
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      addToCart(addBtn.dataset.add);
      return;
    }
    const incBtn = e.target.closest('[data-increase]');
    if (incBtn) {
      changeQty(incBtn.dataset.increase, 1);
      return;
    }
    const decBtn = e.target.closest('[data-decrease]');
    if (decBtn) {
      changeQty(decBtn.dataset.decrease, -1);
      return;
    }
    const removeBtn = e.target.closest('[data-remove]');
    if (removeBtn) {
      removeFromCart(removeBtn.dataset.remove);
      return;
    }
  });
}

function initCartDrawer() {
  document.getElementById('cartToggle').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('checkoutBtn').addEventListener('click', checkoutOnWhatsApp);
}

function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

function initSort() {
  document.getElementById('sortSelect').addEventListener('change', renderShop);
}

/* ---------------------------------------------------------
   Init
--------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  renderCollections();
  renderFilterButtons();
  renderFeatured();
  renderShop();
  renderCart();

  attachImageFallback(document.getElementById('featuredGrid'));
  attachImageFallback(document.getElementById('shopGrid'));
  attachImageFallback(document.getElementById('cartItems'));

  initEventDelegation();
  initCartDrawer();
  initMobileNav();
  initSort();

  document.getElementById('year').textContent = new Date().getFullYear();
});
