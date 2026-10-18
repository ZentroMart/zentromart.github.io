/**
 * ZentroMart — Wishlist Engine (LocalStorage Based)
 */

const WishlistEngine = (() => {
  function getWishlistData() {
    return getStorage(ZM_CONFIG.STORAGE_WISHLIST_KEY, []);
  }

  function saveWishlistData(ids) {
    setStorage(ZM_CONFIG.STORAGE_WISHLIST_KEY, ids);
    updateBadges();
  }

  function has(productId) {
    const list = getWishlistData();
    return list.includes(productId);
  }

  function getCount() {
    return getWishlistData().length;
  }

  function updateBadges() {
    const count = getCount();
    document.querySelectorAll('.wishlist-badge-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function toggle(productId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    let list = getWishlistData();
    const index = list.indexOf(productId);

    if (index > -1) {
      list.splice(index, 1);
      showToast('Removed from Wishlist');
    } else {
      list.push(productId);
      showToast('Added to Wishlist!');
    }

    saveWishlistData(list);

    // Update heart icons across the page
    document.querySelectorAll(`.product-card[data-product-id="${productId}"] .product-wishlist-btn, .product-detail-wishlist-btn`).forEach(btn => {
      const active = has(productId);
      btn.classList.toggle('active', active);
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', active ? 'currentColor' : 'none');
    });

    renderWishlistPage();
  }

  async function renderWishlistPage() {
    const container = document.getElementById('wishlist-grid-wrapper');
    if (!container) return;

    const list = getWishlistData();
    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state-wrap">
          <div class="empty-state-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h2 class="empty-state-title">Your Wishlist is Empty</h2>
          <p class="empty-state-p">Save items you love so you can easily review them or order anytime directly via WhatsApp.</p>
          <a href="shop.html" class="btn btn-primary btn-lg">Discover Products</a>
        </div>
      `;
      return;
    }

    const allProducts = await ProductEngine.getAllProducts();
    const productMap = new Map(allProducts.map(p => [p.id, p]));
    const wishlistedProducts = list.map(id => productMap.get(id)).filter(Boolean);

    let html = '<div class="products-grid">';
    wishlistedProducts.forEach(product => {
      html += ProductEngine.renderProductCard(product);
    });
    html += '</div>';

    container.innerHTML = html;
  }

  return {
    getWishlistData,
    has,
    getCount,
    updateBadges,
    toggle,
    renderWishlistPage
  };
})();
