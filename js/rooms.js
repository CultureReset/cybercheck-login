// ============================================================
// Rooms & Units — condo/hotel/vacation_rental bookable units
// Backed by bookable_resources via CC.dashboard.getUnits/createUnit/
// updateUnit/deleteUnit. Each unit also gets its own availability
// calendar (blocked dates) and its own external-calendar connection
// (Airbnb/Vrbo/Track feed scoped to just that unit, resource_id).
// ============================================================

var _roomsCache = [];
var _roomCalCurrentYear = new Date().getFullYear();
var _roomCalCurrentMonth = new Date().getMonth();
var _roomCalBlocked = {}; // YYYY-MM-DD -> true

async function loadRooms() {
  var list = document.getElementById('rooms-list');
  var empty = document.getElementById('rooms-empty');

  var rooms = await CC.dashboard.getUnits();
  _roomsCache = Array.isArray(rooms) ? rooms.filter(function(r) { return r.is_active !== false; }) : [];

  if (!_roomsCache.length) {
    list.innerHTML = '';
    list.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  list.innerHTML = _roomsCache.map(function(room, i) {
    var meta = [];
    if (room.bedrooms) meta.push(room.bedrooms + ' bed');
    if (room.bathrooms) meta.push(room.bathrooms + ' bath');
    meta.push((room.capacity || 2) + ' guests');
    return '<div style="padding:12px 0;border-bottom:1px solid var(--card-border);display:flex;justify-content:space-between;align-items:center;">' +
      '<div><h4 style="margin:0 0 4px;font-size:14px;">' + escRoomHtml(room.name) + '</h4>' +
        '<p style="margin:0;font-size:12px;color:var(--text-muted);">$' + (room.nightly_price || '0') + '/night &bull; ' + meta.join(' &bull; ') + '</p></div>' +
      '<div style="display:flex;gap:8px;">' +
        '<button class="btn btn-outline btn-sm" onclick="openRoomCalendar(' + i + ')">Calendar</button>' +
        '<button class="btn btn-outline btn-sm" onclick="editRoom(' + i + ')">Edit</button>' +
      '</div>' +
    '</div>';
  }).join('');
  list.style.display = 'block';
  empty.style.display = 'none';
}

function escRoomHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function openRoomModal() {
  document.getElementById('room-modal-title').textContent = 'Add Room';
  document.getElementById('room-form-id').value = '';
  document.getElementById('room-form-name').value = '';
  document.getElementById('room-form-bedrooms').value = '';
  document.getElementById('room-form-bathrooms').value = '';
  document.getElementById('room-form-capacity').value = '';
  document.getElementById('room-form-price').value = '';
  document.getElementById('room-form-min-nights').value = '1';
  document.getElementById('room-calendar-section').style.display = 'none';
  document.getElementById('room-delete-btn').style.display = 'none';
  document.getElementById('modal-room').style.display = 'flex';
}

function editRoom(index) {
  var room = _roomsCache[index];
  if (!room) return;
  document.getElementById('room-modal-title').textContent = 'Edit Room';
  document.getElementById('room-form-id').value = room.id;
  document.getElementById('room-form-name').value = room.name || '';
  document.getElementById('room-form-bedrooms').value = room.bedrooms || '';
  document.getElementById('room-form-bathrooms').value = room.bathrooms || '';
  document.getElementById('room-form-capacity').value = room.capacity || '';
  document.getElementById('room-form-price').value = room.nightly_price || '';
  document.getElementById('room-form-min-nights').value = room.min_nights || 1;
  document.getElementById('room-calendar-section').style.display = 'none';
  document.getElementById('room-delete-btn').style.display = '';
  document.getElementById('modal-room').style.display = 'flex';
}

async function saveRoom() {
  var id = document.getElementById('room-form-id').value;
  var name = document.getElementById('room-form-name').value.trim();
  if (!name) { toast('Room name is required', 'error'); return; }

  var payload = {
    name: name,
    bedrooms: document.getElementById('room-form-bedrooms').value ? parseInt(document.getElementById('room-form-bedrooms').value) : null,
    bathrooms: document.getElementById('room-form-bathrooms').value ? parseFloat(document.getElementById('room-form-bathrooms').value) : null,
    capacity: document.getElementById('room-form-capacity').value ? parseInt(document.getElementById('room-form-capacity').value) : null,
    nightly_price: document.getElementById('room-form-price').value ? parseFloat(document.getElementById('room-form-price').value) : null,
    min_nights: document.getElementById('room-form-min-nights').value ? parseInt(document.getElementById('room-form-min-nights').value) : 1,
  };

  var result = id ? await CC.dashboard.updateUnit(id, payload) : await CC.dashboard.createUnit(payload);
  if (result) {
    toast(id ? 'Room updated' : 'Room added');
    closeModal('modal-room');
    loadRooms();
  } else {
    toast('Failed to save room', 'error');
  }
}

async function deleteRoomConfirm() {
  var id = document.getElementById('room-form-id').value;
  if (!id) return;
  if (!confirm('Remove this room? It will stop showing as bookable, but its history is kept.')) return;
  var result = await CC.dashboard.deleteUnit(id);
  if (result) {
    toast('Room removed');
    closeModal('modal-room');
    loadRooms();
  } else {
    toast('Failed to remove room', 'error');
  }
}

// ---- Per-unit availability calendar (read-only blocked-dates view) ----

async function openRoomCalendar(index) {
  var room = _roomsCache[index];
  if (!room) return;
  editRoom(index);
  document.getElementById('room-calendar-section').style.display = 'block';
  document.getElementById('room-cal-unit-id').value = room.id;
  _roomCalCurrentYear = new Date().getFullYear();
  _roomCalCurrentMonth = new Date().getMonth();
  await loadRoomCalendarData(room.id);
  renderRoomCalendar();
  loadRoomUnitCalendars(room.id);
}

async function loadRoomCalendarData(resourceId) {
  var from = new Date().toISOString().slice(0, 10);
  var to = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
  var data = await CC.dashboard.getUnitAvailability(resourceId, from, to);
  _roomCalBlocked = {};
  (data && data.blocked_dates || []).forEach(function(d) { _roomCalBlocked[d] = true; });
}

function roomCalPrevMonth() {
  _roomCalCurrentMonth--;
  if (_roomCalCurrentMonth < 0) { _roomCalCurrentMonth = 11; _roomCalCurrentYear--; }
  renderRoomCalendar();
}
function roomCalNextMonth() {
  _roomCalCurrentMonth++;
  if (_roomCalCurrentMonth > 11) { _roomCalCurrentMonth = 0; _roomCalCurrentYear++; }
  renderRoomCalendar();
}

function renderRoomCalendar() {
  var container = document.getElementById('room-calendar-grid');
  var monthLabel = document.getElementById('room-cal-month-label');
  if (!container) return;

  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  monthLabel.textContent = monthNames[_roomCalCurrentMonth] + ' ' + _roomCalCurrentYear;

  var dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var html = '';
  dayNames.forEach(function(d) { html += '<div class="day-header">' + d + '</div>'; });

  var firstDay = new Date(_roomCalCurrentYear, _roomCalCurrentMonth, 1).getDay();
  var daysInMonth = new Date(_roomCalCurrentYear, _roomCalCurrentMonth + 1, 0).getDate();
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  for (var i = 0; i < firstDay; i++) html += '<div class="day-cell empty"></div>';

  for (var d = 1; d <= daysInMonth; d++) {
    var dateObj = new Date(_roomCalCurrentYear, _roomCalCurrentMonth, d);
    var y = dateObj.getFullYear();
    var m = String(dateObj.getMonth() + 1).padStart(2, '0');
    var dd = String(dateObj.getDate()).padStart(2, '0');
    var dateKey = y + '-' + m + '-' + dd;
    var isPast = dateObj < today;
    var isBlocked = !!_roomCalBlocked[dateKey];

    var cls = 'day-cell';
    if (isPast) cls += ' blocked';
    else if (isBlocked) cls += ' booked';
    else cls += ' available';

    html += '<div class="' + cls + '" title="' + (isBlocked ? 'Booked/unavailable' : 'Open') + '">' + d + '</div>';
  }
  container.innerHTML = html;
}

// ---- Connect an external calendar (Airbnb/Vrbo/Track) scoped to just this unit ----

async function connectRoomCalendar() {
  var resourceId = document.getElementById('room-cal-unit-id').value;
  var url = document.getElementById('room-cal-ical-url').value.trim();
  var provider = document.getElementById('room-cal-provider').value;
  if (!url) { toast('Paste a calendar link first', 'error'); return; }
  if (!/^https?:\/\//i.test(url)) { toast('That doesn\'t look like a valid link', 'error'); return; }

  var result = await CC.dashboard.addExternalCalendar({
    source_label: provider,
    ical_url: url,
    provider: provider,
    resource_id: resourceId,
  });
  if (result) {
    document.getElementById('room-cal-ical-url').value = '';
    toast('Calendar connected to this unit — first sync runs within the hour');
    loadRoomUnitCalendars(resourceId);
  } else {
    toast('Failed to connect — please try again', 'error');
  }
}

async function loadRoomUnitCalendars(resourceId) {
  var list = document.getElementById('room-cal-feed-list');
  if (!list) return;
  var all = await CC.dashboard.getExternalCalendars();
  var mine = (all || []).filter(function(f) { return f.resource_id === resourceId; });

  if (!mine.length) { list.innerHTML = '<div style="font-size:12px;color:var(--text-muted);">No calendar connected to this unit yet.</div>'; return; }

  list.innerHTML = mine.map(function(f) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--card-border);font-size:13px;">' +
      '<div><strong>' + escRoomHtml(f.source_label || f.provider || 'Calendar') + '</strong>' +
        '<div style="font-size:11px;color:var(--text-muted);">' + escRoomHtml(f.last_sync_status || 'Not synced yet') + '</div></div>' +
      '<div style="display:flex;gap:6px;">' +
        '<button class="btn btn-outline btn-sm" onclick="roomCalSyncNow(\'' + f.id + '\',\'' + resourceId + '\')">Sync</button>' +
        '<button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:var(--danger);" onclick="roomCalRemoveFeed(\'' + f.id + '\',\'' + resourceId + '\')">Remove</button>' +
      '</div></div>';
  }).join('');
}

async function roomCalSyncNow(feedId, resourceId) {
  toast('Syncing...');
  await CC.dashboard.syncExternalCalendarNow(feedId);
  await loadRoomCalendarData(resourceId);
  renderRoomCalendar();
  loadRoomUnitCalendars(resourceId);
  toast('Synced');
}

async function roomCalRemoveFeed(feedId, resourceId) {
  if (!confirm('Disconnect this calendar from the unit?')) return;
  await CC.dashboard.deleteExternalCalendar(feedId);
  loadRoomUnitCalendars(resourceId);
  toast('Calendar disconnected');
}

onPageLoad('rooms', function() {
  loadRooms();
});
