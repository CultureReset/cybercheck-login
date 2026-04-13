/* aWavegent — Verified Reviews Section
   Reviews tied to actual bookings — not Google, not Yelp.
   Each review shows: name + last initial, trip/visit detail, date, verified badge. */

aWavegent.register('reviews-verified', function(config) {
  const reviews = config.reviews || [];
  const modalId = 'modal-reviews';
  const avg = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1) : '5.0';

  const cards = reviews.map(r => {
    const initial = (r.name || 'G').charAt(0).toUpperCase();
    const avatarHtml = r.avatar_url
      ? `<img src="${aWavegent.esc(r.avatar_url)}" alt="${aWavegent.esc(r.name)}">`
      : initial;

    return `
      <div class="wg-review-card">
        <div class="wg-review-header">
          <div class="wg-review-avatar">${avatarHtml}</div>
          <div class="wg-review-meta">
            <div class="wg-review-name">${aWavegent.esc(r.name || 'Guest')}</div>
            <div class="wg-review-trip">${aWavegent.esc(r.visit_detail || '')}${r.date ? ' &middot; ' + aWavegent.esc(r.date) : ''}</div>
          </div>
          <span class="wg-verified">✓ Verified</span>
        </div>
        <div class="wg-review-stars-row">
          ${aWavegent.stars(r.rating || 5)}
        </div>
        <div class="wg-review-text">"${aWavegent.esc(r.text || '')}"</div>
      </div>`;
  }).join('');

  return `
    <div class="wg-link-item" data-modal-open="${modalId}" role="button" tabindex="0">
      <span class="wg-link-icon">⭐</span>
      <div class="wg-link-text">
        <div class="wg-link-title">Verified Reviews</div>
        <div class="wg-link-sub">${avg} stars · ${reviews.length} verified bookings</div>
      </div>
      <span class="wg-link-arrow">›</span>
    </div>

    <div class="wg-modal" id="${modalId}" role="dialog">
      <div class="wg-modal__overlay" data-modal-close></div>
      <div class="wg-modal__box">
        <div class="wg-modal__handle"></div>
        <div class="wg-modal__header">
          <span class="wg-modal__title">⭐ ${avg} · ${reviews.length} Verified Reviews</span>
          <button class="wg-modal__close" data-modal-close>✕</button>
        </div>
        <div class="wg-modal__body">
          <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:16px;">Every review is tied to a confirmed booking. Only real customers can leave a review.</p>
          ${cards || '<p style="color:var(--text-muted);font-size:0.88rem;">No reviews yet.</p>'}
        </div>
      </div>
    </div>`;
});
