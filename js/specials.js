// ============================================
// Specials — Daily specials CRUD
// ============================================

var _specials = [];
var _specialIdCounter = 0;
var _allDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

async function loadSpecials() {
  var apiData = await CC.dashboard.getSpecials();
  if (apiData && Array.isArray(apiData)) {
    _specials = apiData.map(function(s) {
      return {
        id: s.id,
        title: s.title || '',
        description: s.description || '',
        days: s.days || [],
        startTime: s.start_time || '',
        endTime: s.end_time || '',
        _apiId: s.id
      };
    });
  }
  renderSpecials();
  buildDayCheckboxes();
}

function buildDayCheckboxes() {
  var container = document.getElementById('spec-form-days');
  if (container._built) return;
  container._built = true;

  container.innerHTML = '';
  _allDays.forEach(function(day) {
    var label = document.createElement('label');
    label.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;padding:4px 8px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);font-size:13px;color:var(--text);user-select:none;';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = day;
    cb.id = 'spec-day-' + day;
    label.appendChild(cb);
    label.appendChild(document.createTextNode(day));
    container.appendChild(label);
  });
}

function renderSpecials() {
  var container = document.getElementById('specials-list');
  var emptyState = document.getElementById('specials-empty');

  if (_specials.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = '';
    return;
  }

  emptyState.style.display = 'none';

  var html = '<div class="table-wrap"><table><thead><tr><th>Special</th><th>Days</th><th>Time</th><th>Actions</th></tr></thead><tbody>';

  _specials.forEach(function(s) {
    html += '<tr>';
    html += '<td><strong>' + escHtml(s.title) + '</strong>';
    if (s.description) html += '<br><span style="font-size:12px;color:var(--text-muted);">' + escHtml(s.description) + '</span>';
    html += '</td>';
    html += '<td>' + s.days.map(function(d) { return '<span class="badge badge-info" style="margin:2px;">' + d + '</span>'; }).join('') + '</td>';
    html += '<td style="white-space:nowrap;">' + formatTime(s.startTime) + ' - ' + formatTime(s.endTime) + '</td>';
    html += '<td><div style="display:flex;gap:6px;">';
    html += '<button class="btn btn-outline btn-sm" onclick="editSpecial(' + s.id + ')">Edit</button>';
    html += '<button class="btn btn-danger btn-sm" onclick="deleteSpecial(' + s.id + ')">Delete</button>';
    html += '</div></td>';
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function formatTime(t) {
  if (!t) return '';
  var parts = t.split(':');
  var h = parseInt(parts[0]);
  var m = parts[1];
  var ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return h + ':' + m + ' ' + ampm;
}

function openSpecialModal(id) {
  buildDayCheckboxes();
  document.getElementById('spec-form-title').value = '';
  document.getElementById('spec-form-desc').value = '';
  document.getElementById('spec-form-start').value = '';
  document.getElementById('spec-form-end').value = '';
  document.getElementById('spec-form-id').value = '';
  document.getElementById('special-modal-title').textContent = 'Add Special';

  // Uncheck all days
  _allDays.forEach(function(d) {
    var cb = document.getElementById('spec-day-' + d);
    if (cb) cb.checked = false;
  });

  if (id) {
    var s = _specials.find(function(x) { return x.id === id; });
    if (s) {
      document.getElementById('special-modal-title').textContent = 'Edit Special';
      document.getElementById('spec-form-title').value = s.title;
      document.getElementById('spec-form-desc').value = s.description || '';
      document.getElementById('spec-form-start').value = s.startTime || '';
      document.getElementById('spec-form-end').value = s.endTime || '';
      document.getElementById('spec-form-id').value = s.id;
      s.days.forEach(function(d) {
        var cb = document.getElementById('spec-day-' + d);
        if (cb) cb.checked = true;
      });
    }
  }

  openModal('modal-special');
}

function saveSpecial() {
  var title = document.getElementById('spec-form-title').value.trim();
  if (!title) { toast('Title is required', 'error'); return; }

  var desc = document.getElementById('spec-form-desc').value.trim();
  var startTime = document.getElementById('spec-form-start').value;
  var endTime = document.getElementById('spec-form-end').value;
  var days = [];
  _allDays.forEach(function(d) {
    var cb = document.getElementById('spec-day-' + d);
    if (cb && cb.checked) days.push(d);
  });

  if (days.length === 0) { toast('Select at least one day', 'error'); return; }

  var id = document.getElementById('spec-form-id').value;

  if (id) {
    CC.dashboard.updateSpecial(id, { title: title, description: desc, days: days, start_time: startTime, end_time: endTime }).then(function() {
      var s = _specials.find(function(x) { return String(x.id) === String(id); });
      if (s) { s.title = title; s.description = desc; s.days = days; s.startTime = startTime; s.endTime = endTime; }
      renderSpecials();
      toast('Special updated');
    });
  } else {
    CC.dashboard.createSpecial({ title: title, description: desc, days: days, start_time: startTime, end_time: endTime }).then(function(data) {
      if (data) _specials.push({ id: data.id, title: title, description: desc, days: days, startTime: startTime, endTime: endTime, _apiId: data.id });
      renderSpecials();
      toast('Special added');
    });
  }

  closeModal('modal-special');
}

function editSpecial(id) {
  openSpecialModal(id);
}

function deleteSpecial(id) {
  if (!confirm('Delete this special?')) return;
  CC.dashboard.deleteSpecial(id).then(function() {
    _specials = _specials.filter(function(s) { return s.id !== id; });
    renderSpecials();
    toast('Special deleted');
  });
}

// Register page load callback
onPageLoad('specials', loadSpecials);
