// ============================================
// Connections — Stripe Connect + OAuth cards
// ============================================
//
// STRIPE CONNECT (STANDARD) FLOW:
// ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
// │  Owner clicks │────>│  Stripe.com      │────>│  Owner logs  │
// │  "Connect"    │     │  OAuth authorize │     │  into Stripe │
// └──────────────┘     └──────────────────┘     └──────┬───────┘
//                                                       │ Authorizes
// ┌──────────────┐     ┌──────────────────┐            │
// │  We store     │<───│  Stripe sends    │<───────────┘
// │  account_id   │     │  auth code back  │
// │  (that's it!) │     │  to our callback │
// └──────────────┘     └──────────────────┘
//
// AT CHECKOUT:
// ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
// │  Customer    │────>│  Our Edge Fn      │────>│  Stripe API  │
// │  clicks pay  │     │  creates session  │     │  charges card│
// └──────────────┘     │  with:            │     └──────────────┘
//                       │  - account_id     │           │
//                       │  - app_fee (1%)   │     ┌─────┴────────┐
//                       └──────────────────┘     │  99% → Owner  │
//                                                 │  1%  → You    │
//                                                 └──────────────┘
//
// NO API KEYS EVER TOUCH YOUR PLATFORM.
// You only store the Stripe Connect account_id.
// ============================================

var STRIPE_CONNECT_STORAGE = 'beachside_stripe_connect';

// Your platform's Stripe Connect client ID (set this in production)
var PLATFORM_CLIENT_ID = window.CC_STRIPE_CLIENT_ID || 'ca_DEMO_your_platform_client_id';
var PLATFORM_FEE_PERCENT = 1; // Your cut: 1% of every transaction

var _stripeConnect = {
  accountId: '',
  connected: false,
  businessName: '',
  email: ''
};

var _connections = {
  square: { connected: false, label: 'Square', desc: 'POS and payment processing', icon: 'Sq', color: '#006aff' },
  paypal: { connected: false, label: 'PayPal', desc: 'Accept PayPal payments', icon: 'PP', color: '#003087' },
  google_analytics: { connected: false, label: 'Google Analytics', desc: 'Track site visitors and behavior', icon: 'GA', color: '#e37400' },
  google_business: { connected: false, label: 'Google Business', desc: 'Manage your Google listing', icon: 'GB', color: '#4285f4' },
  google_maps: { connected: false, label: 'Google Maps', desc: 'Show your location on a map', icon: 'GM', color: '#34a853' }
};

var _socialConnections = {
  facebook: { connected: false, label: 'Facebook', desc: 'Post updates, manage your page', icon: 'f', color: '#1877f2', scope: 'pages_manage_posts,pages_read_engagement' },
  instagram: { connected: false, label: 'Instagram', desc: 'Share photos and stories', icon: 'IG', color: '#e4405f', scope: 'instagram_basic,instagram_content_publish' },
  tiktok: { connected: false, label: 'TikTok', desc: 'Share short-form videos', icon: 'TT', color: '#000000', scope: 'video.publish' },
  twitter: { connected: false, label: 'Twitter / X', desc: 'Post updates and engage followers', icon: 'X', color: '#14171a', scope: 'tweet.read,tweet.write' },
  youtube: { connected: false, label: 'YouTube', desc: 'Upload videos, manage your channel', icon: 'YT', color: '#ff0000', scope: 'youtube.upload' }
};

var _manualKeyStatus = { saved: false, mode: '' };

var _squareStatus = { connected: false, mode: 'production', appId: null, locationId: null, connectedAt: null };
var _activeProcessor = 'stripe';

// ─── Google Business state ────────────────────────────────────────────────
var _googleBusiness = { connected: false, account_email: '', account_name: '', account_id: '', locations: [] };

