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
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) throw new Error('Failed to load products');
      productsCache = await response.json();
      return productsCache;
    } catch (err) {
      console.error('Error fetching products:', err);
      return [];
    }
  }

  /**
   * Load categories
   */
  async function getCategories() {
    if (categoriesCache) return categoriesCache;
    try {
      const response = await fetch('data/categories.json');
      if (!response.ok) throw new Error('Failed to load categories');
      categoriesCache = await response.json();
      return categoriesCache;
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  }

  /**
   * Load featured list
   */
  async function getFeaturedData() {
    if (featuredCache) return featuredCache;
    try {
      const response = await fetch('data/featured.json');
      if (!response.ok) throw new Error('Failed to load featured data');
      featuredCache = await response.json();
      return featuredCache;
    } catch (err) {
      console.error('Error fetching featured data:', err);
      return { featuredProductIds: [], bestSellerIds: [], newArrivalIds: [] };
    }
  }

  /**
   * Find product by ID or Slug
   */
  async function getProductByIdOrSlug(idOrSlug) {
    const products = await getAllProducts();
    return products.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }

  /**
   * Create HTML string for a single Product Card
   */
  function renderProductCard(product) {
    if (!product) return '';

    const firstImage = (product.images && product.images.length > 0)
      ? product.images[0]
      : 'assets/images/placeholder.svg';

    const isWishlisted = WishlistEngine ? WishlistEngine.has(product.id) : false;
    const savePercent = product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 20;

    return `
      <article class="product-card" data-product-id="${escapeHtml(product.id)}" data-category="${escapeHtml(product.categorySlug)}">
        <div class="product-card-image-wrap">
          <span class="product-badge-discount">-${savePercent}% OFF</span>
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

          <a href="product.html?id=${encodeURIComponent(product.id)}" title="${escapeHtml(product.name)}">
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
            <a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a>
          </h3>

          <div class="product-rating">
            <span>★★★★★</span>
            <span class="product-rating-score">4.9</span>
            <span class="text-muted" style="font-size:0.7rem; color:var(--text-muted);">(In Stock)</span>
          </div>

          <div class="product-card-price-block">
            <span class="product-current-price">${formatPrice(product.price)}</span>
            ${product.originalPrice ? `<span class="product-original-price">${formatPrice(product.originalPrice)}</span>` : ''}
            <span class="product-save-pill">20% OFF Applied</span>
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
