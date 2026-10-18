/**
 * ZentroMart — Product Data Engine & Card Renderer
 */

const ProductEngine = (() => {
  let productsCache = null;
  let categoriesCache = null;
  let featuredCache = null;

  /**
   * Load all products with memory caching
   */
  async function getAllProducts() {
    if (productsCache) return productsCache;
    let raw = null;
    try {
      const response = await fetch('data/products.json');
      if (response.ok) {
        raw = await response.json();
      }
    } catch (err) {
      // Fallback below
    }
    if (!raw && window.__ZM_CATALOG_DATA__ && Array.isArray(window.__ZM_CATALOG_DATA__.products)) {
      raw = window.__ZM_CATALOG_DATA__.products;
    }
    if (Array.isArray(raw)) {
      productsCache = raw.map(p => {
        if (!p.categorySlug && p.category) {
          p.categorySlug = typeof slugify === 'function' ? slugify(p.category) : p.category.toLowerCase().replace(/\s+/g, '-');
        }
        return p;
      });
      return productsCache;
    }
    return [];
  }

  /**
   * Load categories
   */
  async function getCategories() {
    if (categoriesCache) return categoriesCache;
    try {
      const response = await fetch('data/categories.json');
      if (response.ok) {
        categoriesCache = await response.json();
        return categoriesCache;
      }
    } catch (err) {
      // Fallback below
    }
    if (window.__ZM_CATALOG_DATA__ && Array.isArray(window.__ZM_CATALOG_DATA__.categories)) {
      categoriesCache = window.__ZM_CATALOG_DATA__.categories;
      return categoriesCache;
    }
    return [];
  }

  /**
   * Load featured list
   */
  async function getFeaturedData() {
    if (featuredCache) return featuredCache;
    try {
      const response = await fetch('data/featured.json');
      if (response.ok) {
        featuredCache = await response.json();
        return featuredCache;
      }
    } catch (err) {
      // Fallback below
    }
    if (window.__ZM_CATALOG_DATA__ && window.__ZM_CATALOG_DATA__.featured) {
      featuredCache = window.__ZM_CATALOG_DATA__.featured;
      return featuredCache;
    }
    return { featuredProductIds: [], bestSellerIds: [], newArrivalIds: [] };
  }

  /**
   * Find product by ID or Slug (case-insensitive with safe fallback)
   */
  async function getProductByIdOrSlug(idOrSlug) {
    const products = await getAllProducts();
    if (!products || products.length === 0) return null;

    let target = idOrSlug;

    // 1. If not passed, check URL params (?id=... or ?slug=...)
    if (!target) {
      target = getUrlParam('id') || getUrlParam('slug');
    }

    // 2. If still empty, check URL hash (e.g. #ZM-0005 or #slug)
    if (!target && window.location.hash) {
      const h = window.location.hash.substring(1).trim();
      if (h) target = h;
    }

    // 3. If still empty, check sessionStorage
    if (!target) {
      try {
        target = sessionStorage.getItem('zm_selected_product_id');
      } catch (e) {}
    }

    // 4. If still empty, check localStorage
    if (!target) {
      try {
        target = localStorage.getItem('zm_selected_product_id');
      } catch (e) {}
    }

    // 5. If still empty, default to first product
    if (!target) return products[0];

    const clean = String(target).trim().toLowerCase();
    const matched = products.find(p => 
      (p.id && p.id.toLowerCase() === clean) || 
      (p.slug && p.slug.toLowerCase() === clean) ||
      (p.name && p.name.toLowerCase() === clean)
    );

    if (matched) {
      try {
        sessionStorage.setItem('zm_selected_product_id', matched.id);
        localStorage.setItem('zm_selected_product_id', matched.id);
      } catch (e) {}
      return matched;
    }

    // Try numeric SKU match e.g. "2" -> "ZM-0002"
    const numMatch = clean.match(/\d+/);
    if (numMatch) {
      const numStr = numMatch[0].padStart(4, '0');
      const bySku = products.find(p => p.id && p.id.toLowerCase().includes(numStr));
      if (bySku) {
        try {
          sessionStorage.setItem('zm_selected_product_id', bySku.id);
          localStorage.setItem('zm_selected_product_id', bySku.id);
        } catch (e) {}
        return bySku;
      }
    }

    return products[0];
  }

  /**
   * Create HTML string for a single Product Card (No prices shown)
   */
  function renderProductCard(product) {
    if (!product) return '';

    const firstImage = (product.images && product.images.length > 0)
      ? product.images[0]
      : 'assets/images/placeholder.svg';

    const isWishlisted = WishlistEngine ? WishlistEngine.has(product.id) : false;
    const targetUrl = `product.html?id=${encodeURIComponent(product.id)}#${encodeURIComponent(product.id)}`;
    const storeScript = `try{sessionStorage.setItem('zm_selected_product_id','${escapeHtml(product.id)}');localStorage.setItem('zm_selected_product_id','${escapeHtml(product.id)}');}catch(e){}`;

    return `
      <article class="product-card" data-product-id="${escapeHtml(product.id)}" data-category="${escapeHtml(product.categorySlug)}"
               onclick="if (!event.target.closest('button') && !event.target.closest('a')) { ${storeScript} window.location.href='${targetUrl}'; }"
               style="cursor: pointer;">
        <div class="product-card-image-wrap">
          <span class="product-badge-discount">20% OFF</span>
          ${product.bestSeller ? '<span class="product-badge-tag">BESTSELLER</span>' : ''}
          ${product.newArrival ? '<span class="product-badge-tag">NEW</span>' : ''}
          
          <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                  onclick="WishlistEngine.toggle('${escapeHtml(product.id)}', event)"
                  title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                  aria-label="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <a href="${targetUrl}" onclick="${storeScript}" title="${escapeHtml(product.name)}">
            <img src="${encodeURI(firstImage)}" 
                 alt="${escapeHtml(product.name)}" 
                 class="product-card-img" 
                 loading="lazy" 
                 width="300" 
                 height="300"
                 onerror="handleImageError(this)">
          </a>
        </div>

        <div class="product-card-content">
          <div class="product-card-meta">
            <span class="product-category-chip">${escapeHtml(product.category)}</span>
            <span class="product-sku">${escapeHtml(product.id)}</span>
          </div>

          <h3 class="product-card-title">
            <a href="${targetUrl}" onclick="${storeScript}" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</a>
          </h3>

          <div class="product-rating">
            <span>★★★★★</span>
            <span class="product-rating-score">4.9</span>
            <span class="text-muted" style="font-size:0.7rem; color:var(--text-muted);">(In Stock)</span>
          </div>

          <div class="product-card-price-block">
            <span class="product-save-pill">20% OFF Launch Promo</span>
            <span class="product-wa-confirm-tag">Confirm Price on WhatsApp</span>
          </div>

          <div class="product-card-actions">
            <button class="btn-card-add" onclick="CartEngine.add('${escapeHtml(product.id)}', 1, event)" aria-label="Add to cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Add to Cart</span>
            </button>
            <button class="btn-card-wa" onclick="WhatsAppEngine.orderSingleItem('${escapeHtml(product.id)}', 1, event)" title="Buy Now on WhatsApp" aria-label="Order on WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.077-2.261-.571-1.874-.78-3.08-2.69-3.173-.815-.094-.124-.755-1.006-.755-1.92 0-.914.48-1.365.65-1.554.17-.189.373-.236.498-.236.126 0 .252.001.362.007.116.006.273-.044.426.326.158.384.542 1.32.59 1.417.048.098.08.213.016.34-.064.127-.096.206-.189.317-.095.111-.199.248-.284.333-.095.095-.195.198-.084.388.111.19.493.813 1.057 1.316.726.647 1.339.847 1.53.942.19.095.302.079.414-.047.112-.127.48-.56.608-.752.127-.19.254-.158.423-.095.17.063 1.077.507 1.262.599.185.093.308.139.354.218.046.079.046.458-.098.863z"/>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  return {
    getAllProducts,
    getCategories,
    getFeaturedData,
    getProductByIdOrSlug,
    renderProductCard
  };
})();
