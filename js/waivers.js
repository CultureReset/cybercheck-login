// ============================================================
// Waiver — one waiver template per business, required toggle,
// and the real signed-waiver log. Backed by the entity row
// (waiver_text/waiver_required) + the waivers table.
// ============================================================

var _waiverTemplate = { waiver_required: false, waiver_text: '' };
var _signedWaivers = [];

async function loadWaivers() {
  var tpl = await CC.dashboard.getWaiverTemplate();
  if (tpl) _waiverTemplate = tpl;

  var signed = await CC.dashboard.getWaivers();
  _signedWaivers = Array.isArray(signed) ? signed : [];

  renderWaiversPage();
}

function renderWaiversPage() {
  renderWaiverStats();
  renderWaiverSettings();
  renderSignedWaiversLog();
}

function renderWaiverStats() {
  var container = document.getElementById('waiver-stats');
  if (!container) return;

  var signed = _signedWaivers.length;
  var thisMonth = _signedWaivers.filter(function(s) {
    return s.signed_at && s.signed_at.indexOf(new Date().toISOString().substring(0, 7)) === 0;
  }).length;

  var html = '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;padding-bottom:20px;">';
  html += '<div style="text-align:center;"><div style="font-size:28px;font-weight:700;color:var(--primary);">' + signed + '</div><div style="font-size:12px;color:var(--text-muted);">Total Signed</div></div>';
  html += '<div style="text-align:center;"><div style="font-size:28px;font-weight:700;color:#22c55e;">' + thisMonth + '</div><div style="font-size:12px;color:var(--text-muted);">This Month</div></div>';
  html += '</div>';

  container.innerHTML = html;
}

function renderWaiverSettings() {
  var container = document.getElementById('waiver-settings');
  if (!container) return;

  var checked = _waiverTemplate.waiver_required ? 'checked' : '';
  var html = '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);margin-bottom:14px;">';
  html += '<div><strong style="font-size:13px;">Require waiver when booking</strong><div style="font-size:12px;color:var(--text-dim);">Customer must check the agreement box before completing a booking</div></div>';
  html += '<label class="toggle"><input type="checkbox" id="waiver-required-toggle" ' + checked + '><span class="toggle-slider"></span></label>';
  html += '</div>';

  html += '<div class="field"><label>Waiver Text</label><textarea id="waiver-text-input" rows="10" placeholder="I understand that this activity involves inherent risks including...">' + escHtml(_waiverTemplate.waiver_text || '') + '</textarea></div>';
  html += '<button class="btn btn-primary btn-sm" onclick="saveWaiverSettings()">Save Waiver</button>';

  html += '<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--card-border);">';
  html += '<strong style="font-size:13px;">📄 Your Own Waiver Document (optional)</strong>';
  html += '<div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">Upload your own signed PDF/Word waiver — customers see a link to it alongside the text above.</div>';
  if (_waiverTemplate.waiver_document_url) {
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);">';
    html += '<a href="' + escHtml(_waiverTemplate.waiver_document_url) + '" target="_blank" style="font-size:13px;">✅ View uploaded document</a>';
    html += '<button class="btn btn-danger btn-sm" onclick="deleteWaiverDocument()">Remove</button>';
    html += '</div>';
  } else {
    html += '<div style="display:flex;gap:8px;align-items:center;">';
    html += '<input type="file" id="waiver-doc-input" accept=".pdf,.doc,.docx" style="flex:1;padding:8px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:6px;font-size:12px;color:var(--text);">';
    html += '<button class="btn btn-outline btn-sm" onclick="uploadWaiverDocument()">Upload</button>';
    html += '</div>';
    html += '<div id="waiver-doc-status" style="margin-top:8px;font-size:12px;color:var(--text-muted);"></div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

async function uploadWaiverDocument() {
  var input = document.getElementById('waiver-doc-input');
  var file = input.files[0];
  if (!file) { toast('Choose a file first', 'error'); return; }

  var statusEl = document.getElementById('waiver-doc-status');
  statusEl.textContent = 'Uploading...';

  try {
    var base64 = await readFileAsBase64(file);
    var result = await CC.dashboard.uploadDocument({ kind: 'waiver', file_base64: base64, mime: file.type });
    if (result && result.url) {
      _waiverTemplate.waiver_document_url = result.url;
      toast('Document uploaded', 'success');
      renderWaiverSettings();
    } else {
      statusEl.textContent = 'Upload failed — please try again';
    }
  } catch (e) {
    statusEl.textContent = 'Upload failed: ' + (e.message || 'unknown error');
  }
}

async function deleteWaiverDocument() {
  if (!confirm('Remove this waiver document?')) return;
  await CC.dashboard.deleteDocument('waiver');
  _waiverTemplate.waiver_document_url = null;
  toast('Document removed');
  renderWaiverSettings();
}

async function saveWaiverSettings() {
  var waiverRequired = document.getElementById('waiver-required-toggle').checked;
  var waiverText = document.getElementById('waiver-text-input').value.trim();

  if (waiverRequired && !waiverText) {
    toast('Add waiver text before requiring it at checkout', 'error');
    return;
  }

  var result = await CC.dashboard.updateWaiverTemplate({ waiver_required: waiverRequired, waiver_text: waiverText });
  if (result) {
    _waiverTemplate = result;
    toast('Waiver saved', 'success');
  } else {
    toast('Failed to save — please try again', 'error');
  }
}

function renderSignedWaiversLog() {
  var container = document.getElementById('signed-waivers');
  if (!container) return;

  if (_signedWaivers.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);">No waivers signed yet</div>';
    return;
  }

  var html = '<div class="table-wrap"><table><thead><tr>';
  html += '<th>Customer</th><th>Signed</th><th>Phone</th><th>IP</th>';
  html += '</tr></thead><tbody>';

  _signedWaivers.forEach(function(s) {
    var signedDate = s.signed_at ? new Date(s.signed_at).toLocaleString() : '—';
    html += '<tr>';
    html += '<td><div style="font-weight:600;">' + escHtml(s.customer_name || '—') + '</div><div style="font-size:11px;color:var(--text-muted);">' + escHtml(s.customer_email || '') + '</div></td>';
    html += '<td style="font-size:13px;">' + signedDate + '</td>';
    html += '<td style="font-size:13px;">' + escHtml(s.customer_phone || '—') + '</td>';
    html += '<td style="font-family:\'SF Mono\',monospace;font-size:12px;color:var(--text-muted);">' + escHtml(s.ip_address || '—') + '</td>';
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

if (typeof escHtml === 'undefined') {
  function escHtml(str) { var d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }
}

// Shared by waivers.js + policies.js document uploads — strips the
// "data:mime;base64," prefix FileReader adds, leaving raw base64 for the API.
if (typeof readFileAsBase64 === 'undefined') {
  function readFileAsBase64(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() { resolve(String(reader.result).split(',')[1] || ''); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

onPageLoad('waivers', loadWaivers);
