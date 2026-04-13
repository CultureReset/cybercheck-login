/* aWavegent — Specials Banner (time-aware)
   Shows catch of day, happy hour, or daily special based on current time */

aWavegent.register('specials-banner', function(config) {
  const sp = config.specials || {};
  const banners = [];

  // Happy Hour
  if (sp.happy_hour && sp.happy_hour.start && sp.happy_hour.end) {
    if (aWavegent.isNowBetween(sp.happy_hour.start, sp.happy_hour.end)) {
      const end = _fmtTime(sp.happy_hour.end);
      banners.push({ icon: '🍹', label: 'Happy Hour', value: 'Now until ' + end, sub: sp.happy_hour.description || '' });
    }
  }

  // Catch of the day (show all day if set)
  if (sp.catch_of_day) {
    banners.push({ icon: '🎣', label: "Today's Catch", value: sp.catch_of_day, sub: sp.catch_price ? '$' + sp.catch_price : '' });
  }

  // Daily special
  if (sp.daily_special && sp.daily_special.value) {
    banners.push({ icon: sp.daily_special.icon || '⭐', label: sp.daily_special.label || 'Daily Special', value: sp.daily_special.value, sub: sp.daily_special.sub || '' });
  }

  if (!banners.length) return '';

  return banners.map(b => `
    <div class="wg-special-banner">
      <div class="wg-special-icon">${b.icon}</div>
      <div class="wg-special-text">
        <div class="wg-special-label">${aWavegent.esc(b.label)}</div>
        <div class="wg-special-value">${aWavegent.esc(b.value)}</div>
        ${b.sub ? '<div class="wg-special-sub">' + aWavegent.esc(b.sub) + '</div>' : ''}
      </div>
    </div>`).join('');
});

function _fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h || 12;
  return hr + (m ? ':' + String(m).padStart(2,'0') : '') + ' ' + ampm;
}
