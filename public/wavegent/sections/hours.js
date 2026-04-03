/* aWavegent — Hours Section */

aWavegent.register('hours', function(config, sectionConfig) {
  const hours = config.hours || {};
  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const labels = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const today = aWavegent.todayKey();

  const b = config.business || {};
  const addr = b.address || '';
  const phone = b.phone || '';

  const rows = days.map((d, i) => {
    const h = hours[d];
    const isToday = d === today;
    const val = h ? (h.closed ? 'Closed' : (h.open + ' – ' + h.close)) : '—';
    return `<tr class="${isToday ? 'wg-hours-today' : ''}">
      <td>${labels[i]}</td>
      <td>${aWavegent.esc(val)}</td>
    </tr>`;
  }).join('');

  const modalId = 'modal-hours';

  return `
    <div class="wg-link-item" data-modal-open="${modalId}" role="button" tabindex="0">
      <span class="wg-link-icon">🕐</span>
      <div class="wg-link-text">
        <div class="wg-link-title">Hours &amp; Location</div>
        <div class="wg-link-sub">${_openStatus(hours, today)}</div>
      </div>
      <span class="wg-link-arrow">›</span>
    </div>

    <div class="wg-modal" id="${modalId}" role="dialog">
      <div class="wg-modal__overlay" data-modal-close></div>
      <div class="wg-modal__box">
        <div class="wg-modal__handle"></div>
        <div class="wg-modal__header">
          <span class="wg-modal__title">Hours &amp; Location</span>
          <button class="wg-modal__close" data-modal-close>✕</button>
        </div>
        <div class="wg-modal__body">
          <table class="wg-hours-table">${rows}</table>
          ${addr ? `<div class="wg-divider"></div><div style="font-size:0.88rem;color:var(--text-sub);">📍 ${aWavegent.esc(addr)}</div>` : ''}
          ${phone ? `<div style="margin-top:10px;font-size:0.88rem;color:var(--text-sub);">📞 ${aWavegent.esc(phone)}</div>` : ''}
        </div>
      </div>
    </div>`;
});

function _openStatus(hours, today) {
  const h = hours[today];
  if (!h || h.closed) return 'Closed today';
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = h.open.replace(/[AP]M/i,'').trim().split(':').map(Number);
  const [ch, cm] = h.close.replace(/[AP]M/i,'').trim().split(':').map(Number);
  const isPM_o = /PM/i.test(h.open), isPM_c = /PM/i.test(h.close);
  const openMin  = (oh + (isPM_o && oh < 12 ? 12 : 0)) * 60 + (om||0);
  const closeMin = (ch + (isPM_c && ch < 12 ? 12 : 0)) * 60 + (cm||0);
  if (cur >= openMin && cur < closeMin) return '🟢 Open now · Closes ' + h.close;
  if (cur < openMin) return '🔴 Opens today at ' + h.open;
  return '🔴 Closed now · Opens ' + (hours.monday ? hours.monday.open : 'tomorrow');
}