function loadConnections() {
  // Check URL for OAuth callback first (after Stripe / Google redirect)
  checkStripeCallback();
  checkGoogleCallback();

  // Fetch Stripe status from API
  var token = getAuthToken();
  if (token) {
    fetch((window.CC_API_BASE || '') + '/api/stripe/status', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      _stripeConnect.connected = data.connected;
      _stripeConnect.accountId = data.accountId || '';
      _manualKeyStatus.saved = !!data.manualKey;
      _manualKeyStatus.mode  = data.manualKey ? (data.accountName || 'saved') : '';
      _manualKeyStatus.testKey = !!data.testKey;
      _manualKeyStatus.stripeMode = data.stripeMode || 'live';
      try { localStorage.setItem(STRIPE_CONNECT_STORAGE, JSON.stringify(_stripeConnect)); } catch(e) {}
      renderStripeSection();
    })
    .catch(function() {
      try {
        var saved = localStorage.getItem(STRIPE_CONNECT_STORAGE);
        if (saved) {
          var parsed = JSON.parse(saved);
          _stripeConnect.accountId = parsed.accountId || '';
          _stripeConnect.connected = !!parsed.accountId;
        }
      } catch(e) {}
      renderStripeSection();
    });
  } else {
    renderStripeSection();
  }

  // Load saved social connections from localStorage
  try {
    var savedSocial = localStorage.getItem('beachside_social_connections');
    if (savedSocial) {
      var parsedSocial = JSON.parse(savedSocial);
      Object.keys(parsedSocial).forEach(function(key) {
        if (_socialConnections[key]) {
          _socialConnections[key].connected = !!parsedSocial[key].connected;
          _socialConnections[key].username = parsedSocial[key].username || '';
          _socialConnections[key].pageId = parsedSocial[key].pageId || '';
        }
      });
    }
  } catch(e) {}

  // Fetch Square status from API
  if (token) {
    fetch((window.CC_API_BASE || '') + '/api/square/status', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      _squareStatus.connected = !!data.connected;
      _squareStatus.mode = data.mode || 'production';
      _squareStatus.appId = data.appId || null;
      _squareStatus.locationId = data.locationId || null;
      _squareStatus.connectedAt = data.connectedAt || null;
      _activeProcessor = data.activeProcessor || _activeProcessor;
      renderSquareSection();
      renderActiveProcessorSection();
    })
    .catch(function() { renderSquareSection(); renderActiveProcessorSection(); });
  } else {
    renderSquareSection();
    renderActiveProcessorSection();
  }

  renderPaymentConnections();
  loadGoogleBusinessStatus();   // fetches real status from API, then renders
  renderSocialConnections();
}

function checkStripeCallback() {
  // Check URL params for Stripe OAuth callback result
  var params = new URLSearchParams(window.location.search);
  var hash = window.location.hash;

  // Also check hash params (Stripe may redirect to /dashboard/#connections?stripe_connected=true)
  var hashParams = new URLSearchParams(hash.indexOf('?') !== -1 ? hash.split('?')[1] : '');

  var connected = params.get('stripe_connected') || hashParams.get('stripe_connected');
  var accountId = params.get('account_id') || hashParams.get('account_id');
  var stripeError = params.get('stripe_error') || hashParams.get('stripe_error');

  if (connected === 'true') {
    _stripeConnect.accountId = accountId || '';
    _stripeConnect.connected = true;
    try { localStorage.setItem(STRIPE_CONNECT_STORAGE, JSON.stringify(_stripeConnect)); } catch(e) {}
    window.history.replaceState({}, '', window.location.pathname + window.location.hash.split('?')[0]);
    toast('Stripe connected successfully! You can now accept payments.');
  }

  if (stripeError) {
    toast('Stripe connection failed: ' + decodeURIComponent(stripeError), 'error');
    window.history.replaceState({}, '', window.location.pathname + window.location.hash.split('?')[0]);
  }
}

