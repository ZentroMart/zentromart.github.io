/**
 * ZentroMart — Pagination Engine
 * Critical Requirement: Exactly 25 Products Per Page
 */

const PaginationEngine = (() => {
  const PAGE_SIZE = ZM_CONFIG.PAGE_SIZE; // 25 items per page

  /**
   * Slice array for the active page
   */
  function paginateItems(items, currentPage = 1) {
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = (safePage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      currentPage: safePage,
      totalPages,
      totalItems,
      startIndex: totalItems === 0 ? 0 : startIndex + 1,
      endIndex
    };
  }

  /**
   * Render accessible pagination controls into a container
   */
  function renderPaginationControls(paginationData, onPageChangeCallback) {
    const container = document.getElementById('pagination-wrapper');
    if (!container) return;

    const { currentPage, totalPages, totalItems } = paginationData;

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let buttonsHtml = '';

    // Previous Button
    const prevDisabled = currentPage === 1;
    buttonsHtml += `
      <button class="pagination-btn" ${prevDisabled ? 'disabled' : ''} 
              onclick="PaginationEngine.handlePageClick(${currentPage - 1})"
              aria-label="Previous Page" title="Previous Page">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>Prev</span>
      </button>
    `;

    // Page Number Pills
    for (let p = 1; p <= totalPages; p++) {
      const isActive = p === currentPage;
      buttonsHtml += `
        <button class="pagination-btn ${isActive ? 'active' : ''}" 
                onclick="PaginationEngine.handlePageClick(${p})"
                aria-current="${isActive ? 'page' : 'false'}"
                aria-label="Page ${p}">
          ${p}
        </button>
      `;
    }

    // Next Button
    const nextDisabled = currentPage === totalPages;
    buttonsHtml += `
      <button class="pagination-btn" ${nextDisabled ? 'disabled' : ''} 
              onclick="PaginationEngine.handlePageClick(${currentPage + 1})"
              aria-label="Next Page" title="Next Page">
        <span>Next</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    `;

    container.innerHTML = buttonsHtml;
  }

  function handlePageClick(page) {
    updateUrlParam('page', page);
    if (typeof window.onShopFilterOrPageChange === 'function') {
      window.onShopFilterOrPageChange(page);
    }
    scrollToElement('#shop-products-container', 120);
  }

  return {
    PAGE_SIZE,
    paginateItems,
    renderPaginationControls,
    handlePageClick
  };
})();
