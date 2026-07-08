// ============================================================
// Policies — deposit amount/type + cancellation/refund terms,
// shown to customers before they book (Reserve.jsx and future
// checkout pages). Lives on the entity row. Cancellation and
// refund are separate documents from the Waiver page.
// ============================================================

var _policies = { deposit_amount: null, deposit_type: null, cancellation_policy: '', refund_policy: '', cancellation_policy_doc_url: null, refund_policy_doc_url: null };

async function loadPolicies() {
  var data = await CC.dashboard.getPolicies();
  if (data) _policies = data;
  renderPoliciesSettings();
}

function docUploadBlock(kind, label, url) {
  var html = '<div style="margin-top:8px;">';
  if (url) {
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);">';
    html += '<a href="' + escHtml(url) + '" target="_blank" style="font-size:13px;">✅ View uploaded ' + label + ' document</a>';
    html += '<button class="btn btn-danger btn-sm" onclick="deletePolicyDocument(\'' + kind + '\')">Remove</button>';
    html += '</div>';
  } else {
    html += '<div style="display:flex;gap:8px;align-items:center;">';
    html += '<input type="file" id="policy-doc-input-' + kind + '" accept=".pdf,.doc,.docx" style="flex:1;padding:8px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:6px;font-size:12px;color:var(--text);">';
    html += '<button class="btn btn-outline btn-sm" onclick="uploadPolicyDocument(\'' + kind + '\')">Upload</button>';
    html += '</div>';
    html += '<div id="policy-doc-status-' + kind + '" style="margin-top:6px;font-size:12px;color:var(--text-muted);"></div>';
  }
  html += '</div>';
  return html;
}

function renderPoliciesSettings() {
  var container = document.getElementById('policies-settings');
  if (!container) return;

  var html = '<div class="field-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
  html += '<div class="field"><label>Deposit Amount</label><input type="number" id="policy-deposit-amount" min="0" step="0.01" value="' + (_policies.deposit_amount != null ? _policies.deposit_amount : '') + '" placeholder="e.g. 50"></div>';
  html += '<div class="field"><label>Deposit Type</label><select id="policy-deposit-type">';
  html += '<option value="">None</option>';
  html += '<option value="flat"' + (_policies.deposit_type === 'flat' ? ' selected' : '') + '>Flat $ amount</option>';
  html += '<option value="percent"' + (_policies.deposit_type === 'percent' ? ' selected' : '') + '>% of total</option>';
  html += '</select></div>';
  html += '</div>';

  html += '<div class="field"><label>Cancellation Policy</label><textarea id="policy-cancellation" rows="5" placeholder="e.g. Free cancellation up to 48 hours before your reservation. Cancellations within 48 hours forfeit the deposit.">' + escHtml(_policies.cancellation_policy || '') + '</textarea>';
  html += docUploadBlock('cancellation_policy', 'cancellation policy', _policies.cancellation_policy_doc_url);
  html += '</div>';

  html += '<div class="field" style="margin-top:16px;"><label>Refund Policy</label><textarea id="policy-refund" rows="5" placeholder="e.g. Refunds are processed within 5-7 business days to the original payment method.">' + escHtml(_policies.refund_policy || '') + '</textarea>';
  html += docUploadBlock('refund_policy', 'refund policy', _policies.refund_policy_doc_url);
  html += '</div>';

  html += '<button class="btn btn-primary btn-sm" style="margin-top:16px;" onclick="savePolicies()">Save Policies</button>';

  container.innerHTML = html;
}

async function savePolicies() {
  var payload = {
    deposit_amount: document.getElementById('policy-deposit-amount').value.trim(),
    deposit_type: document.getElementById('policy-deposit-type').value,
    cancellation_policy: document.getElementById('policy-cancellation').value.trim(),
    refund_policy: document.getElementById('policy-refund').value.trim(),
  };

  var result = await CC.dashboard.updatePolicies(payload);
  if (result) {
    _policies = Object.assign({}, _policies, result);
    toast('Policies saved', 'success');
  } else {
    toast('Failed to save — please try again', 'error');
  }
}

async function uploadPolicyDocument(kind) {
  var input = document.getElementById('policy-doc-input-' + kind);
  var file = input.files[0];
  if (!file) { toast('Choose a file first', 'error'); return; }

  var statusEl = document.getElementById('policy-doc-status-' + kind);
  statusEl.textContent = 'Uploading...';

  try {
    var base64 = await readFileAsBase64(file);
    var result = await CC.dashboard.uploadDocument({ kind: kind, file_base64: base64, mime: file.type });
    if (result && result.url) {
      _policies[kind + '_doc_url'] = result.url;
      toast('Document uploaded', 'success');
      renderPoliciesSettings();
    } else {
      statusEl.textContent = 'Upload failed — please try again';
    }
  } catch (e) {
    statusEl.textContent = 'Upload failed: ' + (e.message || 'unknown error');
  }
}

async function deletePolicyDocument(kind) {
  if (!confirm('Remove this document?')) return;
  await CC.dashboard.deleteDocument(kind);
  _policies[kind + '_doc_url'] = null;
  toast('Document removed');
  renderPoliciesSettings();
}

if (typeof escHtml === 'undefined') {
  function escHtml(str) { var d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }
}

onPageLoad('policies', loadPolicies);
