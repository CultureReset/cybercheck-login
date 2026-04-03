/* aWavegent — Profile Section */
aWavegent.register('profile', function(config) {
  const b = config.business || {};
  const initial = (b.name || 'B').charAt(0).toUpperCase();
  const rating = parseFloat(b.rating) || 0;

  return `
    <div class="wg-profile">
      <div class="wg-profile__avatar">
        ${b.avatar_url
          ? `<img src="${aWavegent.esc(b.avatar_url)}" alt="${aWavegent.esc(b.name)}">`
          : `<div class="wg-profile__avatar-placeholder">${initial}</div>`}
      </div>
      <h1 class="wg-profile__name">${aWavegent.esc(b.name || '')}</h1>
      ${b.tagline ? `<p class="wg-profile__tagline">${aWavegent.esc(b.tagline)}</p>` : ''}
      ${rating ? `<div class="wg-profile__rating">${aWavegent.stars(rating)} <span>${rating.toFixed(1)}${b.review_count ? ' &middot; ' + b.review_count + ' reviews' : ''}</span></div>` : ''}
      <div class="wg-profile__actions">
        ${b.phone ? `<a href="tel:${b.phone.replace(/\D/g,'')}" class="wg-call-btn">📞 Call / Text</a>` : ''}
        ${b.directions_url ? `<a href="${aWavegent.esc(b.directions_url)}" class="wg-dir-btn" target="_blank">📍 Directions</a>` : ''}
      </div>
    </div>`;
});
