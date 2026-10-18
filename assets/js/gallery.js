/**
 * ZentroMart — Multi-Image Product Gallery & Lightbox
 */

const GalleryEngine = (() => {
  let images = [];
  let currentIndex = 0;

  function initGallery(productImages = []) {
    images = productImages && productImages.length > 0
      ? productImages
      : ['assets/images/placeholder.svg'];
    currentIndex = 0;

    renderGallery();
    initKeyboardNav();
  }

  function renderGallery() {
    const mainImgEl = document.getElementById('gallery-main-img');
    const thumbsContainer = document.getElementById('gallery-thumbs-wrapper');
    const prevBtn = document.getElementById('gallery-prev-btn');
    const nextBtn = document.getElementById('gallery-next-btn');

    if (mainImgEl) {
      mainImgEl.src = encodeURI(images[currentIndex]);
      mainImgEl.alt = `Product view ${currentIndex + 1}`;
    }

    if (thumbsContainer) {
      if (images.length <= 1) {
        thumbsContainer.style.display = 'none';
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
      } else {
        thumbsContainer.style.display = 'flex';
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';

        let html = '';
        images.forEach((imgSrc, idx) => {
          const isActive = idx === currentIndex;
          html += `
            <button class="gallery-thumb-btn ${isActive ? 'active' : ''}" 
                    onclick="GalleryEngine.setIndex(${idx})" 
                    aria-label="View image ${idx + 1}">
              <img src="${encodeURI(imgSrc)}" alt="Thumbnail ${idx + 1}" onerror="handleImageError(this)">
            </button>
          `;
        });
        thumbsContainer.innerHTML = html;
      }
    }
  }

  function setIndex(index) {
    if (index >= 0 && index < images.length) {
      currentIndex = index;
      const mainImg = document.getElementById('gallery-main-img');
      if (mainImg) {
        mainImg.style.opacity = '0.5';
        mainImg.src = encodeURI(images[currentIndex]);
        setTimeout(() => { mainImg.style.opacity = '1'; }, 100);
      }

      document.querySelectorAll('.gallery-thumb-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === currentIndex);
      });
    }
  }

  function next() {
    const nextIdx = (currentIndex + 1) % images.length;
    setIndex(nextIdx);
  }

  function prev() {
    const prevIdx = (currentIndex - 1 + images.length) % images.length;
    setIndex(prevIdx);
  }

  function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('gallery-main-img')) return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  }

  return {
    initGallery,
    setIndex,
    next,
    prev
  };
})();
