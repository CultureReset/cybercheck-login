// ============================================
// Locations — Beachside pickup/launch points
// ============================================

var _locations = [];
var _locIdCounter = 0;

async function loadLocations() {
  // Locations stored in site_content.hours as a sibling field
  // For now, use a simple Supabase query on site_content
  var siteId = getSiteId();
  if (siteId && supabase) {
    var { data } = await supabase.from('site_content').select('gallery').eq('site_id', siteId).single();
    // Piggyback on gallery JSONB for locations until dedicated table exists
    // Actually use localStorage for locations as a bridge
  }
  if (_locations.length === 0) {
    try {
      var saved = localStorage.getItem('beachside_locations');
      if (saved) _locations = JSON.parse(saved);
    } catch(e) {}
  }
  if (_locations.length === 0) {
    _locations = [
      { id: 1, name: 'Main Launch - Canal Road', address: '25856 Canal Road, Unit A, Orange Beach, AL 36561' }
    ];
    _locIdCounter = 1;
    localStorage.setItem('beachside_locations', JSON.stringify(_locations));
  }
  renderLocations();
}

function renderLocations() {
  var container = document.getElementById('locations-list');
  var emptyState = document.getElementById('locations-empty');

  if (_locations.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = '';
    return;
  }

  emptyState.style.display = 'none';
  var html = '<div class="table-wrap"><table><thead><tr><th>Location</th><th>Address</th><th>Actions</th></tr></thead><tbody>';

  _locations.forEach(function(loc) {
    html += '<tr>';
    html += '<td><strong>' + escHtml(loc.name) + '</strong></td>';
    html += '<td style="color:var(--text-muted);">' + escHtml(loc.address) + '</td>';
    html += '<td><div style="display:flex;gap:6px;">';
    html += '<button class="btn btn-outline btn-sm" onclick="editLocation(' + loc.id + ')">Edit</button>';
    html += '<button class="btn btn-danger btn-sm" onclick="deleteLocation(' + loc.id + ')">Delete</button>';
    html += '</div></td>';
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function openLocationModal(id) {
  document.getElementById('loc-form-name').value = '';
  document.getElementById('loc-form-address').value = '';
  document.getElementById('loc-form-id').value = '';

  if (id) {
    var loc = _locations.find(function(l) { return l.id === id; });
    if (loc) {
      document.getElementById('loc-form-name').value = loc.name;
      document.getElementById('loc-form-address').value = loc.address;
      document.getElementById('loc-form-id').value = loc.id;
    }
  }
  openModal('modal-location');
}

function saveLocation() {
  var name = document.getElementById('loc-form-name').value.trim();
  if (!name) { toast('Location name is required', 'error'); return; }

  var address = document.getElementById('loc-form-address').value.trim();
  var id = document.getElementById('loc-form-id').value;

  if (id) {
    var loc = _locations.find(function(l) { return l.id === parseInt(id); });
    if (loc) { loc.name = name; loc.address = address; }
    toast('Location updated');
  } else {
    _locIdCounter++;
    _locations.push({ id: _locIdCounter, name: name, address: address });
    toast('Location added');
  }

  localStorage.setItem('beachside_locations', JSON.stringify(_locations));
  closeModal('modal-location');
  renderLocations();
}

function editLocation(id) { openLocationModal(id); }

function deleteLocation(id) {
  if (!confirm('Delete this location?')) return;
  _locations = _locations.filter(function(l) { return l.id !== id; });
  localStorage.setItem('beachside_locations', JSON.stringify(_locations));
  renderLocations();
  toast('Location deleted');
}

onPageLoad('locations', loadLocations);