function renderStripeSection() {
  var container = document.getElementById('stripe-settings');
  if (!container) return;

  var isConnected = _stripeConnect.connected;

  var html = '';

  // Header
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">';
  html += '<div style="width:48px;height:48px;border-radius:var(--radius);background:#635bff;display:flex;align-items:center;justify-content:center;">';
  html += '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>';
  html += '</div>';
  html += '<div style="flex:1;">';
  html += '<h4 style="margin:0;font-size:16px;">Stripe Payments</h4>';
  html += '<p style="margin:4px 0 0;font-size:13px;color:var(--text-muted);">Add your Stripe key to accept payments</p>';
  html += '</div>';
  if (isConnected) {
    html += '<span class="badge badge-success">Connected</span>';
  } else {
    html += '<span class="badge badge-warning">Not connected</span>';
  }
  html += '</div>';

  if (false && isConnected) {
    // ---- CONNECTED STATE (OAuth — hidden while Connect account is suspended) ----
    html += '<div style="padding:16px 20px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:var(--radius);margin-bottom:20px;">';
    html += '<div style="display:flex;align-items:center;gap:12px;">';
    html += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    html += '<div>';
    html += '<strong style="color:var(--text);">Stripe account connected</strong><br>';
    html += '<span style="font-size:12px;color:var(--text-muted);">Account: ' + escHtml(_stripeConnect.accountId) + '</span>';
    if (_stripeConnect.email) html += '<br><span style="font-size:12px;color:var(--text-muted);">' + escHtml(_stripeConnect.email) + '</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // Payment flow explanation
    html += '<div style="padding:16px 20px;background:rgba(99,91,255,0.08);border:1px solid rgba(99,91,255,0.2);border-radius:var(--radius);margin-bottom:20px;">';
    html += '<strong style="color:var(--text);font-size:14px;">How payments work:</strong>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px;">';

    html += '<div style="text-align:center;padding:12px;">';
    html += '<div style="font-size:24px;margin-bottom:6px;">🛒</div>';
    html += '<div style="font-size:12px;color:var(--text-muted);">Customer books on your site</div>';
    html += '</div>';

    html += '<div style="text-align:center;padding:12px;">';
    html += '<div style="font-size:24px;margin-bottom:6px;">💳</div>';
    html += '<div style="font-size:12px;color:var(--text-muted);">Pays on Stripe\'s secure checkout</div>';
    html += '</div>';

    html += '<div style="text-align:center;padding:12px;">';
    html += '<div style="font-size:24px;margin-bottom:6px;">💰</div>';
    html += '<div style="font-size:12px;color:var(--text-muted);">Money goes to YOUR Stripe account</div>';
    html += '</div>';

    html += '</div>';
    html += '<p style="font-size:12px;color:var(--text-dim);margin:12px 0 0;text-align:center;">Stripe fee: 2.9% + 30¢ | Platform fee: ' + PLATFORM_FEE_PERCENT + '% — you keep the rest</p>';
    html += '</div>';

    html += '<div style="display:flex;gap:10px;">';
    html += '<a href="https://dashboard.stripe.com" target="_blank" class="btn btn-outline btn-sm">Open Stripe Dashboard</a>';
    html += '<button class="btn btn-danger btn-sm" onclick="disconnectStripe()">Disconnect</button>';
    html += '</div>';

  }

  // ---- MANUAL KEY SECTION (via secure email link) ----
  html += '<div style="margin-top:24px;padding-top:24px;border-top:1px solid var(--card-border);">';
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">';
  html += '<span style="font-size:13px;font-weight:600;color:var(--text);">Or: Add Stripe Key via Secure Link</span>';
  if (_manualKeyStatus.saved) {
    html += '<span class="badge badge-success">Active</span>';
  }
  html += '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:10px;">';
  if (_manualKeyStatus.saved) html += '<span style="font-size:12px;color:#22c55e;">✓ Live key saved</span>&nbsp;';
  if (_manualKeyStatus.testKey) html += '<span style="font-size:12px;color:#f59e0b;">✓ Test key saved</span>';
  if (_manualKeyStatus.saved || _manualKeyStatus.testKey) {
    html += '<button class="btn btn-danger btn-sm" style="margin-left:auto;" onclick="deleteStripeKey()">Remove All</button>';
  }
  html += '</div>';
  // Mode toggle
  var isLiveMode = _manualKeyStatus.stripeMode !== 'test';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:10px 14px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);">';
  html += '<span style="font-size:13px;color:var(--text);font-weight:600;">Payment Mode:</span>';
  html += '<button onclick="setStripeMode(\'test\')" class="btn btn-sm" style="' + (!isLiveMode ? 'background:#f59e0b;color:#fff;' : 'background:var(--card-border);color:var(--text-muted);') + '">Test</button>';
  html += '<button onclick="setStripeMode(\'live\')" class="btn btn-sm" style="' + (isLiveMode ? 'background:#22c55e;color:#fff;' : 'background:var(--card-border);color:var(--text-muted);') + '">Live</button>';
  html += '<span style="font-size:12px;color:var(--text-muted);">' + (isLiveMode ? 'Real payments' : 'Test cards only') + '</span>';
  html += '</div>';
    html += '<div style="display:flex;gap:8px;margin-bottom:8px;">';
    html += '<input id="stripe-live-key" type="password" placeholder="sk_live_..." style="flex:1;padding:10px 14px;border:1px solid var(--card-border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px;font-family:monospace;">';
    html += '<button class="btn btn-primary" onclick="saveStripeKeyDirect(\'live\')" id="save-live-key-btn" style="white-space:nowrap;">Save Live</button>';
    html += '</div>';
    html += '<div style="display:flex;gap:8px;margin-bottom:10px;">';
    html += '<input id="stripe-test-key" type="password" placeholder="sk_test_..." style="flex:1;padding:10px 14px;border:1px solid var(--card-border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px;font-family:monospace;">';
    html += '<button class="btn btn-secondary" onclick="saveStripeKeyDirect(\'test\')" id="save-test-key-btn" style="white-space:nowrap;">Save Test</button>';
    html += '</div>';
    html += '<div style="display:flex;gap:10px;align-items:center;">';
    html += '<input id="stripe-setup-email" type="email" placeholder="Or enter email to send secure link" style="flex:1;padding:10px 14px;border:1px solid var(--card-border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px;">';
    html += '<button class="btn btn-secondary" onclick="sendStripeKeyLink()" id="send-key-link-btn" style="white-space:nowrap;">Send Link</button>';
    html += '</div>';
  html += '</div>';

  container.innerHTML = html;
}

