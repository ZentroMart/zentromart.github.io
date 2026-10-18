/**
 * ZentroMart — Core Utilities & Helper Functions
 */

const ZM_CONFIG = {
  WHATSAPP_NUMBER: "923183085519",
  WHATSAPP_DISPLAY: "+92 318 3085519",
  CURRENCY: "PKR",
  CURRENCY_SYMBOL: "Rs.",
  PAGE_SIZE: 25,
  STORAGE_CART_KEY: "zentromart_cart",
  STORAGE_WISHLIST_KEY: "zentromart_wishlist",
  STORAGE_RECENT_KEY: "zentromart_recent_views"
};

/**
 * Format price in Pakistani Rupees
 * @param {number} amount
 * @returns {string} e.g. "Rs. 1,440"
 */
function formatPrice(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rs. 0';
  return `${ZM_CONFIG.CURRENCY_SYMBOL} ${amount.toLocaleString('en-PK')}`;
}

/**
 * Safely escape HTML to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Debounce function for smooth search input
 */
function debounce(func, wait = 250) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * LocalStorage wrapper with error handling
 */
function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`LocalStorage read error for ${key}:`, e);
    return defaultValue;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`LocalStorage write error for ${key}:`, e);
  }
}

/**
 * Safely slugify strings
 */
function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Get URL Query Parameters (with hash fallback)
 */
function getUrlParam(key) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const val = urlParams.get(key);
    if (val) return val.trim();

    // Check hash fallback e.g. #id=ZM-0001 or #ZM-0001
    if (window.location.hash) {
      const hashStr = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hashStr);
      const hashVal = hashParams.get(key);
      if (hashVal) return hashVal.trim();

      // If hash itself looks like a product ID (e.g. #ZM-0001)
      if (key === 'id' && /^ZM-\d+/i.test(hashStr)) {
        return hashStr.trim();
      }

      // If hash looks like a product slug or category slug
      if ((key === 'slug' || key === 'category') && hashStr && !hashStr.includes('=')) {
        return hashStr.trim();
      }
    }
  } catch (err) {
    console.warn('Error parsing URL parameter:', err);
  }
  return null;
}

/**
 * Update URL query parameter without page reload
 */
function updateUrlParam(key, value) {
  const url = new URL(window.location);
  if (value === null || value === undefined || value === '') {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }
  window.history.pushState({}, '', url);
}

/**
 * Toast Notification system
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconSvg = type === 'success' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

/**
 * Image Fallback Handler
 */
function handleImageError(img) {
  img.onerror = null;
  img.src = 'assets/images/placeholder.svg';
}

/**
 * Smooth Scroll to Element
 */
function scrollToElement(selector, offset = 90) {
  const el = document.querySelector(selector);
  if (el) {
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}
