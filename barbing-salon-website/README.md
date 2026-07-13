# Sharp Fade Barbershop — Mini Website

A single-page, responsive website for a barbing salon. Built with plain HTML, CSS, and JavaScript — no build step or dependencies required.

## Structure

- `index.html` — page markup (hero, about, services, gallery, testimonials, booking form, footer)
- `css/style.css` — styling (dark theme with gold accents, responsive layout)
- `js/script.js` — mobile nav toggle, booking form demo submission, dynamic footer year
- `images/` — placeholder SVG illustrations (swap with real photos as needed)

## Running locally

Just open `index.html` in a browser, or serve the folder:

```bash
cd barbing-salon-website
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Customizing

- Update shop name, hours, address, and contact info directly in `index.html`.
- Replace the SVGs in `images/` with real photos of the shop and staff.
- Adjust colors/fonts via the CSS variables at the top of `css/style.css`.
- The booking form currently shows a success message on submit but doesn't send data anywhere — wire it up to a backend, form service (e.g. Formspree), or email API to make it functional.