function saveStripeKeyDirect(mode) {
  var token = getAuthToken();
  if (!token) { toast('Please log in first', 'error'); return; }

  var inputId = mode === 'test' ? 'stripe-test-key' : 'stripe-live-key';
  var btnId = mode === 'test' ? 'save-test-key-btn' : 'save-live-key-btn';
  var keyInput = document.getElementById(inputId);
  var secretKey = keyInput ? keyInput.value.trim() : '';
  if (!secretKey) { toast('Please enter a Stripe key', 'error'); return; }

  var expectedPrefix = mode === 'test' ? 'sk_test_' : 'sk_live_';
  if (!secretKey.startsWith(expectedPrefix)) {
    toast('Key must start with ' + expectedPrefix, 'error');
    return;
  }
  if (!/^sk_(test|live)_.{20,}$/.test(secretKey)) {
    toast('Invalid key format', 'error');
    return;
  }

  var btn = document.getElementById(btnId);
  if (btn) { btn.textContent = 'Saving...'; btn.disabled = true; }

  fetch((window.CC_API_BASE || '') + '/api/stripe/save-key', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret_key: secretKey })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) {
      toast('Error: ' + data.error, 'error');
      if (btn) { btn.textContent = mode === 'test' ? 'Save Test' : 'Save Live'; btn.disabled = false; }
      return;
    }
    toast((mode === 'live' ? 'Live' : 'Test') + ' key saved and encrypted.');
    if (keyInput) keyInput.value = '';
    renderStripeSection();
  })
  .catch(function(err) {
    toast('Error: ' + err.message, 'error');
    if (btn) { btn.textContent = mode === 'test' ? 'Save Test' : 'Save Live'; btn.disabled = false; }
  });
}

function setStripeMode(mode) {
  var token = getAuthToken();
  if (!token) return;
  fetch((window.CC_API_BASE || '') + '/api/stripe/set-mode', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: mode })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) { toast('Error: ' + data.error, 'error'); return; }
    toast('Switched to ' + mode + ' mode.');
    _manualKeyStatus.stripeMode = mode;
    renderStripeSection();
  })
  .catch(function(err) { toast('Error: ' + err.message, 'error'); });
}

function sendStripeKeyLink() {
  var token = getAuthToken();
  if (!token) { toast('Please log in first', 'error'); return; }

  var emailInput = document.getElementById('stripe-setup-email');
  var email = emailInput ? emailInput.value.trim() : '';
  if (!email) { toast('Please enter an email address', 'error'); return; }

  var btn = document.getElementById('send-key-link-btn');
  if (btn) { btn.textContent = '📧 Sending...'; btn.disabled = true; }

  fetch((window.CC_API_BASE || '') + '/api/stripe/send-key-link', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) {
      toast('Error: ' + data.error, 'error');
      if (btn) { btn.textContent = '📧 Send Setup Email'; btn.disabled = false; }
      return;
    }
    toast('Setup email sent to ' + data.email + '. Check your inbox for the secure link.');
    if (btn) { btn.textContent = '📧 Email Sent'; btn.disabled = true; }
  })
  .catch(function(err) {
    toast('Error sending email: ' + err.message, 'error');
    if (btn) { btn.textContent = '📧 Send Setup Email'; btn.disabled = false; }
  });
}

function deleteStripeKey() {
  if (!confirm('Remove your Stripe API key? Payments will stop working until you add a key or connect via Stripe.')) return;
  var token = getAuthToken();
  fetch((window.CC_API_BASE || '') + '/api/stripe/delete-key', {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function() {
    _manualKeyStatus.saved = false;
    _manualKeyStatus.mode  = '';
    toast('Stripe key removed');
    renderStripeSection();
  })
  .catch(function() { toast('Error removing key', 'error'); });
}

function getAuthToken() {
  // Check Supabase session first (primary auth method)
  try {
    var sbKey = Object.keys(localStorage).find(function(k) { return k.startsWith('sb-') && k.endsWith('-auth-token'); });
    if (sbKey) {
      var sbSession = JSON.parse(localStorage.getItem(sbKey));
      if (sbSession && sbSession.access_token) return sbSession.access_token;
    }
  } catch(e) {}
  // Fallback to legacy token
  return localStorage.getItem('cc_token') || sessionStorage.getItem('cc_token') || localStorage.getItem('auth_token') || null;
}

function startStripeConnect() {
  // Fetch the OAuth URL from backend, then redirect to Stripe
  var token = getAuthToken();
  if (!token) {
    toast('Please log in first', 'error');
    return;
  }

  fetch((window.CC_API_BASE || '') + '/api/stripe/connect-url', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.url) {
      window.location.href = data.url;
    } else if (data.error) {
      // Stripe not configured yet — show helpful message
      toast('Stripe Connect is not configured on the server yet. Add your STRIPE_CLIENT_ID to .env', 'error');
    } else {
      toast('Could not get Stripe connection URL', 'error');
    }
  })
  .catch(function(err) {
    toast('Error connecting to Stripe: ' + err.message, 'error');
  });
}

