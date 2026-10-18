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
        const count = allProducts.filter(p => p.categorySlug === cat.slug).length;
        catHtml += `
          <a href="shop.html?category=${encodeURIComponent(cat.slug)}" class="category-card">
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
    const idOrSlug = getUrlParam('id') || getUrlParam('slug');
    const container = document.getElementById('product-detail-wrapper');
    if (!container) return;

    if (!idOrSlug) {
      container.innerHTML = `
        <div class="empty-state-wrap">
          <h2 class="empty-state-title">No Product Selected</h2>
          <p class="empty-state-p">Please choose a product from our catalog to view complete details.</p>
          <a href="shop.html" class="btn btn-primary btn-lg">Browse Shop</a>
        </div>
      `;
      return;
    }

    const product = await ProductEngine.getProductByIdOrSlug(idOrSlug);
    if (!product) {
      container.innerHTML = `
        <div class="empty-state-wrap">
          <h2 class="empty-state-title">Product Not Found</h2>
          <p class="empty-state-p">The requested product "${escapeHtml(idOrSlug)}" may have been moved or is currently unavailable.</p>
          <a href="shop.html" class="btn btn-primary btn-lg">Return to Shop</a>
        </div>
      `;
      return;
    }

    // Update document title for SEO
    document.title = `${product.name} — Buy on WhatsApp | ZentroMart`;

    // Breadcrumbs
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const breadcrumbTitle = document.getElementById('breadcrumb-product');
    if (breadcrumbCategory) {
      breadcrumbCategory.textContent = product.category;
      breadcrumbCategory.href = `shop.html?category=${encodeURIComponent(product.categorySlug)}`;
    }
    if (breadcrumbTitle) {
      breadcrumbTitle.textContent = product.name;
    }

    // Initialize Multi-Image Gallery
    GalleryEngine.initGallery(product.images);

    // Populate Product Information
    const titleEl = document.getElementById('product-detail-title');
    const skuEl = document.getElementById('product-detail-sku');
    const currentPriceEl = document.getElementById('product-detail-current-price');
    const origPriceEl = document.getElementById('product-detail-orig-price');
    const descEl = document.getElementById('product-detail-desc');
    const specsTableEl = document.getElementById('product-specs-table-body');
    const buyWaBtn = document.getElementById('btn-buy-whatsapp');
    const addToCartBtn = document.getElementById('btn-add-to-cart');
    const qtyInput = document.getElementById('product-qty-input');
    const wishlistBtn = document.getElementById('product-detail-wishlist-btn');

    if (titleEl) titleEl.textContent = product.name;
    if (skuEl) skuEl.textContent = `SKU: ${product.id}`;
    if (currentPriceEl) currentPriceEl.textContent = formatPrice(product.price);
    if (origPriceEl) {
      if (product.originalPrice) {
        origPriceEl.textContent = formatPrice(product.originalPrice);
        origPriceEl.style.display = 'inline';
      } else {
        origPriceEl.style.display = 'none';
      }
    }
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
