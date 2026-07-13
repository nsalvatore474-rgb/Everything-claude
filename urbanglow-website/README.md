# Urbanglow.ng

A clean, mobile-first e-commerce site for **Urbanglow.ng**, a skincare brand in Warri, Delta State, Nigeria. Built with plain HTML, CSS, and vanilla JavaScript — no build step, no framework, no backend. The cart is client-side and checkout hands off to WhatsApp.

## Files

```
urbanglow-website/
├── index.html      Page markup (hero, collections, shop, cart drawer, about, contact, footer)
├── styles.css       All styling (cream + rose-gold palette, responsive layout)
├── script.js        Cart logic, product rendering, filters/sort, WhatsApp checkout
├── products.js       ← Product & collection data — edit this file to manage the catalog
└── images/products/  Where product photos go (see "Adding real images" below)
```

## Editing products & collections

Everything shown on the site — the featured grid, the shop grid, the collection cards, the filter buttons — is generated from `products.js`. You never need to touch the HTML to add or change a product.

Open `products.js` and edit the `PRODUCTS` array. Each product looks like this:

```js
{
  id: 'tiam-niacinamide-serum',       // unique slug — also the cart line-item key
  name: 'Tiam Niacinamide Serum',
  price: 15500,                        // current price in Naira, whole numbers
  oldPrice: 16000,                     // optional — adding this shows a struck-through sale price
  collection: 'serums',                // must match a slug in COLLECTIONS
  image: 'images/products/tiam-niacinamide-serum.jpg',
  description: 'A short one-line description.',
  featured: true,                      // optional — shows the product in the homepage "Featured Products" section
}
```

- **To add a product:** copy an existing object in the `PRODUCTS` array, give it a new `id`, and fill in the fields.
- **To remove a product:** delete its object from the array.
- **To put a product on sale:** add an `oldPrice` that's higher than `price`.
- **To feature a product on the homepage:** set `featured: true`.
- **To add a new collection** (beyond Serums, Treatments, Body Wash, Sunscreen): add an entry to the `COLLECTIONS` array at the top of `products.js` with a `slug`, `name`, and `description`, then use that `slug` on any product.

No other file needs to change — the shop grid, filter buttons, and collection cards rebuild themselves from these two arrays on page load.

## Swapping in real product images

Right now every product points at a placeholder path like `images/products/tiam-niacinamide-serum.jpg`. Those files don't exist yet — and that's fine. If an image is missing or fails to load, the product card automatically falls back to a soft gradient tile with the product's name, so the layout never breaks.

To add a real photo:

1. Create the `images/products/` folder if it doesn't exist.
2. Drop in a photo named to match the `image` path in `products.js` (e.g. `images/products/tiam-niacinamide-serum.jpg`).
3. Refresh the page — the real photo replaces the gradient placeholder automatically.

Recommended: square photos (1:1 aspect ratio), at least 800×800px, compressed as JPG or WebP for fast mobile loading.

The hero section and decorative shapes use pure CSS gradients (no image files), so the site looks polished even before you add any photos.

## Cart & WhatsApp checkout

- The cart is stored in the browser's `sessionStorage`, so it survives page navigation/reload within the same browser tab but clears when the tab is closed.
- "Checkout on WhatsApp" builds an order summary (items, quantities, subtotal, customer name and delivery address) and opens `https://wa.me/2348064141612?text=...` with the message pre-filled, ready for the customer to send.
- To change the WhatsApp number, edit `WHATSAPP_NUMBER` at the top of `script.js` (and update `contactWhatsapp`'s `href` and the JSON-LD `telephone` in `index.html`).

## Editing brand/contact details

Business name, address, phone number, hours, and social links live directly in `index.html` (the Header, Contact, and Footer sections) and in the `LocalBusiness` JSON-LD block in `<head>`. Update those in one pass if the business details change.

## Running locally

No build step needed — just open `index.html` in a browser, or serve the folder locally for the most accurate experience (some browsers restrict `fetch`/module behavior on `file://`, though this site doesn't use either):

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deploying

### Netlify
1. Push this folder to a GitHub repo (or drag-and-drop the folder into the Netlify dashboard).
2. New site from Git → select the repo → set the **base directory** to `urbanglow-website` (if it's part of a larger repo) → no build command → publish directory `.`.
3. Deploy.

### Vercel
1. Import the GitHub repo in the Vercel dashboard.
2. Set the **root directory** to `urbanglow-website`.
3. Framework preset: "Other" (no build step). Deploy.

### GitHub Pages
1. Push this folder to a repo.
2. In repo Settings → Pages, set the source to the branch/folder containing `index.html` (use a `docs/` folder or the repo root, per GitHub Pages' requirements — you may need to move `urbanglow-website/*` to the repo root or to `docs/`).
3. Save — the site publishes at `https://<username>.github.io/<repo>/`.

## SEO

`index.html` includes a descriptive `<title>`, meta description, Open Graph tags, and `Store`/`LocalBusiness` JSON-LD structured data with the business name, address, phone number, and opening hours — update these alongside the contact details if they change.
