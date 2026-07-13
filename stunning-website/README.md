# LUME — Digital Design Studio

A single-page, animated landing page for a fictional digital design studio. Built with plain HTML, CSS, and JavaScript — no build step or dependencies required.

## Highlights

- Dark, gradient-driven visual style (violet → pink → amber) with a floating animated mesh hero
- Custom cursor with hover/view states on interactive elements (desktop only)
- Scroll-triggered reveal animations, animated stat counters, and an infinite logo marquee
- Auto-playing testimonial slider with dot navigation
- Fully responsive with a slide-in mobile nav
- Respects `prefers-reduced-motion` throughout

## Structure

- `index.html` — page markup (nav, hero, marquee, work, stats, services, process, testimonials, CTA, footer)
- `css/style.css` — all styling, driven by CSS custom properties at the top of the file
- `js/main.js` — nav/scroll behavior, custom cursor, scroll reveals, counters, testimonial slider, demo form handling

## Running locally

Just open `index.html` in a browser, or serve the folder:

```bash
cd stunning-website
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Customizing

- Update studio name, copy, and project details directly in `index.html`.
- Work-section thumbnails use inline SVG shapes over CSS gradients — swap `.work-card__media` backgrounds and `.work-card__art` shapes for real project imagery.
- Adjust the palette, fonts, radii, and easing via the CSS variables at the top of `css/style.css`.
- The contact form shows a success message on submit but doesn't send data anywhere — wire it up to a backend or form service (e.g. Formspree) to make it functional.
