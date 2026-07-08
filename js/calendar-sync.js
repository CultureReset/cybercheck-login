// ============================================================
// Calendar Sync — iCal export link for Airbnb/VRBO/Google Calendar
// ============================================================

var _icalFeedUrl = '';

async function loadCalendarSync() {
  document.getElementById('ical-feed-loading').style.display = '';
  document.getElementById('ical-feed-content').style.display = 'none';
  document.getElementById('ical-feed-empty').style.display = 'none';

  var data = await CC.dashboard.getIcalFeedUrl();

  document.getElementById('ical-feed-loading').style.display = 'none';

  if (!data || !data.feed_url) {
    document.getElementById('ical-feed-empty').style.display = '';
    return;
  }

  _icalFeedUrl = data.feed_url;
  document.getElementById('ical-feed-url').value = _icalFeedUrl;
  document.getElementById('ical-feed-content').style.display = '';
}

function copyIcalFeedUrl() {
  if (!_icalFeedUrl) return;
  navigator.clipboard.writeText(_icalFeedUrl).then(function() {
    toast('Calendar link copied');
  }).catch(function() {
    toast('Could not copy — select and copy manually', 'error');
  });
}

async function regenerateIcalFeed() {
  if (!confirm('Regenerate this link? The old link will stop working on any platform where you already pasted it.')) return;

  var data = await CC.dashboard.regenerateIcalFeed();
  if (data && data.feed_url) {
    _icalFeedUrl = data.feed_url;
    document.getElementById('ical-feed-url').value = _icalFeedUrl;
    toast('Calendar link regenerated');
  } else {
    toast('Failed to regenerate — please try again', 'error');
  }
}

// ── External calendar import (Airbnb/VRBO/FareHarbor/Peak -> GCR) ──────────

function escHtmlLocal(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatSyncTime(iso) {
  if (!iso) return 'Never synced';
  var d = new Date(iso);
  return 'Last synced ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

async function loadExternalCalendars() {
  var list = document.getElementById('external-cal-list');
  var empty = document.getElementById('external-cal-empty');
  var rows = await CC.dashboard.getExternalCalendars();

  if (!rows || !rows.length) {
    list.innerHTML = '';
    empty.style.display = '';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = rows.map(function(row) {
    var statusColor = (row.last_sync_status || '').indexOf('error') === 0 ? 'var(--danger)' : 'var(--text-muted)';
    return '<div class="item-row" style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--card-border);">' +
      '<div>' +
        '<div style="font-weight:600;">' + escHtmlLocal(row.source_label) + '</div>' +
        '<div style="font-size:12px;color:' + statusColor + ';margin-top:2px;">' + escHtmlLocal(row.last_sync_status || formatSyncTime(row.last_synced_at)) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;">' +
        '<button class="btn btn-outline btn-sm" onclick="syncExternalCalendarNow(\'' + row.id + '\')">Sync Now</button>' +
        '<button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:var(--danger);" onclick="deleteExternalCalendar(\'' + row.id + '\')">Remove</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function openExternalCalendarModal() {
  document.getElementById('external-cal-label').value = '';
  document.getElementById('external-cal-url').value = '';
  document.getElementById('external-cal-modal').style.display = 'flex';
}

function closeExternalCalendarModal() {
  document.getElementById('external-cal-modal').style.display = 'none';
}

async function saveExternalCalendar() {
  var label = document.getElementById('external-cal-label').value.trim();
  var url = document.getElementById('external-cal-url').value.trim();

  if (!url) { toast('Paste a calendar link first', 'error'); return; }
  if (!/^https?:\/\//i.test(url)) { toast('That doesn\'t look like a valid link', 'error'); return; }

  var btn = document.getElementById('external-cal-save-btn');
  btn.disabled = true;
  btn.textContent = 'Connecting...';

  var result = await CC.dashboard.addExternalCalendar({ source_label: label || 'External Calendar', ical_url: url });

  btn.disabled = false;
  btn.textContent = 'Connect';

  if (result) {
    closeExternalCalendarModal();
    toast('Calendar connected — first sync runs within the hour');
    loadExternalCalendars();
  } else {
    toast('Failed to connect — please try again', 'error');
  }
}

async function deleteExternalCalendar(id) {
  if (!confirm('Disconnect this calendar? GCR will stop importing its blocked dates.')) return;
  await CC.dashboard.deleteExternalCalendar(id);
  toast('Calendar disconnected');
  loadExternalCalendars();
}

async function syncExternalCalendarNow(id) {
  toast('Syncing...');
  var result = await CC.dashboard.syncExternalCalendarNow(id);
  if (result && result.success) {
    toast('Synced');
  } else {
    toast('Sync failed — check the link and try again', 'error');
  }
  loadExternalCalendars();
}

onPageLoad('calendar-sync', function() {
  loadCalendarSync();
  loadExternalCalendars();
});
