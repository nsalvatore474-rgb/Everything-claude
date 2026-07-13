# VULCAN — Premium 3D Engine Company Landing Page

A cinematic, dark-luxury landing page for a fictional engine manufacturer,
built around a procedurally generated 3D engine model that rotates, breathes,
and reacts to scroll and mouse movement.

## Stack

- **Three.js** — procedural V-engine (block, pistons, crankshaft, fan, belt,
  headers) built entirely from primitives, no external `.glb`/texture
  assets. Postprocessing bloom (`UnrealBloomPass`) drives the glowing
  energy-flow look on the valve covers and headers.
- **GSAP + ScrollTrigger** — available for section-level animation hooks.
- **Lenis** — smooth inertial scrolling.
- **Vanilla JS / CSS** — everything else (nav, reveals, filtering, modals,
  forms, click-glow) is dependency-free for speed and simplicity.

All three libraries are **vendored locally** under `vendor/` (pulled from npm,
not loaded from a CDN), so the site runs fully offline / behind restrictive
network policies. Google Fonts (Space Grotesk, Manrope) are loaded from the
standard CDN with system-font fallbacks if that's blocked.

## Running locally

No build step. Serve the folder statically and open it:

```bash
cd engine-company-website
python3 -m http.server 8080
# then open http://localhost:8080
```

(Opening `index.html` directly via `file://` also mostly works, but ES module
`import` resolution is more reliable over `http://`.)

## Structure

```
engine-company-website/
├── index.html          # all sections: hero, about, products, testimonials, FAQ, contact
├── css/style.css        # design tokens, layout, components, responsive rules
├── js/engine3d.js        # Three.js scene: engine build, lighting, bloom, particles, scroll/mouse reactivity
├── js/main.js             # Lenis/GSAP init, nav, click-glow, product catalog + filter + modal + compare,
│                           testimonials, FAQ accordion, contact form, animated counters
└── vendor/                # locally vendored three.js, gsap, lenis builds
```

## Notable implementation details

- The engine canvas is a single `position: fixed` layer behind the page.
  Its rotation/position/scale are driven by scroll progress across the
  hero + about sections (drifts from center to the right, shrinks, then
  fades out before the products section) and by pointer position (subtle
  parallax + reflections via a mouse-follow point light).
- Every `[data-glow]` element (nav links, buttons, cards, icons) emits a
  soft radial pulse in electric blue / amber / white on click, cycling
  through the palette.
- Product data, testimonials, and FAQ content are defined as small JS arrays
  in `main.js` and rendered client-side — swap in real copy/imagery there.
- The product "performance graph" and comparison table are generated from
  the same data, no separate charting library.

## Known limitations

- The 3D engine is a stylised procedural model (primitives + emissive
  materials), not a licensed CAD/GLB asset — swap in a real model via
  `GLTFLoader` in `engine3d.js` for a production launch.
- Product imagery uses a procedural inline-SVG glyph instead of photography;
  replace `ENGINE_GLYPH()` output in `main.js` with real `<img>` tags.
- The contact form and "Buy Now" flow are front-end only (simulated submit);
  wire `contactForm`'s submit handler in `main.js` to a real backend/CRM.
