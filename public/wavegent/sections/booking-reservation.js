/* aWavegent — Reservation Booking (Restaurant/Service style, 4-Step)
   Step 1: Pick date
   Step 2: Pick time + party size
   Step 3: Contact details
   Step 4: Confirm */

aWavegent.register('booking-reservation', function(config) {
  const bk = config.booking || {};
  const slots = bk.time_slots || ['5:30 PM','6:00 PM','6:30 PM','7:00 PM','7:30 PM','8:00 PM','8:30 PM','9:00 PM'];
  const maxParty = bk.max_party || 10;
  const modalId = 'modal-booking-reservation';
  const label = bk.label || 'Make a Reservation';
  const sub = bk.sub || 'Book your table online';

  const slotPills = slots.map(s =>
    `<div class="wg-time-pill" onclick="resSelectTime(this, '${aWavegent.esc(s)}')">${aWavegent.esc(s)}</div>`
  ).join('');

  return `
    <div class="wg-link-item" data-modal-open="${modalId}" role="button" tabindex="0">
      <span class="wg-link-icon">📋</span>
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
          <span class="wg-modal__title">Make a Reservation</span>
          <button class="wg-modal__close" data-modal-close>✕</button>
        </div>
        <div class="wg-modal__body" id="res-booking-body">

          <div class="wg-steps" id="res-steps">
            <div class="wg-step wg-step--active" id="res-step-1"><div class="wg-step-dot">1</div><div class="wg-step-label">Date</div></div>
            <div class="wg-step" id="res-step-2"><div class="wg-step-dot">2</div><div class="wg-step-label">Time</div></div>
            <div class="wg-step" id="res-step-3"><div class="wg-step-dot">3</div><div class="wg-step-label">Details</div></div>
            <div class="wg-step" id="res-step-4"><div class="wg-step-dot">4</div><div class="wg-step-label">Confirm</div></div>
          </div>

          <!-- Step 1: Date -->
          <div id="res-panel-1">
            <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:14px;">Choose a date</p>
            <div id="res-calendar"></div>
            <div style="margin-top:20px;">
              <button class="wg-btn wg-btn--primary wg-btn--full" onclick="resNext(2)">Continue →</button>
            </div>
          </div>

          <!-- Step 2: Time + Party -->
          <div id="res-panel-2" style="display:none;">
            <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:14px;">Choose a time</p>
            <div class="wg-time-slots">${slotPills}</div>
            <div style="margin-bottom:20px;">
              <label style="font-size:0.82rem;font-weight:600;color:var(--text-sub);display:block;margin-bottom:10px;">Party size</label>
              <div class="wg-party-size">
                <button class="wg-party-btn" onclick="resChangeParty(-1)">−</button>
                <span class="wg-party-count" id="res-party-count">2</span>
                <button class="wg-party-btn" onclick="resChangeParty(1)">+</button>
                <span style="font-size:0.75rem;color:var(--text-muted);">(max ${maxParty})</span>
              </div>
            </div>
            <div style="display:flex;gap:10px;">
              <button class="wg-btn wg-btn--ghost" onclick="resNext(1)" style="flex:1;">← Back</button>
              <button class="wg-btn wg-btn--primary" onclick="resNext(3)" style="flex:2;">Continue →</button>
            </div>
          </div>

          <!-- Step 3: Details -->
          <div id="res-panel-3" style="display:none;">
            <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:14px;">Your details</p>
            <div class="wg-field"><label>Full Name *</label><input type="text" id="res-name" placeholder="Your name" required></div>
            <div class="wg-field"><label>Phone *</label><input type="tel" id="res-phone" placeholder="(555) 123-4567" required></div>
            <div class="wg-field"><label>Email</label><input type="email" id="res-email" placeholder="your@email.com"></div>
            <div class="wg-field"><label>Special requests (optional)</label><textarea id="res-notes" placeholder="Allergies, celebrations, seating preferences…"></textarea></div>
            <div style="display:flex;gap:10px;">
              <button class="wg-btn wg-btn--ghost" onclick="resNext(2)" style="flex:1;">← Back</button>
              <button class="wg-btn wg-btn--primary" onclick="resNext(4)" style="flex:2;">Continue →</button>
            </div>
          </div>

          <!-- Step 4: Confirm -->
          <div id="res-panel-4" style="display:none;">
            <div class="wg-confirm-box" id="res-confirm-summary"></div>
            <div class="wg-field" style="margin-bottom:12px;">
              <label style="display:flex;align-items:flex-start;gap:8px;font-size:0.8rem;font-weight:400;color:var(--text-sub);cursor:pointer;">
                <input type="checkbox" id="res-sms-consent" style="margin-top:2px;accent-color:var(--accent);" checked>
                I agree to receive an SMS confirmation. Msg &amp; data rates may apply. Reply STOP to opt out.
              </label>
            </div>
            <div style="display:flex;gap:10px;">
              <button class="wg-btn wg-btn--ghost" onclick="resNext(3)" style="flex:1;">← Back</button>
              <button class="wg-btn wg-btn--primary" onclick="resSubmit()" style="flex:2;" id="res-submit-btn">Request Reservation</button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <script>
    (function() {
      var _res = { step: 1, date: null, time: null, party: 2 };

      window.resSelectTime = function(el, time) {
        document.querySelectorAll('#modal-booking-reservation .wg-time-pill').forEach(p => p.classList.remove('wg-time-pill--selected'));
        el.classList.add('wg-time-pill--selected');
        _res.time = time;
      };

      window.resChangeParty = function(delta) {
        _res.party = Math.max(1, Math.min(${maxParty}, _res.party + delta));
        document.getElementById('res-party-count').textContent = _res.party;
      };

      window.resNext = function(step) {
        if (step === 2 && !_res.date) { alert('Please select a date.'); return; }
        if (step === 3 && !_res.time) { alert('Please select a time.'); return; }
        if (step === 4) {
          var name = document.getElementById('res-name').value.trim();
          var phone = document.getElementById('res-phone').value.trim();
          if (!name || !phone) { alert('Please enter your name and phone number.'); return; }
          _buildConfirm();
        }
        _res.step = step;
        for (var i = 1; i <= 4; i++) {
          var panel = document.getElementById('res-panel-' + i);
          if (panel) panel.style.display = i === step ? '' : 'none';
          var stepEl = document.getElementById('res-step-' + i);
          if (stepEl) stepEl.className = 'wg-step' + (i === step ? ' wg-step--active' : (i < step ? ' wg-step--done' : ''));
        }
        if (step === 1 && !document.getElementById('res-calendar').children.length) _renderResCal();
        if (step === 1) _renderResCal();
      };

      function _buildConfirm() {
        document.getElementById('res-confirm-summary').innerHTML =
          '<div class="wg-confirm-row"><span class="wg-confirm-label">Date</span><span class="wg-confirm-value">' + (_res.date || '—') + '</span></div>' +
          '<div class="wg-confirm-row"><span class="wg-confirm-label">Time</span><span class="wg-confirm-value">' + (_res.time || '—') + '</span></div>' +
          '<div class="wg-confirm-row"><span class="wg-confirm-label">Party size</span><span class="wg-confirm-value">' + _res.party + ' guests</span></div>' +
          '<div class="wg-confirm-row"><span class="wg-confirm-label">Name</span><span class="wg-confirm-value">' + document.getElementById('res-name').value + '</span></div>' +
          '<div class="wg-confirm-row"><span class="wg-confirm-label">SMS confirmation</span><span class="wg-confirm-value">✓ Will be sent</span></div>';
      }

      function _renderResCal() {
        var cal = document.getElementById('res-calendar');
        var now = new Date(); var year = now.getFullYear(), month = now.getMonth();
        if (cal._year) { year = cal._year; month = cal._month; }
        var dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        function render(y, m) {
          var first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
          var today = new Date(); today.setHours(0,0,0,0);
          var html = '<div class="wg-calendar"><div class="wg-cal-header"><button class="wg-cal-nav" onclick="resCalNav(-1)">‹</button><span class="wg-cal-month">' + months[m] + ' ' + y + '</span><button class="wg-cal-nav" onclick="resCalNav(1)">›</button></div><div class="wg-cal-grid">';
          dayLabels.forEach(d => { html += '<div class="wg-cal-day-label">' + d + '</div>'; });
          for (var i = 0; i < first; i++) html += '<div class="wg-cal-day wg-cal-day--empty"></div>';
          for (var d = 1; d <= days; d++) {
            var date = new Date(y, m, d); date.setHours(0,0,0,0);
            var isPast = date < today;
            var ms = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var dateStr = ms[m] + ' ' + d + ', ' + y;
            var isSel = _res.date === dateStr;
            html += '<div class="wg-cal-day' + (isPast ? ' wg-cal-day--past' : '') + (isSel ? ' wg-cal-day--selected' : '') + '" onclick="resPickDate(' + y + ',' + m + ',' + d + ')">' + d + '</div>';
          }
          html += '</div></div>';
          cal.innerHTML = html; cal._year = y; cal._month = m;
        }
        window.resCalNav = function(dir) { var y = cal._year, m = cal._month + dir; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } render(y, m); };
        window.resPickDate = function(y, m, d) { var ms = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; _res.date = ms[m] + ' ' + d + ', ' + y; render(y, m); };
        render(year, month);
      }

      window.resSubmit = function() {
        var btn = document.getElementById('res-submit-btn');
        btn.textContent = 'Submitting…'; btn.disabled = true;
        setTimeout(function() {
          document.getElementById('res-booking-body').innerHTML =
            '<div class="wg-success"><div class="wg-success-icon">✓</div><h3>Reservation Requested!</h3><p>You\'ll receive an SMS confirmation shortly. We look forward to seeing you! 🍽️</p></div>';
        }, 1200);
      };

      _renderResCal();
    })();
    </script>`;
});
