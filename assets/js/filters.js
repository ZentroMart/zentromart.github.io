/**
 * ZentroMart — Filter & Sorting Engine for Shop Catalog
 */

const FilterEngine = (() => {
  let allProductsCache = [];
  let currentFilters = {
    category: 'all',
    search: '',
    maxPrice: 3500,
    minPrice: 0,
    sortBy: 'popularity',
    page: 1
  };

  function getCategoryFromLocation() {
    let cat = getUrlParam('category');
    if (!cat && window.location.hash) {
      const h = window.location.hash.substring(1).trim();
      if (h && !h.startsWith('ZM-') && !h.includes('=')) {
        cat = h;
      }
    }
    if (!cat) {
      try {
        cat = sessionStorage.getItem('zm_selected_category') || localStorage.getItem('zm_selected_category');
      } catch (e) {}
    }
    return cat || 'all';
  }

  async function initShopView() {
    const productsContainer = document.getElementById('shop-products-container');
    if (!productsContainer) return;

    allProductsCache = await ProductEngine.getAllProducts();

    // Read initial params from URL / storage / hash BEFORE rendering category list
    const urlCategory = getCategoryFromLocation();
    const urlSearch = getUrlParam('search') || '';
    const urlSort = getUrlParam('sort') || 'popularity';
    const urlPage = parseInt(getUrlParam('page'), 10) || 1;

    currentFilters.category = urlCategory;
    currentFilters.search = urlSearch;
    currentFilters.sortBy = urlSort;
    currentFilters.page = urlPage;

    // Save selected category to storage if active
    try {
      if (urlCategory && urlCategory !== 'all') {
        sessionStorage.setItem('zm_selected_category', urlCategory);
        localStorage.setItem('zm_selected_category', urlCategory);
      }
    } catch (e) {}

    // Render category list now with correct active item!
    await renderCategoryFilterList();

    // Sync input states
    const searchInput = document.getElementById('shop-search-input');
    if (searchInput && urlSearch) searchInput.value = urlSearch;

    const sortSelect = document.getElementById('shop-sort-select');
    if (sortSelect) sortSelect.value = urlSort;

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentFilters.sortBy = e.target.value;
        updateUrlParam('sort', currentFilters.sortBy);
        applyFilters(1);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        currentFilters.search = e.target.value.trim();
        updateUrlParam('search', currentFilters.search);
        applyFilters(1);
      }, 250));
    }

    // Expose page change listener for pagination
    window.onShopFilterOrPageChange = (page) => {
      currentFilters.page = page;
      applyFilters(page, false);
    };

    // React to hashchange and popstate events on shop catalog
    window.addEventListener('hashchange', () => {
      const newCat = getCategoryFromLocation();
      if (newCat !== currentFilters.category) {
        setCategory(newCat);
      }
    });

    window.addEventListener('popstate', () => {
      const newCat = getCategoryFromLocation();
      if (newCat !== currentFilters.category) {
        setCategory(newCat);
      }
    });

    // Initial render
    applyFilters(currentFilters.page);
  }

  async function renderCategoryFilterList() {
    const listEl = document.getElementById('filter-categories-list');
    if (!listEl) return;

    const categories = await ProductEngine.getCategories();
    const products = allProductsCache;

    // Count per category
    const countMap = {};
    products.forEach(p => {
      const pSlug = (p.categorySlug || '').toLowerCase();
      countMap[pSlug] = (countMap[pSlug] || 0) + 1;
    });

    const activeCat = (currentFilters.category || 'all').toLowerCase();
    const isAllActive = activeCat === 'all' || !activeCat;

    let html = `
      <li>
        <div class="category-radio-btn ${isAllActive ? 'active' : ''}" 
             data-slug="all"
             onclick="FilterEngine.setCategory('all')">
          <span>All Categories</span>
          <span class="count-badge">${products.length}</span>
        </div>
      </li>
    `;

    categories.forEach(cat => {
      const catSlug = (cat.slug || '').toLowerCase();
      const count = countMap[catSlug] || 0;
      const isActive = !isAllActive && (activeCat === catSlug || activeCat === (cat.name || '').toLowerCase());
      html += `
        <li>
          <div class="category-radio-btn ${isActive ? 'active' : ''}" 
               data-slug="${escapeHtml(cat.slug)}"
               onclick="FilterEngine.setCategory('${escapeHtml(cat.slug)}')">
            <span>${cat.icon} ${escapeHtml(cat.name)}</span>
            <span class="count-badge">${count}</span>
          </div>
        </li>
      `;
    });

    listEl.innerHTML = html;
  }

  function setCategory(slug) {
    const normalized = (slug || 'all').trim();
    currentFilters.category = normalized;

    try {
      if (normalized && normalized !== 'all') {
        sessionStorage.setItem('zm_selected_category', normalized);
        localStorage.setItem('zm_selected_category', normalized);
      } else {
        sessionStorage.removeItem('zm_selected_category');
        localStorage.removeItem('zm_selected_category');
      }
    } catch (e) {}

    updateUrlParam('category', normalized === 'all' ? '' : normalized);

    // Update hash for fallback persistence
    if (window.history && window.history.replaceState) {
      const hashVal = normalized === 'all' ? '' : `#${encodeURIComponent(normalized)}`;
      const url = new URL(window.location);
      if (normalized === 'all') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', normalized);
      }
      url.hash = hashVal;
      window.history.replaceState({}, '', url.toString());
    }

    // Always re-render list to ensure exact active class assignment
    renderCategoryFilterList();
    applyFilters(1); // Reset to page 1
  }

  function applyFilters(page = 1, resetPageParam = true) {
    if (resetPageParam) {
      currentFilters.page = 1;
      updateUrlParam('page', 1);
    } else {
      currentFilters.page = page;
    }

    let filtered = [...allProductsCache];

    // 1. Category Filter (normalized case-insensitive check)
    if (currentFilters.category && currentFilters.category !== 'all') {
      const target = currentFilters.category.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const pSlug = (p.categorySlug || '').toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        const pGen = (typeof slugify === 'function' ? slugify(p.category || '') : '').toLowerCase();
        return pSlug === target || pCat === target || pGen === target ||
               pSlug.replace(/-/g, '') === target.replace(/-/g, '');
      });
    }

    // 2. Search Filter
    if (currentFilters.search) {
      const q = currentFilters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    switch (currentFilters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => (b.popularityRank || 0) - (a.popularityRank || 0));
        break;
    }

    // 5. Paginate strictly 25 per page
    const paginationData = PaginationEngine.paginateItems(filtered, currentFilters.page);
    renderProducts(paginationData);
    PaginationEngine.renderPaginationControls(paginationData);
    renderResultsSummary(paginationData);
    renderActiveFilterChips();
  }

  function renderProducts(paginationData) {
    const container = document.getElementById('shop-products-container');
    if (!container) return;

    const { items, totalItems } = paginationData;

    if (totalItems === 0) {
      container.innerHTML = `
        <div class="empty-state-wrap" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
          <h3 class="empty-state-title">No Products Match Your Filter</h3>
          <p class="empty-state-p">Try adjusting your price range, clearing your search keywords, or selecting another category.</p>
          <button class="btn btn-secondary" onclick="FilterEngine.resetFilters()">Clear All Filters</button>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(product => {
      html += ProductEngine.renderProductCard(product);
    });

    container.innerHTML = html;
  }

  function renderResultsSummary(paginationData) {
    const summaryEl = document.getElementById('shop-results-info');
    if (!summaryEl) return;
    const { startIndex, endIndex, totalItems } = paginationData;
    summaryEl.innerHTML = `Showing <strong>${startIndex}–${endIndex}</strong> of <strong>${totalItems}</strong> products`;
  }

  function renderActiveFilterChips() {
    const chipsContainer = document.getElementById('active-filters-chips');
    if (!chipsContainer) return;

    let html = '';
    if (currentFilters.category !== 'all') {
      html += `
        <span class="filter-chip">
          Category: ${escapeHtml(currentFilters.category)}
          <button onclick="FilterEngine.setCategory('all')" title="Remove">×</button>
        </span>
      `;
    }

    if (currentFilters.search) {
      html += `
        <span class="filter-chip">
          Search: "${escapeHtml(currentFilters.search)}"
          <button onclick="FilterEngine.clearSearch()" title="Remove">×</button>
        </span>
      `;
    }

    chipsContainer.innerHTML = html;
  }

  function clearSearch() {
    currentFilters.search = '';
    updateUrlParam('search', '');
    const input = document.getElementById('shop-search-input');
    if (input) input.value = '';
    applyFilters(1);
  }

  function resetFilters() {
    currentFilters.category = 'all';
    currentFilters.search = '';
    currentFilters.maxPrice = 3500;
    currentFilters.sortBy = 'popularity';
    currentFilters.page = 1;

    try {
      sessionStorage.removeItem('zm_selected_category');
      localStorage.removeItem('zm_selected_category');
    } catch (e) {}

    updateUrlParam('category', '');
    updateUrlParam('search', '');
    updateUrlParam('sort', '');
    updateUrlParam('page', 1);

    if (window.history && window.history.replaceState) {
      const url = new URL(window.location);
      url.searchParams.delete('category');
      url.searchParams.delete('search');
      url.searchParams.delete('sort');
      url.searchParams.set('page', '1');
      url.hash = '';
      window.history.replaceState({}, '', url.toString());
    }

    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('shop-sort-select');
    if (sortSelect) sortSelect.value = 'popularity';

    renderCategoryFilterList();
    applyFilters(1);
  }

  return {
    initShopView,
    setCategory,
    clearSearch,
    resetFilters
  };
})();
