/* aWavegent — Gallery Grid Section */

aWavegent.register('gallery-grid', function(config) {
  const gallery = config.gallery || [];
  if (!gallery.length) return '';
  const modalId = 'modal-gallery';

  const thumbs = gallery.slice(0, 9).map((img, i) =>
    `<div class="wg-gallery-thumb" onclick="galleryOpen(${i})">
      <img src="${aWavegent.esc(img.url)}" alt="${aWavegent.esc(img.caption || '')}" loading="lazy">
    </div>`
  ).join('');

  const fullImgs = gallery.map((img, i) =>
    `<div id="gal-slide-${i}" style="display:${i===0?'block':'none'};text-align:center;">
      <img src="${aWavegent.esc(img.url)}" alt="${aWavegent.esc(img.caption || '')}" style="max-width:100%;border-radius:10px;margin:0 auto;">
      ${img.caption ? `<p style="font-size:0.82rem;color:var(--text-muted);margin-top:10px;">${aWavegent.esc(img.caption)}</p>` : ''}
    </div>`
  ).join('');

  return `
    <div class="wg-link-item" data-modal-open="${modalId}" role="button" tabindex="0">
      <span class="wg-link-icon">📸</span>
      <div class="wg-link-text">
        <div class="wg-link-title">Photos</div>
        <div class="wg-link-sub">${gallery.length} photos</div>
      </div>
      <span class="wg-link-arrow">›</span>
    </div>

    <div class="wg-modal" id="${modalId}" role="dialog">
      <div class="wg-modal__overlay" data-modal-close></div>
      <div class="wg-modal__box">
        <div class="wg-modal__handle"></div>
        <div class="wg-modal__header">
          <span class="wg-modal__title">📸 Photos</span>
          <button class="wg-modal__close" data-modal-close>✕</button>
        </div>
        <div class="wg-modal__body">
          <div class="wg-gallery-grid">${thumbs}</div>
        </div>
      </div>
    </div>

    <div class="wg-modal" id="modal-gallery-lightbox" role="dialog">
      <div class="wg-modal__overlay" onclick="galleryClose()"></div>
      <div style="position:relative;z-index:1;width:100%;max-width:560px;margin:auto;padding:20px;">
        <button onclick="galleryClose()" style="position:absolute;top:0;right:0;background:rgba(0,0,0,0.7);color:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:1.1rem;z-index:2;">✕</button>
        <button onclick="galleryNav(-1)" style="position:absolute;left:0;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.6);color:white;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.2rem;z-index:2;">‹</button>
        <button onclick="galleryNav(1)" style="position:absolute;right:0;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.6);color:white;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.2rem;z-index:2;">›</button>
        ${fullImgs}
      </div>
    </div>

    <script>
    (function() {
      var _galIdx = 0, _galTotal = ${gallery.length};
      window.galleryOpen = function(i) {
        _galIdx = i;
        for (var j = 0; j < _galTotal; j++) {
          var el = document.getElementById('gal-slide-' + j);
          if (el) el.style.display = j === i ? 'block' : 'none';
        }
        document.getElementById('modal-gallery-lightbox').classList.add('wg-modal--open');
        document.body.style.overflow = 'hidden';
      };
      window.galleryClose = function() {
        document.getElementById('modal-gallery-lightbox').classList.remove('wg-modal--open');
        document.body.style.overflow = '';
      };
      window.galleryNav = function(dir) {
        var el = document.getElementById('gal-slide-' + _galIdx);
        if (el) el.style.display = 'none';
        _galIdx = (_galIdx + dir + _galTotal) % _galTotal;
        var next = document.getElementById('gal-slide-' + _galIdx);
        if (next) next.style.display = 'block';
      };
    })();
    </script>`;
});
