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
//                       │  - app_fee (3%)   │     ┌─────┴────────┐
//                       └──────────────────┘     │  97% → Owner  │
//                                                 │  3%  → You    │
//                                                 └──────────────┘
//
// NO API KEYS EVER TOUCH YOUR PLATFORM.
// You only store the Stripe Connect account_id.
// ============================================

var STRIPE_CONNECT_STORAGE = 'beachside_stripe_connect';

// Your platform's Stripe Connect client ID (set this in production)
var PLATFORM_CLIENT_ID = 'ca_DEMO_your_platform_client_id';
var PLATFORM_FEE_PERCENT = 3; // Your cut: 3% of every transaction

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

function loadConnections() {
  // Check URL for OAuth callback first (after Stripe redirect)
  checkStripeCallback();

  // Fetch Stripe status from API
  var token = localStorage.getItem('cc_token') || localStorage.getItem('auth_token');
  if (token) {
    fetch('/api/stripe/status', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      _stripeConnect.connected = data.connected;
      _stripeConnect.accountId = data.accountId || '';
      try { localStorage.setItem(STRIPE_CONNECT_STORAGE, JSON.stringify(_stripeConnect)); } catch(e) {}
      renderStripeSection();
    })
    .catch(function() {
      // Fallback to localStorage
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

  renderPaymentConnections();
  renderGoogleConnections();
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
  html += '<h4 style="margin:0;font-size:16px;">Stripe Connect</h4>';
  html += '<p style="margin:4px 0 0;font-size:13px;color:var(--text-muted);">Accept payments directly to your Stripe account</p>';
  html += '</div>';
  if (isConnected) {
    html += '<span class="badge badge-success">Connected</span>';
  } else {
    html += '<span class="badge badge-warning">Not connected</span>';
  }
  html += '</div>';

  if (isConnected) {
    // ---- CONNECTED STATE ----
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

  } else {
    // ---- NOT CONNECTED STATE ----
    html += '<div style="text-align:center;padding:32px 20px;background:var(--bg);border:2px dashed var(--card-border);border-radius:var(--radius-lg);margin-bottom:20px;">';
    html += '<div style="font-size:48px;margin-bottom:16px;">💳</div>';
    html += '<h3 style="font-size:18px;margin-bottom:8px;color:var(--text);">Connect Your Stripe Account</h3>';
    html += '<p style="font-size:14px;color:var(--text-muted);max-width:400px;margin:0 auto 24px;">Click the button below to connect your Stripe account. You\'ll be taken to Stripe\'s secure site to log in or create an account. No API keys needed — we never see your credentials.</p>';
    html += '<button class="btn btn-primary" onclick="startStripeConnect()" style="padding:14px 32px;font-size:16px;">Connect with Stripe</button>';
    html += '</div>';

    // How it works
    html += '<div style="padding:16px 20px;background:rgba(0,173,168,0.08);border:1px solid rgba(0,173,168,0.2);border-radius:var(--radius);margin-bottom:16px;">';
    html += '<strong style="color:var(--text);font-size:14px;">How it works:</strong>';
    html += '<ol style="margin:10px 0 0;padding-left:20px;color:var(--text-muted);font-size:13px;line-height:1.8;">';
    html += '<li>Click <strong>"Connect with Stripe"</strong> above</li>';
    html += '<li>You\'re taken to <strong>Stripe.com</strong> — log in or create a free account</li>';
    html += '<li>Authorize CyberCheck to send payments to your account</li>';
    html += '<li>You\'re redirected back here — that\'s it, you\'re done!</li>';
    html += '</ol>';
    html += '</div>';

    html += '<div style="padding:12px 16px;background:rgba(0,173,168,0.05);border:1px solid rgba(0,173,168,0.15);border-radius:var(--radius);">';
    html += '<div style="display:flex;align-items:flex-start;gap:10px;">';
    html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ada8" stroke-width="2" style="flex-shrink:0;margin-top:2px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    html += '<span style="font-size:12px;color:var(--text-dim);">We never see or store your Stripe password or API keys. We only receive a secure account ID that lets us route payments to you.</span>';
    html += '</div>';
    html += '</div>';
  }

  container.innerHTML = html;
}

function startStripeConnect() {
  // Fetch the OAuth URL from backend, then redirect to Stripe
  var token = localStorage.getItem('cc_token') || localStorage.getItem('auth_token');
  if (!token) {
    toast('Please log in first', 'error');
    return;
  }

  fetch('/api/stripe/connect-url', {
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

  var token = localStorage.getItem('cc_token') || localStorage.getItem('auth_token');
  fetch('/api/stripe/disconnect', {
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

// ---- Other providers (OAuth-based) ----

function renderPaymentConnections() {
  var container = document.getElementById('payment-connections');
  var html = '';
  ['square', 'paypal'].forEach(function(key) { html += buildConnectionCard(key); });
  container.innerHTML = html;
}

function renderGoogleConnections() {
  var container = document.getElementById('google-connections');
  var html = '';
  ['google_analytics', 'google_business', 'google_maps'].forEach(function(key) { html += buildConnectionCard(key); });
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
