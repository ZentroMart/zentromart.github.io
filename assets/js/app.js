/**
 * ZentroMart — Master Application Orchestrator
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = (() => {
  function init() {
    initBadges();
    initStickyHeader();
    initMobileDrawer();
    initBackToTop();
    initNewsletterForm();
    SearchEngine.initSearchInputs();
    initGlobalLinkDelegation();

    // Route dispatcher based on page elements
    const pageId = document.body.dataset.page;
    switch (pageId) {
      case 'home':
        initHomePage();
        break;
      case 'shop':
        FilterEngine.initShopView();
        break;
      case 'product':
        initProductDetailPage();
        break;
      case 'cart':
        CartEngine.renderCartPage();
        break;
      case 'wishlist':
        WishlistEngine.renderWishlistPage();
        break;
      default:
        break;
    }
  }

  function initBadges() {
    CartEngine.updateBadges();
    WishlistEngine.updateBadges();
  }

  function initGlobalLinkDelegation() {
    document.addEventListener('click', (e) => {
      // 1. Any category link
      const catLink = e.target.closest('a[href*="category="]');
      if (catLink) {
        try {
          const u = new URL(catLink.href, window.location.origin);
          const cat = u.searchParams.get('category');
          if (cat) {
            sessionStorage.setItem('zm_selected_category', cat);
            localStorage.setItem('zm_selected_category', cat);
          }
        } catch (err) {}
      }

      // 2. Any product link
      const prodLink = e.target.closest('a[href*="product.html"], a[href*="/product"], [data-product-id]');
      if (prodLink && !e.target.closest('button')) {
        try {
          let prodId = prodLink.dataset.productId;
          if (!prodId && prodLink.href) {
            const u = new URL(prodLink.href, window.location.origin);
            prodId = u.searchParams.get('id');
          }
          if (prodId) {
            sessionStorage.setItem('zm_selected_product_id', prodId);
            localStorage.setItem('zm_selected_product_id', prodId);
          }
        } catch (err) {}
      }
    });
  }

  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  function initMobileDrawer() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    const closeBtn = document.getElementById('mobile-drawer-close');

    function openDrawer() {
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
  }

  function initBackToTop() {
    const btn = document.getElementById('back-to-top-btn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input && input.value) {
        showToast('Thank you for subscribing to ZentroMart offers!');
        input.value = '';
      }
    });
  }

  /* ----------------------------------------------------
     Home Page Initializer
     ---------------------------------------------------- */
  async function initHomePage() {
    const categoriesContainer = document.getElementById('home-categories-grid');
    const featuredContainer = document.getElementById('home-featured-grid');
    const bestSellersContainer = document.getElementById('home-bestsellers-grid');
    const newArrivalsContainer = document.getElementById('home-newarrivals-grid');

    const [allProducts, categories, featuredData] = await Promise.all([
      ProductEngine.getAllProducts(),
      ProductEngine.getCategories(),
      ProductEngine.getFeaturedData()
    ]);

    // 1. Categories
    if (categoriesContainer) {
      let catHtml = '';
      categories.forEach(cat => {
        const catSlug = (cat.slug || '').toLowerCase();
        const count = allProducts.filter(p => {
          const pSlug = (p.categorySlug || '').toLowerCase();
          const pGen = (typeof slugify === 'function' ? slugify(p.category || '') : '').toLowerCase();
          return pSlug === catSlug || pGen === catSlug;
        }).length;
        const targetUrl = `shop.html?category=${encodeURIComponent(cat.slug)}#${encodeURIComponent(cat.slug)}`;
        const storeCat = `try{sessionStorage.setItem('zm_selected_category','${escapeHtml(cat.slug)}');localStorage.setItem('zm_selected_category','${escapeHtml(cat.slug)}');}catch(e){}`;
        catHtml += `
          <a href="${targetUrl}" 
             onclick="${storeCat}"
             class="category-card" 
             data-category-slug="${escapeHtml(cat.slug)}">
            <div class="category-icon">${cat.icon}</div>
            <div class="category-name">${escapeHtml(cat.name)}</div>
            <div class="category-count">${count} Products</div>
          </a>
        `;
      });
      categoriesContainer.innerHTML = catHtml;
    }

    const productMap = new Map(allProducts.map(p => [p.id, p]));

    // 2. Featured Products
    if (featuredContainer) {
      const featIds = featuredData.featuredProductIds || [];
      const featProducts = featIds.map(id => productMap.get(id)).filter(Boolean).slice(0, 8);
      let html = '';
      featProducts.forEach(p => { html += ProductEngine.renderProductCard(p); });
      featuredContainer.innerHTML = html;
    }

    // 3. Best Sellers
    if (bestSellersContainer) {
      const bestIds = featuredData.bestSellerIds || [];
      const bestProducts = bestIds.map(id => productMap.get(id)).filter(Boolean).slice(0, 8);
      let html = '';
      bestProducts.forEach(p => { html += ProductEngine.renderProductCard(p); });
      bestSellersContainer.innerHTML = html;
    }

    // 4. New Arrivals
    if (newArrivalsContainer) {
      const newIds = featuredData.newArrivalIds || [];
      const newProducts = newIds.map(id => productMap.get(id)).filter(Boolean).slice(0, 8);
      let html = '';
      newProducts.forEach(p => { html += ProductEngine.renderProductCard(p); });
      newArrivalsContainer.innerHTML = html;
    }
  }

  /* ----------------------------------------------------
     Product Details Page Initializer
     ---------------------------------------------------- */
  async function initProductDetailPage() {
    let idOrSlug = getUrlParam('id') || getUrlParam('slug');
    if (!idOrSlug && window.location.hash) {
      const h = window.location.hash.substring(1).trim();
      if (h) idOrSlug = h;
    }
    if (!idOrSlug) {
      try {
        idOrSlug = sessionStorage.getItem('zm_selected_product_id') || localStorage.getItem('zm_selected_product_id');
      } catch (e) {}
    }

    const container = document.getElementById('product-detail-wrapper');
    if (!container) return;

    let product = await ProductEngine.getProductByIdOrSlug(idOrSlug);
    if (!product) {
      const all = await ProductEngine.getAllProducts();
      product = all && all.length > 0 ? all[0] : null;
    }

    if (!product) {
      container.innerHTML = `
        <div class="empty-state-wrap">
          <h2 class="empty-state-title">Loading Catalog...</h2>
          <p class="empty-state-p">Please ensure catalog data is available.</p>
          <a href="shop.html" class="btn btn-primary btn-lg">Browse Shop</a>
        </div>
      `;
      return;
    }

    // Ensure session and local storage record this viewed product
    try {
      sessionStorage.setItem('zm_selected_product_id', product.id);
      localStorage.setItem('zm_selected_product_id', product.id);
    } catch (e) {}

    // Update URL query / hash cleanly if on /product without query
    if (!getUrlParam('id') && window.history && window.history.replaceState) {
      try {
        const canonicalUrl = `product.html?id=${encodeURIComponent(product.id)}#${encodeURIComponent(product.id)}`;
        window.history.replaceState(null, '', canonicalUrl);
      } catch (e) {}
    }

    // Update document title for SEO
    document.title = `${product.name} — Buy on WhatsApp | ZentroMart`;

    // Breadcrumbs
    const catSlug = product.categorySlug || (product.category ? (typeof slugify === 'function' ? slugify(product.category) : product.category.toLowerCase().replace(/\s+/g, '-')) : 'all');
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const breadcrumbTitle = document.getElementById('breadcrumb-product');
    if (breadcrumbCategory) {
      breadcrumbCategory.textContent = product.category;
      breadcrumbCategory.href = `shop.html?category=${encodeURIComponent(catSlug)}#${encodeURIComponent(catSlug)}`;
      breadcrumbCategory.onclick = () => {
        try {
          sessionStorage.setItem('zm_selected_category', catSlug);
          localStorage.setItem('zm_selected_category', catSlug);
        } catch (e) {}
      };
    }
    if (breadcrumbTitle) {
      breadcrumbTitle.textContent = product.name;
    }

    // Initialize Multi-Image Gallery
    GalleryEngine.initGallery(product.images);

    // Populate Product Information
    const titleEl = document.getElementById('product-detail-title');
    const skuEl = document.getElementById('product-detail-sku');
    const descEl = document.getElementById('product-detail-desc');
    const specsTableEl = document.getElementById('product-specs-table-body');
    const buyWaBtn = document.getElementById('btn-buy-whatsapp');
    const addToCartBtn = document.getElementById('btn-add-to-cart');
    const qtyInput = document.getElementById('product-qty-input');
    const wishlistBtn = document.getElementById('product-detail-wishlist-btn');

    if (titleEl) titleEl.textContent = product.name;
    if (skuEl) skuEl.textContent = `SKU: ${product.id}`;
    if (descEl) descEl.textContent = product.description;

    // Specs
    if (specsTableEl && product.specifications) {
      let rows = '';
      for (const [key, val] of Object.entries(product.specifications)) {
        rows += `
          <tr>
            <th>${escapeHtml(key)}</th>
            <td>${escapeHtml(val)}</td>
          </tr>
        `;
      }
      specsTableEl.innerHTML = rows;
    }

    // Actions
    if (buyWaBtn) {
      buyWaBtn.onclick = () => {
        const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
        WhatsAppEngine.orderSingleItem(product.id, qty);
      };
    }

    if (addToCartBtn) {
      addToCartBtn.onclick = (e) => {
        const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
        CartEngine.add(product.id, qty, e);
      };
    }

    if (wishlistBtn) {
      const active = WishlistEngine.has(product.id);
      wishlistBtn.classList.toggle('active', active);
      wishlistBtn.onclick = (e) => {
        WishlistEngine.toggle(product.id, e);
        const nowActive = WishlistEngine.has(product.id);
        wishlistBtn.classList.toggle('active', nowActive);
      };
    }

    // Stepper buttons
    const stepMinus = document.getElementById('qty-minus');
    const stepPlus = document.getElementById('qty-plus');
    if (stepMinus && qtyInput) {
      stepMinus.onclick = () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) qtyInput.value = val - 1;
      };
    }
    if (stepPlus && qtyInput) {
      stepPlus.onclick = () => {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val < 99) qtyInput.value = val + 1;
      };
    }

    // Related Products (same category)
    const relatedContainer = document.getElementById('related-products-grid');
    if (relatedContainer) {
      const allProducts = await ProductEngine.getAllProducts();
      const related = allProducts
        .filter(p => p.categorySlug === product.categorySlug && p.id !== product.id)
        .slice(0, 4);

      if (related.length > 0) {
        let relHtml = '';
        related.forEach(rp => { relHtml += ProductEngine.renderProductCard(rp); });
        relatedContainer.innerHTML = relHtml;
      } else {
        const fallback = allProducts.filter(p => p.id !== product.id).slice(0, 4);
        let relHtml = '';
        fallback.forEach(rp => { relHtml += ProductEngine.renderProductCard(rp); });
        relatedContainer.innerHTML = relHtml;
      }
    }
  }

  return {
    init
  };
})();
