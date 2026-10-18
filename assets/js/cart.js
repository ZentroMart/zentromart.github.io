/**
 * ZentroMart — Shopping Cart Engine (LocalStorage Based)
 */

const CartEngine = (() => {
  function getCartData() {
    return getStorage(ZM_CONFIG.STORAGE_CART_KEY, []);
  }

  function saveCartData(items) {
    setStorage(ZM_CONFIG.STORAGE_CART_KEY, items);
    updateBadges();
  }

  function getCount() {
    const items = getCartData();
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  function updateBadges() {
    const count = getCount();
    document.querySelectorAll('.cart-badge-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function add(productId, quantity = 1, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const items = getCartData();
    const existingIndex = items.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
      items[existingIndex].quantity = (items[existingIndex].quantity || 1) + quantity;
    } else {
      items.push({ id: productId, quantity: quantity });
    }

    saveCartData(items);
    showToast(`Added to cart! Total items: ${getCount()}`);
  }

  function updateQuantity(productId, quantity) {
    let items = getCartData();
    const parsedQty = parseInt(quantity, 10);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      items = items.filter(item => item.id !== productId);
    } else {
      const target = items.find(item => item.id === productId);
      if (target) {
        target.quantity = Math.min(parsedQty, 99);
      }
    }

    saveCartData(items);
    renderCartPage();
  }

  function remove(productId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    let items = getCartData();
    items = items.filter(item => item.id !== productId);
    saveCartData(items);
    showToast('Item removed from cart');
    renderCartPage();
  }

  function clear() {
    saveCartData([]);
    renderCartPage();
  }

  async function getCartWithProducts() {
    const items = getCartData();
    const products = await ProductEngine.getAllProducts();
    const productMap = new Map(products.map(p => [p.id, p]));

    return items
      .map(item => {
        const prod = productMap.get(item.id);
        if (!prod) return null;
        return {
          ...item,
          product: prod,
          itemTotal: (prod.price || 0) * (item.quantity || 1)
        };
      })
      .filter(Boolean);
  }

  async function renderCartPage() {
    const cartListContainer = document.getElementById('cart-items-wrapper');
    const summaryWrapper = document.getElementById('cart-summary-wrapper');
    if (!cartListContainer) return;

    const cartItems = await getCartWithProducts();

    if (cartItems.length === 0) {
      cartListContainer.innerHTML = `
        <div class="empty-state-wrap">
          <div class="empty-state-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2 class="empty-state-title">Your Cart is Empty</h2>
          <p class="empty-state-p">Looks like you haven't added anything to your cart yet. Explore our multi-category catalog and enjoy 20% OFF on all items!</p>
          <a href="shop.html" class="btn btn-primary btn-lg">Browse Products</a>
        </div>
      `;
      if (summaryWrapper) summaryWrapper.style.display = 'none';
      return;
    }

    if (summaryWrapper) summaryWrapper.style.display = 'block';

    let totalAmount = 0;
    let originalTotal = 0;

    let itemsHtml = '<div class="cart-items-container">';
    cartItems.forEach(item => {
      const p = item.product;
      const firstImage = (p.images && p.images.length > 0) ? p.images[0] : 'assets/images/placeholder.svg';
      const itemSubtotal = (p.price || 0) * item.quantity;
      const itemOrig = (p.originalPrice || p.price * 1.25) * item.quantity;
      totalAmount += itemSubtotal;
      originalTotal += itemOrig;

      itemsHtml += `
        <div class="cart-item-row" data-id="${escapeHtml(p.id)}">
          <img src="${encodeURI(firstImage)}" alt="${escapeHtml(p.name)}" class="cart-item-thumb" onerror="handleImageError(this)">
          
          <div class="cart-item-info">
            <span class="product-category-chip">${escapeHtml(p.category)}</span>
            <h4><a href="product.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.name)}</a></h4>
            <div class="cart-item-sku">SKU: ${escapeHtml(p.id)}</div>
            <div class="cart-item-price">${formatPrice(p.price)} each</div>
          </div>

          <div class="stepper-box">
            <button class="stepper-btn" onclick="CartEngine.updateQuantity('${escapeHtml(p.id)}', ${item.quantity - 1})">-</button>
            <input type="number" class="stepper-input" value="${item.quantity}" min="1" max="99" 
                   onchange="CartEngine.updateQuantity('${escapeHtml(p.id)}', this.value)">
            <button class="stepper-btn" onclick="CartEngine.updateQuantity('${escapeHtml(p.id)}', ${item.quantity + 1})">+</button>
          </div>

          <div style="text-align:right;">
            <div style="font-weight:800; font-size:1.1rem; color:var(--color-primary);">${formatPrice(itemSubtotal)}</div>
            <button class="cart-item-remove-btn" onclick="CartEngine.remove('${escapeHtml(p.id)}', event)" title="Remove item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    });
    itemsHtml += '</div>';
    cartListContainer.innerHTML = itemsHtml;

    if (summaryWrapper) {
      const totalSavings = originalTotal > totalAmount ? originalTotal - totalAmount : 0;
      summaryWrapper.innerHTML = `
        <div class="cart-summary-box">
          <h3 class="cart-summary-title">Order Summary</h3>
          
          <div class="summary-row">
            <span>Total Items</span>
            <strong>${getCount()} items</strong>
          </div>

          <div class="summary-row">
            <span>Catalog Subtotal</span>
            <span>${formatPrice(originalTotal)}</span>
          </div>

          ${totalSavings > 0 ? `
          <div class="summary-row" style="color:#15803d; font-weight:700;">
            <span>20% Promotional Discount</span>
            <span>-${formatPrice(totalSavings)}</span>
          </div>
          ` : ''}

          <div class="summary-promo-tag">
            🎁 20% OFF Launch Promotion Applied to All Items
          </div>

          <div class="summary-row total-row">
            <span>Estimated Total</span>
            <span style="color:var(--color-orange);">${formatPrice(totalAmount)}</span>
          </div>

          <p class="summary-delivery-note">
            ⚠️ Delivery charges vary by city across Pakistan and will be confirmed on WhatsApp before dispatch.
          </p>

          <button class="btn btn-whatsapp btn-block btn-lg" onclick="WhatsAppEngine.checkoutCart()" style="margin-top:1.25rem;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.698.077-2.261-.571-1.874-.78-3.08-2.69-3.173-.815-.094-.124-.755-1.006-.755-1.92 0-.914.48-1.365.65-1.554.17-.189.373-.236.498-.236.126 0 .252.001.362.007.116.006.273-.044.426.326.158.384.542 1.32.59 1.417.048.098.08.213.016.34-.064.127-.096.206-.189.317-.095.111-.199.248-.284.333-.095.095-.195.198-.084.388.111.19.493.813 1.057 1.316.726.647 1.339.847 1.53.942.19.095.302.079.414-.047.112-.127.48-.56.608-.752.127-.19.254-.158.423-.095.17.063 1.077.507 1.262.599.185.093.308.139.354.218.046.079.046.458-.098.863z"/>
            </svg>
            <span>Checkout on WhatsApp</span>
          </button>
        </div>
      `;
    }
  }

  return {
    getCartData,
    getCount,
    updateBadges,
    add,
    updateQuantity,
    remove,
    clear,
    getCartWithProducts,
    renderCartPage
  };
})();
