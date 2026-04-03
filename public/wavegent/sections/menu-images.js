/* aWavegent — Menu (With Images)
   Same as menu-text but renders photo thumbnails per item. */

aWavegent.register('menu-images', function(config, sectionDef) {
  const menu = config.menu || {};
  const categories = menu.categories || [];
  const modalId = sectionDef.modal_id || 'modal-menu-images';
  const label = sectionDef.label || 'View Menu';
  const sub = sectionDef.sub || 'Tap items to see photos & details';
  const icon = sectionDef.icon || '🍽️';

  const cats = categories.map(cat => {
    const items = (cat.items || []).map(item => `
      <div class="wg-menu-item">
        ${item.image_url ? `<img class="wg-menu-img" src="${aWavegent.esc(item.image_url)}" alt="${aWavegent.esc(item.name)}" loading="lazy">` : ''}
        <div class="wg-menu-info">
          <div class="wg-menu-name">${aWavegent.esc(item.name)}</div>
          ${item.description ? `<div class="wg-menu-desc">${aWavegent.esc(item.description)}</div>` : ''}
          ${item.popular_count ? `<div style="font-size:0.7rem;color:var(--accent);margin-top:4px;">🔥 ${item.popular_count} guests ordered this</div>` : ''}
        </div>
        <div class="wg-menu-price">${item.price ? '$' + item.price : ''}</div>
      </div>`).join('');
    return `<div class="wg-menu-category"><div class="wg-menu-cat-title">${aWavegent.esc(cat.name)}</div>${items}</div>`;
  }).join('');

  return `
    <div class="wg-link-item" data-modal-open="${modalId}" role="button" tabindex="0">
      <span class="wg-link-icon">${icon}</span>
      <div class="wg-link-text">
        <div class="wg-link-title">${aWavegent.esc(label)}</div>
        <div class="wg-link-sub">${aWavegent.esc(sub)}</div>
      </div>
      <span class="wg-link-arrow">›</span>
    </div>
    <div class="wg-modal" id="${modalId}" role="dialog">
      <div class="wg-modal__overlay" data-modal-close></div>
      <div class="wg-modal__box">
        <div class="wg-modal__handle"></div>
        <div class="wg-modal__header">
          <span class="wg-modal__title">${icon} ${aWavegent.esc(label)}</span>
          <button class="wg-modal__close" data-modal-close>✕</button>
        </div>
        <div class="wg-modal__body">${cats || '<p style="color:var(--text-muted);">Menu coming soon.</p>'}</div>
      </div>
    </div>`;
});
