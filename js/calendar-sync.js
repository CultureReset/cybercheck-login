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

onPageLoad('calendar-sync', function() {
  loadCalendarSync();
});