function disconnectStripe() {
  if (!confirm('Disconnect Stripe? Customers won\'t be able to pay online until you reconnect.')) return;

  var token = getAuthToken();
  fetch((window.CC_API_BASE || '') + '/api/stripe/disconnect', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function() {
    _stripeConnect = { accountId: '', connected: false, businessName: '', email: '' };
    try { localStorage.removeItem(STRIPE_CONNECT_STORAGE); } catch(e) {}
    renderStripeSection();
    toast('Stripe disconnected');
  })
  .catch(function() {
    // Disconnect locally even if API call fails
    _stripeConnect = { accountId: '', connected: false, businessName: '', email: '' };
    try { localStorage.removeItem(STRIPE_CONNECT_STORAGE); } catch(e) {}
    renderStripeSection();
    toast('Stripe disconnected');
  });
}

// ---- Square Payments ----

function renderSquareSection() {
  var container = document.getElementById('square-settings');
  if (!container) return;

  var html = '';

  // Header
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">';
  html += '<div style="width:48px;height:48px;border-radius:var(--radius);background:#006aff;display:flex;align-items:center;justify-content:center;">';
  html += '<span style="color:#fff;font-weight:800;font-size:18px;">Sq</span>';
  html += '</div>';
  html += '<div style="flex:1;">';
  html += '<h4 style="margin:0;font-size:16px;">Square Payments</h4>';
  html += '<p style="margin:4px 0 0;font-size:13px;color:var(--text-muted);">Add your Square credentials to accept payments</p>';
  html += '</div>';
  if (_squareStatus.connected) {
    html += '<span class="badge badge-success">Connected</span>';
  } else {
    html += '<span class="badge badge-warning">Not connected</span>';
  }
  html += '</div>';

  if (_squareStatus.connected) {
    html += '<div style="padding:12px 16px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:var(--radius);margin-bottom:16px;display:flex;align-items:center;gap:10px;">';
    html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    html += '<div><strong style="color:var(--text);font-size:13px;">Square connected</strong>';
    if (_squareStatus.appId) html += '<br><span style="font-size:11px;color:var(--text-muted);">App ID: ' + escHtml(_squareStatus.appId) + '</span>';
    html += '</div>';
    html += '</div>';
  }

  // Mode toggle
  var isSandbox = _squareStatus.mode === 'sandbox';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:10px 14px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);">';
  html += '<span style="font-size:13px;color:var(--text);font-weight:600;">Mode:</span>';
  html += '<button onclick="setSquareMode(\'sandbox\')" class="btn btn-sm" style="' + (isSandbox ? 'background:#f59e0b;color:#fff;' : 'background:var(--card-border);color:var(--text-muted);') + '">Sandbox</button>';
  html += '<button onclick="setSquareMode(\'production\')" class="btn btn-sm" style="' + (!isSandbox ? 'background:#22c55e;color:#fff;' : 'background:var(--card-border);color:var(--text-muted);') + '">Production</button>';
  html += '<span style="font-size:12px;color:var(--text-muted);">' + (isSandbox ? 'Test cards only' : 'Real payments') + '</span>';
  html += '</div>';

  // Credential inputs
  html += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">';
  html += '<input id="sq-access-token" type="password" placeholder="Access Token (EAAAl...)" style="padding:10px 14px;border:1px solid var(--card-border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px;font-family:monospace;">';
  html += '<input id="sq-app-id" type="text" placeholder="Application ID (sq0idp-...)" style="padding:10px 14px;border:1px solid var(--card-border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px;font-family:monospace;">';
  html += '<input id="sq-location-id" type="text" placeholder="Location ID" style="padding:10px 14px;border:1px solid var(--card-border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:13px;font-family:monospace;">';
  html += '</div>';

  html += '<div style="display:flex;gap:10px;">';
  html += '<button class="btn btn-primary" id="save-sq-btn" onclick="saveSquareCredentials()">Save Credentials</button>';
  if (_squareStatus.connected) {
    html += '<button class="btn btn-danger btn-sm" onclick="disconnectSquare()">Disconnect</button>';
  }
  html += '</div>';

  container.innerHTML = html;
}

