/**
 * ZentroMart — Fast Client-Side Search Engine with Live Autocomplete
 */

const SearchEngine = (() => {
  let activeIndex = -1;

  function initSearchInputs() {
    const inputs = document.querySelectorAll('.search-input');
    inputs.forEach(input => {
      const wrap = input.closest('.header-search') || input.parentElement;
      const dropdown = wrap.querySelector('.search-suggestions-dropdown');
      const clearBtn = wrap.querySelector('.search-clear-btn');

      input.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        if (clearBtn) clearBtn.classList.toggle('active', query.length > 0);

        if (query.length < 2) {
          if (dropdown) dropdown.classList.remove('open');
          return;
        }

        const results = await performSearch(query);
        renderSuggestions(results, dropdown);
      }, 200));

      input.addEventListener('keydown', (e) => {
        if (!dropdown || !dropdown.classList.contains('open')) return;
        const items = dropdown.querySelectorAll('.search-suggestion-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeIndex = (activeIndex + 1) % items.length;
          updateActiveSuggestion(items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeIndex = (activeIndex - 1 + items.length) % items.length;
          updateActiveSuggestion(items);
        } else if (e.key === 'Enter') {
          if (activeIndex > -1 && items[activeIndex]) {
            e.preventDefault();
            items[activeIndex].click();
          }
        } else if (e.key === 'Escape') {
          dropdown.classList.remove('open');
        }
      });

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          input.value = '';
          clearBtn.classList.remove('active');
          if (dropdown) dropdown.classList.remove('open');
          input.focus();
        });
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-search')) {
        document.querySelectorAll('.search-suggestions-dropdown').forEach(d => d.classList.remove('open'));
      }
    });
  }

  function updateActiveSuggestion(items) {
    items.forEach((item, idx) => {
      item.classList.toggle('active', idx === activeIndex);
    });
  }

  async function performSearch(query) {
    const products = await ProductEngine.getAllProducts();
    const q = query.toLowerCase();

    return products.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const skuMatch = p.id.toLowerCase().includes(q);
      const catMatch = p.category.toLowerCase().includes(q) || (p.subcategory && p.subcategory.toLowerCase().includes(q));
      const descMatch = p.description.toLowerCase().includes(q);
      return nameMatch || skuMatch || catMatch || descMatch;
    }).slice(0, 8); // Top 8 suggestions for instant response
  }

  function renderSuggestions(results, dropdown) {
    if (!dropdown) return;
    activeIndex = -1;

    if (!results || results.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
          No matching products found. Try searching for spices, daal, flour, sauces, or cheese.
        </div>
      `;
      dropdown.classList.add('open');
      return;
    }

    let html = '';
    results.forEach(product => {
      const firstImage = (product.images && product.images.length > 0)
        ? product.images[0]
        : 'assets/images/placeholder.svg';

      html += `
        <div class="search-suggestion-item" onclick="window.location.href='product.html?id=${encodeURIComponent(product.id)}'">
          <img src="${encodeURI(firstImage)}" alt="${escapeHtml(product.name)}" class="search-suggestion-thumb" onerror="handleImageError(this)">
          <div class="search-suggestion-info">
            <div class="search-suggestion-title">${escapeHtml(product.name)}</div>
            <div class="search-suggestion-meta">
              <span>${escapeHtml(product.category)}</span>
              <span>•</span>
              <span class="search-suggestion-price">${formatPrice(product.price)}</span>
            </div>
          </div>
        </div>
      `;
    });

    dropdown.innerHTML = html;
    dropdown.classList.add('open');
  }

  return {
    initSearchInputs,
    performSearch
  };
})();
