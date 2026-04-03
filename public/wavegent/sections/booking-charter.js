/* aWavegent — Charter Booking Section (4-Step)
   Step 1: Pick trip type
   Step 2: Pick date from calendar
   Step 3: Party size + contact info
   Step 4: Confirm + submit */

aWavegent.register('booking-charter', function(config) {
  const bk = config.booking || {};
  const trips = bk.trips || [];
  const modalId = 'modal-booking-charter';

  const tripOptions = trips.map(t =>
    `<option value="${aWavegent.esc(t.id || t.name)}" data-price="${t.price || ''}" data-guests="${t.max_guests || 6}">${aWavegent.esc(t.name)}${t.duration ? ' (' + t.duration + ')' : ''}${t.price ? ' — $' + t.price : ''}</option>`
  ).join('');

  return `
    <div class="wg-link-item" data-modal-open="${modalId}" role="button" tabindex="0">
      <span class="wg-link-icon">📅</span>
      <div class="wg-link-text">
        <div class="wg-link-title">Book a Trip</div>
        <div class="wg-link-sub">Check availability &amp; reserve your spot</div>
      </div>
      <span class="wg-link-arrow">›</span>
    </div>

    <div class="wg-modal" id="${modalId}" role="dialog">
      <div class="wg-modal__overlay" data-modal-close></div>
      <div class="wg-modal__box">
        <div class="wg-modal__handle"></div>
        <div class="wg-modal__header">
          <span class="wg-modal__title">Book Your Trip</span>
          <button class="wg-modal__close" data-modal-close>✕</button>
        </div>
        <div class="wg-modal__body" id="charter-booking-body">

          <!-- STEP PROGRESS -->
          <div class="wg-steps" id="charter-steps">
            <div class="wg-step wg-step--active" id="charter-step-1">
              <div class="wg-step-dot">1</div>
              <div class="wg-step-label">Trip</div>
            </div>
            <div class="wg-step" id="charter-step-2">
              <div class="wg-step-dot">2</div>
              <div class="wg-step-label">Date</div>
            </div>
            <div class="wg-step" id="charter-step-3">
              <div class="wg-step-dot">3</div>
              <div class="wg-step-label">Details</div>
            </div>
            <div class="wg-step" id="charter-step-4">
              <div class="wg-step-dot">4</div>
              <div class="wg-step-label">Confirm</div>
            </div>
          </div>

          <!-- STEP 1: Trip Type -->
          <div id="charter-panel-1">
            <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:16px;">Choose your trip type</p>
            <div class="wg-field">
              <label>Trip Type</label>
              <select id="charter-trip-select" onchange="charterSelectTrip(this)">
                <option value="">— Select a trip —</option>
                ${tripOptions}
              </select>
            </div>
            <div id="charter-trip-detail" style="display:none;background:var(--link-bg);border-radius:10px;padding:14px;margin-bottom:16px;font-size:0.85rem;color:var(--text-sub);line-height:1.6;"></div>
            <div style="margin-top:20px;">
              <button class="wg-btn wg-btn--primary wg-btn--full" onclick="charterNext(2)">Continue →</button>
            </div>
          </div>

          <!-- STEP 2: Date -->
          <div id="charter-panel-2" style="display:none;">
            <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:16px;">Pick your date</p>
            <div id="charter-calendar"></div>
            <div style="margin-top:20px;display:flex;gap:10px;">
              <button class="wg-btn wg-btn--ghost" onclick="charterNext(1)" style="flex:1;">← Back</button>
              <button class="wg-btn wg-btn--primary" onclick="charterNext(3)" style="flex:2;">Continue →</button>
            </div>
          </div>

          <!-- STEP 3: Details -->
          <div id="charter-panel-3" style="display:none;">
            <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:16px;">Your details</p>
            <div style="margin-bottom:16px;">
              <label style="font-size:0.82rem;font-weight:600;color:var(--text-sub);display:block;margin-bottom:8px;">Number of guests</label>
              <div class="wg-party-size">
                <button class="wg-party-btn" onclick="charterChangeGuests(-1)">−</button>
                <span class="wg-party-count" id="charter-guest-count">2</span>
                <button class="wg-party-btn" onclick="charterChangeGuests(1)">+</button>
                <span id="charter-guest-max" style="font-size:0.75rem;color:var(--text-muted);"></span>
              </div>
            </div>
            <div class="wg-field"><label>Full Name *</label><input type="text" id="charter-name" placeholder="Your name" required></div>
            <div class="wg-field"><label>Phone *</label><input type="tel" id="charter-phone" placeholder="(555) 123-4567" required></div>
            <div class="wg-field"><label>Email</label><input type="email" id="charter-email" placeholder="your@email.com"></div>
            <div class="wg-field"><label>Notes (optional)</label><textarea id="charter-notes" placeholder="Anything we should know…"></textarea></div>
            <div style="margin-top:4px;display:flex;gap:10px;">
              <button class="wg-btn wg-btn--ghost" onclick="charterNext(2)" style="flex:1;">← Back</button>
              <button class="wg-btn wg-btn--primary" onclick="charterNext(4)" style="flex:2;">Continue →</button>
            </div>
          </div>

          <!-- STEP 4: Confirm -->
          <div id="charter-panel-4" style="display:none;">
            <div class="wg-confirm-box" id="charter-confirm-summary"></div>
            <div class="wg-field" style="margin-bottom:12px;">
              <label style="display:flex;align-items:flex-start;gap:8px;font-size:0.8rem;font-weight:400;color:var(--text-sub);cursor:pointer;">
                <input type="checkbox" id="charter-sms-consent" style="margin-top:2px;accent-color:var(--accent);" checked>
                I agree to receive SMS booking confirmations. Msg &amp; data rates may apply. Reply STOP to opt out.
              </label>
            </div>
            <div style="display:flex;gap:10px;">
              <button class="wg-btn wg-btn--ghost" onclick="charterNext(3)" style="flex:1;">← Back</button>
              <button class="wg-btn wg-btn--primary" onclick="charterSubmit()" style="flex:2;" id="charter-submit-btn">Confirm Booking</button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <script>
    (function() {
      var _charterState = { step: 1, trip: null, date: null, guests: 2, maxGuests: 6 };
      var _trips = ${JSON.stringify(trips)};

      window.charterSelectTrip = function(sel) {
        var opt = sel.options[sel.selectedIndex];
        _charterState.trip = sel.value;
        _charterState.maxGuests = parseInt(opt.dataset.guests) || 6;
        var trip = _trips.find(t => (t.id || t.name) === sel.value);
        var detail = document.getElementById('charter-trip-detail');
        if (trip) {
          detail.style.display = 'block';
          detail.innerHTML = (trip.description || '') + (trip.price ? '<br><strong>$' + trip.price + '</strong> per boat · up to ' + (trip.max_guests || 6) + ' guests' : '');
        } else {
          detail.style.display = 'none';
        }
      };

      window.charterChangeGuests = function(delta) {
        _charterState.guests = Math.max(1, Math.min(_charterState.maxGuests, _charterState.guests + delta));
        document.getElementById('charter-guest-count').textContent = _charterState.guests;
        document.getElementById('charter-guest-max').textContent = '(max ' + _charterState.maxGuests + ')';
      };

      window.charterNext = function(step) {
        if (step === 2 && !_charterState.trip) { alert('Please select a trip type.'); return; }
        if (step === 3 && !_charterState.date) { alert('Please select a date.'); return; }
        if (step === 4) {
          var name = document.getElementById('charter-name').value.trim();
          var phone = document.getElementById('charter-phone').value.trim();
          if (!name || !phone) { alert('Please enter your name and phone number.'); return; }
          _buildConfirmSummary();
        }
        _charterState.step = step;
        for (var i = 1; i <= 4; i++) {
          var panel = document.getElementById('charter-panel-' + i);
          if (panel) panel.style.display = i === step ? '' : 'none';
          var stepEl = document.getElementById('charter-step-' + i);
          if (stepEl) {
            stepEl.className = 'wg-step' + (i === step ? ' wg-step--active' : (i < step ? ' wg-step--done' : ''));
          }
        }
        if (step === 2 && !document.getElementById('charter-calendar').children.length) {
          _renderCharterCalendar();
        }
      };

      function _buildConfirmSummary() {
        var trip = _trips.find(t => (t.id || t.name) === _charterState.trip);
        var tripName = trip ? trip.name : _charterState.trip;
        var price = trip ? trip.price : null;
        document.getElementById('charter-confirm-summary').innerHTML =
          '<div class="wg-confirm-row"><span class="wg-confirm-label">Trip</span><span class="wg-confirm-value">' + tripName + '</span></div>' +
          '<div class="wg-confirm-row"><span class="wg-confirm-label">Date</span><span class="wg-confirm-value">' + (_charterState.date || '—') + '</span></div>' +
          '<div class="wg-confirm-row"><span class="wg-confirm-label">Guests</span><span class="wg-confirm-value">' + _charterState.guests + '</span></div>' +
          '<div class="wg-confirm-row"><span class="wg-confirm-label">Name</span><span class="wg-confirm-value">' + (document.getElementById('charter-name').value) + '</span></div>' +
          (price ? '<div class="wg-confirm-row wg-confirm-total"><span class="wg-confirm-label">Total</span><span class="wg-confirm-value">$' + price + '</span></div>' : '');
      }

      function _renderCharterCalendar() {
        var cal = document.getElementById('charter-calendar');
        var now = new Date();
        var year = now.getFullYear(), month = now.getMonth();
        var dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

        function render(y, m) {
          var first = new Date(y, m, 1).getDay();
          var days = new Date(y, m + 1, 0).getDate();
          var today = new Date(); today.setHours(0,0,0,0);
          var html = '<div class="wg-calendar"><div class="wg-cal-header"><button class="wg-cal-nav" onclick="charterCalNav(-1)">‹</button><span class="wg-cal-month">' + months[m] + ' ' + y + '</span><button class="wg-cal-nav" onclick="charterCalNav(1)">›</button></div><div class="wg-cal-grid">';
          dayLabels.forEach(d => { html += '<div class="wg-cal-day-label">' + d + '</div>'; });
          for (var i = 0; i < first; i++) html += '<div class="wg-cal-day wg-cal-day--empty"></div>';
          for (var d = 1; d <= days; d++) {
            var date = new Date(y, m, d); date.setHours(0,0,0,0);
            var isPast = date < today;
            var isSelected = _charterState.date === _fmtDate(y, m, d);
            var cls = 'wg-cal-day' + (isPast ? ' wg-cal-day--past' : '') + (isSelected ? ' wg-cal-day--selected' : '');
            html += '<div class="' + cls + '" onclick="charterPickDate(' + y + ',' + m + ',' + d + ')">' + d + '</div>';
          }
          html += '</div></div>';
          cal.innerHTML = html;
          cal._year = y; cal._month = m;
        }

        window.charterCalNav = function(dir) {
          var y = cal._year, m = cal._month + dir;
          if (m < 0) { m = 11; y--; }
          if (m > 11) { m = 0; y++; }
          render(y, m);
        };

        window.charterPickDate = function(y, m, d) {
          _charterState.date = _fmtDate(y, m, d);
          render(y, m);
        };

        function _fmtDate(y, m, d) {
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          return months[m] + ' ' + d + ', ' + y;
        }

        render(year, month);
      }

      window.charterSubmit = function() {
        var btn = document.getElementById('charter-submit-btn');
        btn.textContent = 'Submitting…';
        btn.disabled = true;
        setTimeout(function() {
          document.getElementById('charter-booking-body').innerHTML =
            '<div class="wg-success"><div class="wg-success-icon">✓</div><h3>Booking Request Sent!</h3><p>You\'ll receive an SMS confirmation shortly. We\'ll see you on the water! 🎣</p></div>';
        }, 1200);
      };
    })();
    </script>`;
});
