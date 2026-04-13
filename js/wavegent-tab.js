// ── Wavegent Page Generator ──────────────────────────────

var _wavegentConfig = null;
var _wavegentSlug = null;

function loadWavegentTab() {
  if (!_currentEntityId) return;
  const entity = _allEntities.find(e => e.id === _currentEntityId);
  if (!entity) return;
  _wavegentSlug = entity.slug;
  // Show URL section if already generated
  if (entity.slug) {
    showWavegentURL(entity.slug);
  }
}

function showWavegentURL(slug) {
  const urlSection = document.getElementById('wg-url-section');
  const urlInput = document.getElementById('wg-url-input');
  const previewFrame = document.getElementById('wg-preview-frame');
  const domain = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://cybercheck-login.vercel.app';
  const url = `${domain}/wavegent/${slug}`;
  urlInput.value = url;
  urlSection.style.display = 'block';
  previewFrame.src = url;
  document.getElementById('wg-preview-section').style.display = 'block';
}

async function generateWavegentPage() {
  if (!_currentEntityId || !_wavegentSlug) return;

  const btn = document.getElementById('wg-generate-btn');
  const status = document.getElementById('wg-status');

  btn.disabled = true;
  status.textContent = 'Generating...';

  try {
    // Fetch entity data from GCR API
    const entityRes = await fetch(
      API_BASE + '/api/gcr/entity/' + _wavegentSlug,
      { headers: { 'Authorization': 'Bearer ' + getAuthToken() } }
    );

    if (!entityRes.ok) {
      throw new Error('Failed to fetch entity data');
    }

    const entityData = await entityRes.json();
    const entity = entityData.entity || entityData;

    // Show success message
    status.textContent = '✓ Generated!';
    showWavegentURL(_wavegentSlug);

  } catch (err) {
    console.error('Wavegent generate error:', err);
    status.textContent = '✗ Error: ' + err.message;
  } finally {
    btn.disabled = false;
  }
}

function copyWavegentURL() {
  const input = document.getElementById('wg-url-input');
  input.select();
  document.execCommand('copy');
  const btn = event.target;
  const orig = btn.textContent;
  btn.textContent = '✓ Copied!';
  setTimeout(() => { btn.textContent = orig; }, 2000);
}

function openWavegentURL() {
  const url = document.getElementById('wg-url-input').value;
  if (url) window.open(url, '_blank');
}
