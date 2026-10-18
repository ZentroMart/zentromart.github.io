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

  async function initShopView() {
    const productsContainer = document.getElementById('shop-products-container');
    if (!productsContainer) return;

    allProductsCache = await ProductEngine.getAllProducts();
    await renderCategoryFilterList();

    // Read initial params from URL
    const urlCategory = getUrlParam('category') || 'all';
    const urlSearch = getUrlParam('search') || '';
    const urlSort = getUrlParam('sort') || 'popularity';
    const urlPage = parseInt(getUrlParam('page'), 10) || 1;

    currentFilters.category = urlCategory;
    currentFilters.search = urlSearch;
    currentFilters.sortBy = urlSort;
    currentFilters.page = urlPage;

    // Sync input states
    const searchInput = document.getElementById('shop-search-input');
    if (searchInput && urlSearch) searchInput.value = urlSearch;

    const sortSelect = document.getElementById('shop-sort-select');
    if (sortSelect) sortSelect.value = urlSort;

    const priceSlider = document.getElementById('shop-price-slider');
    const priceDisplay = document.getElementById('shop-price-display');
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        currentFilters.maxPrice = parseInt(e.target.value, 10);
        if (priceDisplay) priceDisplay.textContent = formatPrice(currentFilters.maxPrice);
        applyFilters(1); // reset to page 1 on filter change
      });
    }

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
      countMap[p.categorySlug] = (countMap[p.categorySlug] || 0) + 1;
    });

    let html = `
      <li>
        <div class="category-radio-btn ${currentFilters.category === 'all' ? 'active' : ''}" 
             onclick="FilterEngine.setCategory('all')">
          <span>All Categories</span>
          <span class="count-badge">${products.length}</span>
        </div>
      </li>
    `;

    categories.forEach(cat => {
      const count = countMap[cat.slug] || 0;
      const isActive = currentFilters.category === cat.slug;
      html += `
        <li>
          <div class="category-radio-btn ${isActive ? 'active' : ''}" 
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
    currentFilters.category = slug;
    updateUrlParam('category', slug === 'all' ? '' : slug);

    // Update active class in sidebar
    document.querySelectorAll('.category-radio-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const clickedBtn = event.currentTarget || document.querySelector(`.category-radio-btn[onclick*="${slug}"]`);
    if (clickedBtn) clickedBtn.classList.add('active');

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

    // 1. Category Filter
    if (currentFilters.category && currentFilters.category !== 'all') {
      filtered = filtered.filter(p => p.categorySlug === currentFilters.category);
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

    // 3. Price Filter
    if (currentFilters.maxPrice) {
      filtered = filtered.filter(p => p.price <= currentFilters.maxPrice);
    }

    // 4. Sorting
    switch (currentFilters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
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

    updateUrlParam('category', '');
    updateUrlParam('search', '');
    updateUrlParam('sort', '');
    updateUrlParam('page', 1);

    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) searchInput.value = '';

    const priceSlider = document.getElementById('shop-price-slider');
    if (priceSlider) priceSlider.value = 3500;

    const priceDisplay = document.getElementById('shop-price-display');
    if (priceDisplay) priceDisplay.textContent = formatPrice(3500);

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