function saveSquareCredentials() {
  var token = getAuthToken();
  if (!token) { toast('Please log in first', 'error'); return; }

  var accessToken = (document.getElementById('sq-access-token') || {}).value.trim();
  var appId = (document.getElementById('sq-app-id') || {}).value.trim();
  var locationId = (document.getElementById('sq-location-id') || {}).value.trim();

  if (!accessToken) { toast('Access Token is required', 'error'); return; }
  if (!appId) { toast('Application ID is required', 'error'); return; }
  if (!locationId) { toast('Location ID is required', 'error'); return; }

  var btn = document.getElementById('save-sq-btn');
  if (btn) { btn.textContent = 'Saving...'; btn.disabled = true; }

  fetch((window.CC_API_BASE || '') + '/api/square/save-credentials', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken, app_id: appId, location_id: locationId, mode: _squareStatus.mode })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) {
      toast('Error: ' + data.error, 'error');
      if (btn) { btn.textContent = 'Save Credentials'; btn.disabled = false; }
      return;
    }
    toast('Square credentials saved successfully!');
    _squareStatus.connected = true;
    _squareStatus.appId = appId;
    _squareStatus.locationId = locationId;
    renderSquareSection();
  })
  .catch(function(err) {
    toast('Error: ' + err.message, 'error');
    if (btn) { btn.textContent = 'Save Credentials'; btn.disabled = false; }
  });
}

function disconnectSquare() {
  if (!confirm('Disconnect Square? Payments will stop working until you reconnect.')) return;
  var token = getAuthToken();
  fetch((window.CC_API_BASE || '') + '/api/square/disconnect', {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function() {
    _squareStatus.connected = false;
    _squareStatus.appId = null;
    _squareStatus.locationId = null;
    toast('Square disconnected');
    renderSquareSection();
    renderActiveProcessorSection();
  })
  .catch(function() { toast('Error disconnecting Square', 'error'); });
}

function setSquareMode(mode) {
  _squareStatus.mode = mode;
  renderSquareSection();
}

function renderActiveProcessorSection() {
  var container = document.getElementById('active-processor-section');
  if (!container) return;

  var html = '<h4 style="margin:0 0 8px;font-size:15px;font-weight:600;color:var(--text);">Active Payment Processor</h4>';
  html += '<p style="margin:0 0 16px;font-size:13px;color:var(--text-muted);">Choose which processor handles checkout payments for your site.</p>';
  html += '<div style="display:flex;gap:12px;">';
  html += '<button onclick="setActiveProcessor(\'stripe\')" class="btn btn-sm" style="' + (_activeProcessor === 'stripe' ? 'background:#635bff;color:#fff;' : 'background:var(--card-border);color:var(--text-muted);') + 'padding:10px 20px;">Stripe</button>';
  html += '<button onclick="setActiveProcessor(\'square\')" class="btn btn-sm" style="' + (_activeProcessor === 'square' ? 'background:#006aff;color:#fff;' : 'background:var(--card-border);color:var(--text-muted);') + 'padding:10px 20px;">Square</button>';
  html += '</div>';
  if (_activeProcessor) {
    html += '<p style="margin:12px 0 0;font-size:12px;color:var(--text-muted);">Active: <strong>' + escHtml(_activeProcessor.charAt(0).toUpperCase() + _activeProcessor.slice(1)) + '</strong> — checkout will use this processor.</p>';
  }

  container.innerHTML = html;
}

function setActiveProcessor(proc) {
  var token = getAuthToken();
  if (!token) { toast('Please log in first', 'error'); return; }

  fetch((window.CC_API_BASE || '') + '/api/square/set-processor', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ processor: proc })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) { toast('Error: ' + data.error, 'error'); return; }
    _activeProcessor = proc;
    toast('Active processor set to ' + proc);
    renderActiveProcessorSection();
  })
  .catch(function(err) { toast('Error: ' + err.message, 'error'); });
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ---- Other providers (OAuth-based) ----

function renderPaymentConnections() {
  var container = document.getElementById('payment-connections');
  if (!container) return;
  var html = '';
  ['paypal'].forEach(function(key) { html += buildConnectionCard(key); });
  container.innerHTML = html;
}

function buildConnectionCard(key) {
  var conn = _connections[key];
  var statusBadge = conn.connected
    ? '<span class="badge badge-success">Connected</span>'
    : '<span class="badge badge-warning">Not connected</span>';
  var btnLabel = conn.connected ? 'Disconnect' : 'Connect';
  var btnClass = conn.connected ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm';
  var html = '<div class="oauth-card">';
  html += '<div class="provider-icon" style="background:' + conn.color + ';color:white;font-weight:700;font-size:14px;">' + conn.icon + '</div>';
  html += '<div class="provider-info">';
  html += '<h4>' + conn.label + '</h4>';
  html += '<p>' + conn.desc + '</p>';
  html += '<div style="margin-top:8px;display:flex;align-items:center;gap:8px;">' + statusBadge;
  html += '<button class="' + btnClass + '" onclick="toggleConnection(\'' + key + '\')">' + btnLabel + '</button>';
  html += '</div></div></div>';
  return html;
}

