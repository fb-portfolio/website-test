/**
 * fb-portfolio — band.js
 * 
 * Makes every .img-band behave like a "justified row":
 *   - All images share the same height
 *   - Together they fill the available width (minus gaps)
 *   - Each image keeps its natural proportions
 *
 * Usage in HTML:
 *   <div class="img-band" data-gap="4">
 *     <img src="a.jpg" alt="…">
 *     <img src="b.jpg" alt="…">
 *     <img src="c.jpg" alt="…">
 *   </div>
 *
 * data-gap (optional): pixel gap between images, default 4
 */

(function () {
  'use strict';

  /**
   * Layout a single band.
   * @param {HTMLElement} band
   */
  function layoutBand(band) {
    const imgs   = Array.from(band.querySelectorAll('img'));
    const gap    = parseInt(band.dataset.gap ?? '4', 10);
    const style  = getComputedStyle(band);
    const total  = band.clientWidth
                   - parseFloat(style.paddingLeft)
                   - parseFloat(style.paddingRight);

    if (!total || imgs.length === 0) return;

    // Collect aspect ratios — only possible once images are loaded
    const ratios = imgs.map(img => {
      const w = img.naturalWidth  || img.width  || 1;
      const h = img.naturalHeight || img.height || 1;
      return w / h;
    });

    const sumRatios  = ratios.reduce((a, b) => a + b, 0);
    const totalGaps  = gap * (imgs.length - 1);
    const available  = total - totalGaps;

    const isPlan = band.classList.contains('img-band-plan');

    imgs.forEach((img, i) => {
      const w = (ratios[i] / sumRatios) * available;
      img.style.width  = w + 'px';
      img.style.flexShrink = '0';
      if (isPlan) {
        img.style.height = 'auto'; // natural proportions for drawings
      }
      // photo bands: height comes from CSS (50vh), object-fit:cover fills it
    });
  }

  /**
   * Layout all bands on the page.
   */
  function layoutAll() {
    document.querySelectorAll('.img-band').forEach(layoutBand);
  }

  /**
   * Wait for all images in a band to have naturalWidth,
   * then run the layout.
   */
  function initBand(band) {
    const imgs = Array.from(band.querySelectorAll('img'));

    const promises = imgs.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise(resolve => {
            img.addEventListener('load',  resolve, { once: true });
            img.addEventListener('error', resolve, { once: true }); // still layout on error
          })
    );

    Promise.all(promises).then(() => {
      layoutBand(band);
      if (window.initLightbox) window.initLightbox();
    });
  }

  // Init on DOM ready
  function init() {
    document.querySelectorAll('.img-band').forEach(initBand);

    // Re-layout on window resize (debounced)
    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(layoutAll, 60);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
