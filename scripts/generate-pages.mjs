/**
 * ZentroMart — Static Product Detail Pages & Sitemap Generator
 * Creates pre-rendered HTML files for search engine discovery on GitHub Pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const products = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'products.json'), 'utf8'));
const outputDir = path.join(rootDir, 'p');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
}

products.forEach(p => {
  const firstImage = (p.images && p.images.length > 0) ? p.images[0] : 'assets/images/placeholder.svg';
  const savePercent = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 20;

  let specsRows = '';
  if (p.specifications) {
    for (const [k, v] of Object.entries(p.specifications)) {
      specsRows += `<tr><th style="padding:0.5rem; border-bottom:1px solid #e2e8f0; text-align:left; color:#64748b;">${escapeHtml(k)}</th><td style="padding:0.5rem; border-bottom:1px solid #e2e8f0; font-weight:700;">${escapeHtml(v)}</td></tr>`;
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(p.name)} — ZentroMart</title>
  <meta name="description" content="${escapeHtml(p.description)} Buy on WhatsApp with 20% OFF launch discount at ZentroMart.">
  <link rel="canonical" href="./${p.slug}.html">
  <meta property="og:title" content="${escapeHtml(p.name)} — ZentroMart">
  <meta property="og:description" content="${escapeHtml(p.description)}">
  <meta property="og:image" content="../${firstImage}">
  <link rel="icon" type="image/svg+xml" href="../assets/images/logo.svg">
  <link rel="stylesheet" href="../assets/css/main.css">
  <link rel="stylesheet" href="../assets/css/components.css">
  <link rel="stylesheet" href="../assets/css/responsive.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "${escapeHtml(p.name)}",
    "image": ["../${firstImage}"],
    "description": "${escapeHtml(p.description)}",
    "sku": "${p.id}",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PKR",
      "price": "${p.price}",
      "availability": "https://schema.org/InStock",
      "url": "./${p.slug}.html"
    }
  }
  </script>
</head>
<body data-page="static-product">
  <div class="announcement-bar">
    <div class="container" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
      <span>ZentroMart: +92 318 3085519 — Flat 20% OFF Launch Promotion Included!</span>
      <a href="https://wa.me/923183085519" class="support-wa">WhatsApp Checkout</a>
    </div>
  </div>

  <header class="site-header">
    <div class="container header-inner">
      <a href="../index.html" class="header-logo"><img src="../assets/images/logo-dark.svg" alt="ZentroMart" width="200" height="46"></a>
      <div style="margin-left:auto; display:flex; gap:1rem; align-items:center;">
        <a href="../shop.html" class="btn btn-secondary btn-sm">All Products</a>
        <a href="https://wa.me/923183085519?text=Hello%20ZentroMart!%20I%20would%20like%20to%20order:%20${encodeURIComponent(p.name)}%20(SKU:%20${p.id})" class="btn-whatsapp-header">
          <span>Order on WhatsApp</span>
        </a>
      </div>
    </div>
  </header>

  <main class="container" style="padding-top:2rem; padding-bottom:4rem;">
    <div class="breadcrumbs">
      <a href="../index.html">Home</a> <span class="sep">/</span>
      <a href="../shop.html">Shop</a> <span class="sep">/</span>
      <a href="../shop.html?category=${encodeURIComponent(p.categorySlug)}">${escapeHtml(p.category)}</a> <span class="sep">/</span>
      <span style="font-weight:700;">${escapeHtml(p.name)}</span>
    </div>

    <div class="product-detail-layout" style="margin-top:1.5rem;">
      <div>
        <div style="position:relative; width:100%; padding-top:100%; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; background:#ffffff;">
          <img src="../${encodeURI(firstImage)}" alt="${escapeHtml(p.name)}" style="position:absolute; inset:0; width:100%; height:100%; object-fit:contain; padding:1.5rem;">
        </div>
      </div>
      <div>
        <div style="display:flex; gap:0.5rem; margin-bottom:1rem; align-items:center;">
          <span class="badge-in-stock">● In Stock</span>
          <span class="badge-sku">SKU: ${p.id}</span>
          <span class="product-save-pill">-${savePercent}% OFF</span>
        </div>
        <h1 style="font-size:2rem; font-weight:900; margin-bottom:1rem; color:var(--color-primary);">${escapeHtml(p.name)}</h1>
        <div style="background:#f1f5f9; padding:1.25rem; border-radius:12px; margin-bottom:1.5rem;">
          <div style="font-size:2.25rem; font-weight:900; color:var(--color-orange);">${formatPrice(p.price)}</div>
          ${p.originalPrice ? `<div style="text-decoration:line-through; color:#94a3b8; font-size:1.1rem;">${formatPrice(p.originalPrice)}</div>` : ''}
          <div style="font-size:0.8rem; color:#15803d; font-weight:700; margin-top:0.35rem;">✓ 20% Launch Promo Discount Applied</div>
        </div>
        <p style="color:#64748b; line-height:1.7; margin-bottom:2rem;">${escapeHtml(p.description)}</p>
        
        <a href="https://wa.me/923183085519?text=Hello%20ZentroMart!%0A%0AI%20would%20like%20to%20order:%0AProduct:%20${encodeURIComponent(p.name)}%0AProduct%20ID:%20${p.id}%0AQuantity:%201%0AOffer:%2020%25%20OFF%20Applied%0A%0APlease%20confirm%20availability%20and%20delivery%20details." class="btn btn-whatsapp btn-lg btn-block" style="margin-bottom:1rem;">
          <span>Buy Now on WhatsApp (+92 318 3085519)</span>
        </a>
        <a href="../product.html?id=${encodeURIComponent(p.id)}" class="btn btn-secondary btn-block">
          <span>Open in Interactive Gallery & Cart</span>
        </a>

        ${specsRows ? `
        <div style="margin-top:2rem; border-top:1px solid #e2e8f0; padding-top:1.5rem;">
          <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:0.75rem;">Specifications</h3>
          <table style="width:100%; border-collapse:collapse;">
            ${specsRows}
          </table>
        </div>
        ` : ''}
      </div>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="visitor-analytics-section" id="live-visitor-stats"></div>
      <div class="footer-bottom">
        <div>© 2026 ZentroMart. Everything You Need, All in One Place.</div>
        <a href="../shop.html">Return to Shop</a>
      </div>
    </div>
  </footer>

  <script src="../assets/js/utils.js" defer></script>
  <script src="../assets/js/visitor-counter-config.js" defer></script>
  <script src="../assets/js/visitor-counter.js" defer></script>
</body>
</html>`;

  const filePath = path.join(outputDir, `${p.slug}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
});

console.log(`✅ Generated ${products.length} pre-rendered static SEO product pages in /p/ directory.`);