function toggleConnection(key) {
  var conn = _connections[key];
  if (!conn) return;
  if (conn.connected) {
    if (!confirm('Disconnect ' + conn.label + '?')) return;
    conn.connected = false;
    toast(conn.label + ' disconnected');
  } else {
    conn.connected = true;
    toast(conn.label + ' connected successfully');
  }
  renderPaymentConnections();
  renderGoogleConnections();
}

// ─── Check for Google OAuth callback result ───────────────────────────────
function checkGoogleCallback() {
  var hashParams = new URLSearchParams(window.location.hash.indexOf('?') !== -1 ? window.location.hash.split('?')[1] : '');
  var urlParams  = new URLSearchParams(window.location.search);
  var connected  = hashParams.get('google_connected') || urlParams.get('google_connected');
  var gErr       = hashParams.get('google_error')     || urlParams.get('google_error');

  if (connected === '1') {
    toast('Google Business Profile connected!');
    window.history.replaceState({}, '', window.location.pathname + window.location.hash.split('?')[0]);
    loadGoogleBusinessStatus();
  } else if (gErr) {
    toast('Google connection failed: ' + decodeURIComponent(gErr), 'error');
    window.history.replaceState({}, '', window.location.pathname + window.location.hash.split('?')[0]);
  }
}

// ─── Load real Google Business status from API ────────────────────────────
function loadGoogleBusinessStatus() {
  var token = getAuthToken();
  if (!token) { renderGoogleConnections(); return; }

  fetch((window.CC_API_BASE || '') + '/api/dashboard/google-business/status', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    _googleBusiness.connected    = !!data.connected;
    _googleBusiness.account_email = data.account_email || '';
    _googleBusiness.account_name  = data.account_name  || '';
    _googleBusiness.account_id    = data.account_id    || '';
    _googleBusiness.locations     = data.accounts       || [];
    renderGoogleConnections();
  })
  .catch(function() { renderGoogleConnections(); });
}

function renderGoogleConnections() {
  var container = document.getElementById('google-connections');
  if (!container) return;
  var html = '';

  // ── Google Business Profile (REAL OAuth) ────────────────────────────────
  html += '<div class="oauth-card">';
  html += '<div class="provider-icon" style="background:#4285f4;color:white;font-weight:700;font-size:14px;">GB</div>';
  html += '<div class="provider-info">';
  html += '<h4>Google Business Profile</h4>';

  if (_googleBusiness.connected) {
    html += '<p style="color:var(--success,#22c55e);">✓ Connected' +
      (_googleBusiness.account_email ? ' as ' + escHtml(_googleBusiness.account_email) : '') + '</p>';
    if (_googleBusiness.account_name) {
      html += '<p style="font-size:12px;color:var(--text-muted);">Account: ' + escHtml(_googleBusiness.account_name) + '</p>';
    }
    html += '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">';
    html += '<button class="btn btn-primary btn-sm" onclick="syncGoogleReviews()">↻ Sync Reviews</button>';
    html += '<button class="btn btn-outline btn-sm" onclick="disconnectGoogleBusiness()">Disconnect</button>';
    html += '</div>';
  } else {
    html += '<p>Connect your Google Business Profile to sync reviews and manage your listing.</p>';
    html += '<div style="margin-top:8px;">';
    html += '<button class="btn btn-primary btn-sm" onclick="startGoogleBusinessConnect()" style="display:inline-flex;align-items:center;gap:8px;">';
    html += '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>';
    html += 'Connect Google Business</button>';
    html += '</div>';
  }

  html += '</div></div>';

  // ── Google Analytics (placeholder — coming soon) ──────────────────────
  html += buildComingSoonCard('Google Analytics', 'GA', '#e37400', 'Track site visitors and conversion data');

  // ── Google Maps (placeholder — coming soon) ───────────────────────────
  html += buildComingSoonCard('Google Maps', 'GM', '#34a853', 'Show your location on a map embed');

  container.innerHTML = html;
}

function buildComingSoonCard(label, icon, color, desc) {
  var html = '<div class="oauth-card" style="opacity:.7;">';
  html += '<div class="provider-icon" style="background:' + color + ';color:white;font-weight:700;font-size:14px;">' + icon + '</div>';
  html += '<div class="provider-info">';
  html += '<h4>' + label + ' <span style="font-size:11px;background:var(--card-border);color:var(--text-muted);padding:2px 6px;border-radius:4px;vertical-align:middle;">Coming soon</span></h4>';
  html += '<p>' + desc + '</p>';
  html += '</div></div>';
  return html;
}

