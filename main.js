/**
 * fb-portfolio — main.js
 *
 * 1. Nav: hide on scroll down, show on scroll up
 * 2. Lightbox: click any img[data-lightbox] to open full-screen viewer
 *              navigate with arrows or keyboard, close with ESC or backdrop
 */

(function () {
  'use strict';

  /* ============================================================
     1. NAV — hide on scroll down, reveal on scroll up
     ============================================================ */

  const nav = document.querySelector('nav');

  if (nav) {
    let lastY      = window.scrollY;
    let hidden     = false;
    const THRESHOLD = 80; // px from top before hiding kicks in

    window.addEventListener('scroll', () => {
      const y     = window.scrollY;
      const delta = y - lastY;

      if (y < THRESHOLD) {
        // Always show near top
        if (hidden) { nav.classList.remove('nav-hidden'); hidden = false; }
      } else if (delta > 4 && !hidden) {
        // Scrolling down — hide
        nav.classList.add('nav-hidden');
        hidden = true;
      } else if (delta < -4 && hidden) {
        // Scrolling up — show
        nav.classList.remove('nav-hidden');
        hidden = false;
      }

      lastY = y;
    }, { passive: true });
  }

  /* ============================================================
     2. LIGHTBOX
     Add data-lightbox to any <img> to make it openable.
     band.js and other init scripts can call window.initLightbox()
     after adding images dynamically.
     ============================================================ */

  // Build DOM once
  const overlay = document.createElement('div');
  overlay.id = 'lb-overlay';
  overlay.innerHTML = `
    <button class="lb-close" aria-label="Close">✕</button>
    <button class="lb-prev"  aria-label="Previous">&#8592;</button>
    <button class="lb-next"  aria-label="Next">&#8594;</button>
    <div class="lb-img-wrap">
      <img class="lb-img" src="" alt="" />
    </div>
    <p class="lb-caption"></p>
  `;
  document.body.appendChild(overlay);

  const lbImg     = overlay.querySelector('.lb-img');
  const lbCaption = overlay.querySelector('.lb-caption');
  const lbClose   = overlay.querySelector('.lb-close');
  const lbPrev    = overlay.querySelector('.lb-prev');
  const lbNext    = overlay.querySelector('.lb-next');

  let items  = []; // all lightbox-enabled imgs on page
  let current = 0;

  function open(index) {
    current = index;
    const img = items[current];
    lbImg.src        = img.src;
    lbImg.alt        = img.alt;
    lbCaption.textContent = img.alt || '';
    overlay.classList.add('lb-open');
    document.body.style.overflow = 'hidden';
    updateArrows();
  }

  function close() {
    overlay.classList.remove('lb-open');
    document.body.style.overflow = '';
    resetZoom();
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  function navigate(dir) {
    current = (current + dir + items.length) % items.length;
    resetZoom();
    lbImg.classList.add('lb-fade');
    setTimeout(() => {
      const img = items[current];
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = img.alt || '';
      lbImg.classList.remove('lb-fade');
    }, 150);
    updateArrows();
  }

  function updateArrows() {
    lbPrev.style.display = items.length > 1 ? '' : 'none';
    lbNext.style.display = items.length > 1 ? '' : 'none';
  }

  // Event listeners
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click',  () => navigate(-1));
  lbNext.addEventListener('click',  () => navigate(+1));

  // Click backdrop to close
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.classList.contains('lb-img-wrap')) close();
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('lb-open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(+1);
  });

  // Touch swipe + pinch zoom
  let touchStartX = 0;
  let touchStartY = 0;
  let lastTap     = 0;

  // Zoom state
  let scale     = 1;
  let originX   = 0;
  let originY   = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let isDragging = false;

  function applyTransform() {
    lbImg.style.transform = `scale(${scale}) translate(${originX}px, ${originY}px)`;
    lbImg.style.cursor = scale > 1 ? 'grab' : 'default';
  }

  function resetZoom() {
    scale = 1; originX = 0; originY = 0;
    lbImg.style.transform = '';
    lbImg.style.cursor = 'default';
  }

  function zoomTo(s, cx, cy) {
    // cx, cy: click position relative to image center
    scale = s;
    if (scale === 1) { originX = 0; originY = 0; }
    applyTransform();
  }

  // Double-click zoom
  lbImg.addEventListener('dblclick', e => {
    if (scale === 1) {
      const rect = lbImg.getBoundingClientRect();
      const cx = (e.clientX - rect.left - rect.width  / 2) / scale;
      const cy = (e.clientY - rect.top  - rect.height / 2) / scale;
      scale = 2.5;
      originX = -cx * 0.6;
      originY = -cy * 0.6;
      applyTransform();
    } else {
      resetZoom();
    }
  });

  // Mouse drag when zoomed
  lbImg.addEventListener('mousedown', e => {
    if (scale <= 1) return;
    isDragging = true;
    dragStartX = e.clientX - originX * scale;
    dragStartY = e.clientY - originY * scale;
    lbImg.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    originX = (e.clientX - dragStartX) / scale;
    originY = (e.clientY - dragStartY) / scale;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    lbImg.style.cursor = scale > 1 ? 'grab' : 'default';
  });

  // Touch events
  let pinchStartDist = 0;
  let pinchStartScale = 1;

  overlay.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      // Pinch start
      pinchStartDist  = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartScale = scale;
      e.preventDefault();
    } else if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      if (scale > 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX - originX * scale;
        dragStartY = e.touches[0].clientY - originY * scale;
      }
      // Double-tap detection
      const now = Date.now();
      if (now - lastTap < 300) {
        if (scale === 1) {
          scale = 2.5; applyTransform();
        } else {
          resetZoom();
        }
      }
      lastTap = now;
    }
  }, { passive: false });

  overlay.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale = Math.min(4, Math.max(1, pinchStartScale * (dist / pinchStartDist)));
      if (scale === 1) { originX = 0; originY = 0; }
      applyTransform();
      e.preventDefault();
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      originX = (e.touches[0].clientX - dragStartX) / scale;
      originY = (e.touches[0].clientY - dragStartY) / scale;
      applyTransform();
      e.preventDefault();
    }
  }, { passive: false });

  overlay.addEventListener('touchend', e => {
    isDragging = false;
    if (e.touches.length === 0 && scale <= 1) {
      // Swipe to navigate only when not zoomed
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (Math.abs(dx) > 50 && dy < 60) navigate(dx < 0 ? 1 : -1);
    }
    // Snap scale to 1 if pinched below threshold
    if (scale < 1.1) resetZoom();
  });

  /**
   * Scan page for data-lightbox imgs and attach click handlers.
   * Call this after any dynamic content is added.
   */
  function initLightbox() {
    items = Array.from(document.querySelectorAll('img[data-lightbox]'));
    items.forEach((img, i) => {
      // Avoid duplicate listeners
      img.removeEventListener('click', img._lbHandler);
      img._lbHandler = () => open(i);
      img.addEventListener('click', img._lbHandler);
      img.style.cursor = 'zoom-in';
    });
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }

  // Expose so band.js or other scripts can re-init after images load
  window.initLightbox = initLightbox;

})();
