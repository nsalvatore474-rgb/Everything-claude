/*
 * Urbanglow.ng — product & collection data
 * ------------------------------------------------------------
 * This is the ONLY file you need to touch to add, remove, or edit
 * products and collections. Everything on the site (featured
 * products, collection cards, the shop grid, filters) is rendered
 * from the two arrays below.
 *
 * Product fields:
 *   id          unique slug, used as the cart line-item key
 *   name        display name
 *   price       current price in Naira (whole numbers, no decimals)
 *   oldPrice    optional — set this to show a struck-through sale price
 *   collection  must match a `slug` in COLLECTIONS below
 *   image       path to a product photo. It's fine if the file doesn't
 *               exist yet — the UI automatically falls back to a
 *               gradient placeholder with the product name so the
 *               layout never breaks. Swap in real photos any time.
 *   description short line shown on the product detail area
 *   featured    optional — true shows it in the homepage "Featured
 *               Products" section
 */

const COLLECTIONS = [
  {
    slug: 'serums',
    name: 'Serums',
    description: 'Targeted actives for glow, brightening & repair.',
  },
  {
    slug: 'treatments',
    name: 'Treatments',
    description: 'Masks, ampoules & overnight treatments.',
  },
  {
    slug: 'body-wash',
    name: 'Body Wash',
    description: 'Nourishing cleansers for soft, even-toned skin.',
  },
  {
    slug: 'sunscreen',
    name: 'Sunscreen',
    description: 'Broad-spectrum SPF to protect your glow, daily.',
  },
];

const PRODUCTS = [
  // ---------- Serums ----------
  {
    id: 'tiam-niacinamide-serum',
    name: 'Tiam Niacinamide Serum',
    price: 15500,
    oldPrice: 16000,
    collection: 'serums',
    image: 'images/products/tiam-niacinamide-serum.jpg',
    description: 'A lightweight brightening serum with 5% niacinamide to even out tone and refine the look of pores.',
    featured: true,
  },
  {
    id: 'vitamin-c-brightening-serum',
    name: 'Vitamin C Brightening Serum',
    price: 12000,
    collection: 'serums',
    image: 'images/products/vitamin-c-brightening-serum.jpg',
    description: 'Antioxidant-rich serum that fades dark spots and leaves skin visibly brighter.',
  },
  {
    id: 'hyaluronic-acid-hydra-serum',
    name: 'Hyaluronic Acid Hydra Serum',
    price: 9500,
    oldPrice: 11000,
    collection: 'serums',
    image: 'images/products/hyaluronic-acid-hydra-serum.jpg',
    description: 'Deeply hydrating serum that plumps skin and locks in moisture all day.',
  },
  {
    id: 'retinol-renewal-serum',
    name: 'Retinol Renewal Serum',
    price: 18000,
    collection: 'serums',
    image: 'images/products/retinol-renewal-serum.jpg',
    description: 'Gentle night-time retinol formula that smooths texture and supports cell renewal.',
  },

  // ---------- Treatments ----------
  {
    id: 'watermelon-glow-sleeping-mask',
    name: 'Watermelon Glow Sleeping Mask',
    price: 22000,
    collection: 'treatments',
    image: 'images/products/watermelon-glow-sleeping-mask.jpg',
    description: 'Overnight gel mask that hydrates and exfoliates for a dewy morning glow.',
    featured: true,
  },
  {
    id: 'snail-mucin-repair-cream',
    name: 'Snail Mucin Repair Cream',
    price: 13500,
    oldPrice: 15000,
    collection: 'treatments',
    image: 'images/products/snail-mucin-repair-cream.jpg',
    description: 'Soothing repair cream that calms irritation and strengthens the skin barrier.',
  },
  {
    id: 'clay-purifying-mask',
    name: 'Clay Purifying Mask',
    price: 8000,
    collection: 'treatments',
    image: 'images/products/clay-purifying-mask.jpg',
    description: 'Mineral-rich clay mask that draws out impurities and tightens the look of pores.',
  },
  {
    id: 'overnight-repair-ampoule',
    name: 'Overnight Repair Ampoule',
    price: 17500,
    collection: 'treatments',
    image: 'images/products/overnight-repair-ampoule.jpg',
    description: 'Concentrated ampoule that works while you sleep to restore a healthy glow.',
  },

  // ---------- Body Wash ----------
  {
    id: 'glutathione-brightening-body-wash',
    name: 'Glutathione Brightening Body Wash',
    price: 9000,
    collection: 'body-wash',
    image: 'images/products/glutathione-brightening-body-wash.jpg',
    description: 'Creamy body wash that gently brightens and evens out skin tone with every use.',
    featured: true,
  },
  {
    id: 'papaya-carrot-exfoliating-body-wash',
    name: 'Papaya & Carrot Exfoliating Body Wash',
    price: 8500,
    oldPrice: 9500,
    collection: 'body-wash',
    image: 'images/products/papaya-carrot-exfoliating-body-wash.jpg',
    description: 'Fruit-enzyme exfoliating wash that buffs away dullness for smoother skin.',
  },
  {
    id: 'coconut-milk-nourishing-body-wash',
    name: 'Coconut Milk Nourishing Body Wash',
    price: 7500,
    collection: 'body-wash',
    image: 'images/products/coconut-milk-nourishing-body-wash.jpg',
    description: 'A creamy, nourishing cleanse that leaves skin soft, never stripped.',
  },
  {
    id: 'charcoal-detox-body-wash',
    name: 'Charcoal Detox Body Wash',
    price: 8000,
    collection: 'body-wash',
    image: 'images/products/charcoal-detox-body-wash.jpg',
    description: 'Activated charcoal formula that deep-cleans and refreshes tired skin.',
  },

  // ---------- Sunscreen ----------
  {
    id: 'hyaluronic-acid-sunscreen-spf50',
    name: 'Hyaluronic Acid Sunscreen SPF50',
    price: 11500,
    collection: 'sunscreen',
    image: 'images/products/hyaluronic-acid-sunscreen-spf50.jpg',
    description: 'Lightweight, no white-cast SPF50 sunscreen that hydrates while it protects.',
    featured: true,
  },
  {
    id: 'aloe-soothing-sunscreen-spf50',
    name: 'Aloe Soothing Sunscreen SPF50',
    price: 10500,
    oldPrice: 12000,
    collection: 'sunscreen',
    image: 'images/products/aloe-soothing-sunscreen-spf50.jpg',
    description: 'Calming aloe-infused sunscreen for sensitive skin, broad-spectrum SPF50.',
  },
  {
    id: 'relief-sun-spf50',
    name: 'Relief Sun SPF50',
    price: 12500,
    collection: 'sunscreen',
    image: 'images/products/relief-sun-spf50.jpg',
    description: 'Fast-absorbing daily sunscreen with a natural, dewy finish.',
  },
  {
    id: 'watery-sun-gel-spf50',
    name: 'Watery Sun Gel SPF50',
    price: 13000,
    collection: 'sunscreen',
    image: 'images/products/watery-sun-gel-spf50.jpg',
    description: 'A gel-textured sunscreen that feels like water and wears well under makeup.',
  },
];