function startGoogleBusinessConnect() {
  var token = getAuthToken();
  if (!token) { toast('Please log in first', 'error'); return; }

  // Get site_id from current user session
  var siteId = window.CC_SITE_ID || '';
  var apiBase = window.CC_API_BASE || '';
  var returnTo = encodeURIComponent(window.location.href);

  var url = apiBase + '/api/google-business/auth'
    + '?site_id=' + encodeURIComponent(siteId)
    + '&jwt='     + encodeURIComponent(token)
    + '&return_to=' + returnTo;

  window.location.href = url;
}

function disconnectGoogleBusiness() {
  if (!confirm('Disconnect Google Business Profile?')) return;
  var token = getAuthToken();
  if (!token) return;

  fetch((window.CC_API_BASE || '') + '/api/dashboard/google-business/disconnect', {
    method:  'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function() {
    _googleBusiness = { connected: false, account_email: '', account_name: '', account_id: '', locations: [] };
    renderGoogleConnections();
    toast('Google Business disconnected');
  })
  .catch(function(err) { toast('Error disconnecting: ' + err.message, 'error'); });
}

function syncGoogleReviews() {
  var token = getAuthToken();
  if (!token) return;
  toast('Syncing Google reviews…');

  fetch((window.CC_API_BASE || '') + '/api/dashboard/google-business/sync-reviews', {
    method:  'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) { toast(data.error, 'error'); return; }
    toast('Synced ' + data.imported + ' new review' + (data.imported !== 1 ? 's' : '') + ' from Google');
  })
  .catch(function(err) { toast('Sync failed: ' + err.message, 'error'); });
}

// ---- Social Media OAuth ----

function renderSocialConnections() {
  var container = document.getElementById('social-connections');
  if (!container) return;
  var html = '';
  Object.keys(_socialConnections).forEach(function(key) { html += buildSocialCard(key); });
  container.innerHTML = html;
}

function buildSocialCard(key) {
  var conn = _socialConnections[key];
  var statusHtml = conn.connected
    ? '<span class="badge badge-success">Connected</span>'
    : '<span class="badge badge-warning">Not connected</span>';
  var btnLabel = conn.connected ? 'Disconnect' : 'Connect';
  var btnClass = conn.connected ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm';

  var usernameHtml = '';
  if (conn.connected && conn.username) {
    usernameHtml = '<div style="font-size:11px;color:var(--text-dim);margin-top:4px;">@' + escHtml(conn.username) + '</div>';
  }

  var html = '<div class="oauth-card">';
  html += '<div class="provider-icon" style="background:' + conn.color + ';color:white;font-weight:700;font-size:14px;">' + conn.icon + '</div>';
  html += '<div class="provider-info">';
  html += '<h4>' + conn.label + '</h4>';
  html += '<p>' + conn.desc + '</p>' + usernameHtml;
  html += '<div style="margin-top:8px;display:flex;align-items:center;gap:8px;">' + statusHtml;
  html += '<button class="' + btnClass + '" onclick="toggleSocialConnection(\'' + key + '\')">' + btnLabel + '</button>';
  html += '</div></div></div>';
  return html;
}

function toggleSocialConnection(key) {
  var conn = _socialConnections[key];
  if (!conn) return;

  if (conn.connected) {
    if (!confirm('Disconnect ' + conn.label + '? You won\'t be able to auto-post until you reconnect.')) return;
    conn.connected = false;
    conn.username = '';
    conn.pageId = '';
    toast(conn.label + ' disconnected');
  } else {
    // In production: redirect to OAuth
    // e.g. https://www.facebook.com/v18.0/dialog/oauth?client_id=APP_ID&redirect_uri=...&scope=pages_manage_posts
    var demoConfirm = confirm(
      'In production, you would be redirected to ' + conn.label + ' to authorize your account.\n\n' +
      'Click OK to simulate a successful ' + conn.label + ' connection.'
    );
    if (!demoConfirm) return;

    conn.connected = true;
    conn.username = 'beachsidecircleboats';
    conn.pageId = key + '_page_' + Date.now().toString(36);
    toast(conn.label + ' connected!');
  }

  // Save to localStorage
  var saveData = {};
  Object.keys(_socialConnections).forEach(function(k) {
    saveData[k] = {
      connected: _socialConnections[k].connected,
      username: _socialConnections[k].username || '',
      pageId: _socialConnections[k].pageId || ''
    };
  });
  try { localStorage.setItem('beachside_social_connections', JSON.stringify(saveData)); } catch(e) {}

  renderSocialConnections();
}

onPageLoad('connections', loadConnections);
