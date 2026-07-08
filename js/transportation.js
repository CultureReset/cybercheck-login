// ============================================================
// Transportation — brokered ride/pickup dispatch. Turn it on,
// register drivers, see requests dispatched to them.
// ============================================================

var _transportProviders = [];
var _transportRequests = [];

async function loadTransportation() {
  var settings = await CC.dashboard.getTransportSettings();
  var toggle = document.getElementById('transport-offer-toggle');
  if (toggle) toggle.checked = !!(settings && settings.offers_transportation);
  if (toggle && !toggle._wired) {
    toggle._wired = true;
    toggle.addEventListener('change', async function() {
      var result = await CC.dashboard.updateTransportSettings({ offers_transportation: toggle.checked });
      if (result) {
        toast(toggle.checked ? 'Now receiving ride requests' : 'Transportation turned off', 'success');
      } else {
        toggle.checked = !toggle.checked;
        toast('Failed to update — please try again', 'error');
      }
    });
  }

  var providers = await CC.dashboard.getTransportProviders();
  _transportProviders = Array.isArray(providers) ? providers : [];
  renderTransportProviders();

  var requests = await CC.dashboard.getTransportRequests();
  _transportRequests = Array.isArray(requests) ? requests : [];
  renderTransportRequests();
}

function renderTransportProviders() {
  var list = document.getElementById('transport-providers-list');
  var empty = document.getElementById('transport-providers-empty');
  if (!list) return;

  if (!_transportProviders.length) {
    list.innerHTML = '';
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = _transportProviders.map(function(p) {
    var vehicle = [p.vehicle_color, p.vehicle_make, p.vehicle_model].filter(Boolean).join(' ') || p.vehicle_type;
    var plate = p.vehicle_plate ? ' · ' + escHtml(p.vehicle_plate) : '';
    var badges = [];
    if (p.handles_passengers) badges.push('<span class="badge badge-info">Passengers</span>');
    if (p.handles_luggage) badges.push('<span class="badge badge-info">Luggage</span>');
    var availBadge = p.available ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-warning">Unavailable</span>';

    return '<div class="item-row" style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--card-border);flex-wrap:wrap;gap:10px;">' +
      '<div>' +
        '<div style="font-weight:700;">' + escHtml(p.driver_name) + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">' + escHtml(vehicle) + plate + ' · ' + escHtml(p.phone) + '</div>' +
        '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">' + availBadge + badges.join('') + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;align-items:center;">' +
        '<label class="toggle" title="Available for dispatch"><input type="checkbox" ' + (p.available ? 'checked' : '') + ' onchange="toggleTransportAvailable(\'' + p.id + '\', this.checked)"><span class="toggle-slider"></span></label>' +
        '<button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:var(--danger);" onclick="removeTransportProvider(\'' + p.id + '\')">Remove</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

async function toggleTransportAvailable(id, available) {
  var result = await CC.dashboard.updateTransportProvider(id, { available: available });
  if (!result) { toast('Failed to update', 'error'); return; }
  var p = _transportProviders.find(function(x) { return x.id === id; });
  if (p) p.available = available;
}

function renderTransportRequests() {
  var list = document.getElementById('transport-requests-list');
  var empty = document.getElementById('transport-requests-empty');
  if (!list) return;

  if (!_transportRequests.length) {
    list.innerHTML = '';
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';

  var STATUS_LABEL = {
    pending: ['Pending', 'badge-warning'],
    dispatched: ['Dispatched — awaiting bid', 'badge-info'],
    confirmed: ['Confirmed', 'badge-success'],
    no_coverage: ['No driver available', 'badge-danger'],
  };

  list.innerHTML = '<div class="table-wrap"><table><thead><tr>' +
    '<th>Customer</th><th>Route</th><th>When</th><th>Status</th><th>Price</th>' +
    '</tr></thead><tbody>' +
    _transportRequests.map(function(r) {
      var s = STATUS_LABEL[r.status] || [r.status, 'badge-info'];
      var when = r.pickup_date ? (r.pickup_date + (r.pickup_window ? ' · ' + r.pickup_window : '')) : '—';
      return '<tr>' +
        '<td><div style="font-weight:600;">' + escHtml(r.customer_name || 'Guest') + '</div><div style="font-size:11px;color:var(--text-muted);">' + escHtml(r.customer_phone || '') + '</div></td>' +
        '<td style="font-size:13px;">' + escHtml(r.pickup_location) + ' → ' + escHtml(r.dropoff_location) + '</td>' +
        '<td style="font-size:13px;">' + escHtml(when) + '</td>' +
        '<td><span class="badge ' + s[1] + '">' + escHtml(s[0]) + '</span></td>' +
        '<td style="font-size:13px;">' + (r.price ? '$' + Number(r.price).toFixed(2) : '—') + '</td>' +
      '</tr>';
    }).join('') +
    '</tbody></table></div>';
}

function openTransportProviderModal() {
  document.getElementById('transport-driver-name').value = '';
  document.getElementById('transport-driver-phone').value = '';
  document.getElementById('transport-vehicle-type').value = 'sedan';
  document.getElementById('transport-capacity').value = '4';
  document.getElementById('transport-vehicle-make').value = '';
  document.getElementById('transport-vehicle-model').value = '';
  document.getElementById('transport-vehicle-color').value = '';
  document.getElementById('transport-vehicle-plate').value = '';
  document.getElementById('transport-handles-passengers').checked = true;
  document.getElementById('transport-handles-luggage').checked = false;
  document.getElementById('transport-provider-modal').style.display = 'flex';
}

function closeTransportProviderModal() {
  document.getElementById('transport-provider-modal').style.display = 'none';
}

async function saveTransportProvider() {
  var name = document.getElementById('transport-driver-name').value.trim();
  var phone = document.getElementById('transport-driver-phone').value.trim();
  if (!name || !phone) { toast('Driver name and phone are required', 'error'); return; }

  var btn = document.getElementById('transport-provider-save-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  var result = await CC.dashboard.addTransportProvider({
    driver_name: name,
    phone: phone,
    vehicle_type: document.getElementById('transport-vehicle-type').value,
    capacity: document.getElementById('transport-capacity').value,
    vehicle_make: document.getElementById('transport-vehicle-make').value.trim(),
    vehicle_model: document.getElementById('transport-vehicle-model').value.trim(),
    vehicle_color: document.getElementById('transport-vehicle-color').value.trim(),
    vehicle_plate: document.getElementById('transport-vehicle-plate').value.trim(),
    handles_passengers: document.getElementById('transport-handles-passengers').checked,
    handles_luggage: document.getElementById('transport-handles-luggage').checked,
  });

  btn.disabled = false;
  btn.textContent = 'Save Driver';

  if (result) {
    closeTransportProviderModal();
    toast('Driver added', 'success');
    loadTransportation();
  } else {
    toast('Failed to save — check the phone number and try again', 'error');
  }
}

async function removeTransportProvider(id) {
  if (!confirm('Remove this driver?')) return;
  await CC.dashboard.deleteTransportProvider(id);
  toast('Driver removed');
  loadTransportation();
}

if (typeof escHtml === 'undefined') {
  function escHtml(str) { var d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }
}

onPageLoad('transportation', loadTransportation);
