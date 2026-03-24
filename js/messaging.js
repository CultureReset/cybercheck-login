// ============================================
// Messaging — SMS notifications, phone numbers,
// booking confirmations, photo-to-gallery, voice AI
// ============================================
//
// ARCHITECTURE:
// ┌─────────────────────────────────────────────────────┐
// │  CyberCheck Admin Dashboard                         │
// │  ─ Assigns 2 Twilio numbers per business            │
// │    1. Owner Line:    owner calls/texts to control    │
// │    2. Customer Line: customers receive SMS from this │
// │  ─ Manages ElevenLabs API key (one for platform)    │
// └───────┬──────────────────────────────┬──────────────┘
//         │                              │
// ┌───────▼──────────┐   ┌──────────────▼──────────────┐
// │  Twilio Webhooks  │   │  Supabase Edge Functions     │
// │  (inbound SMS/    │   │  ─ Send booking confirmations│
// │   voice calls)    │   │  ─ Process photo MMS         │
// │                   │   │  ─ Route voice to AI         │
// └───────┬───────────┘   └──────────────────────────────┘
//         │
//  ┌──────▼──────────────────┐
//  │  Business owner texts:   │
//  │  Photo → auto-add gallery│
//  │  "How many bookings?" →  │
//  │    AI answers via SMS    │
//  │  Owner CALLS → ElevenLabs│
//  │    voice AI answers      │
//  └──────────────────────────┘

var MESSAGING_STORAGE = 'beachside_messaging';

var _messagingData = {
  // Assigned by admin (manually for now)
  ownerPhone: '',
  customerPhone: '',
  // Business enters this — where booking SMS alerts get sent
  notificationPhone: '',
  notificationEmail: '',

  // Booking confirmation templates
  customerBookingTemplate: 'Hi {{customer_name}}! Your booking with {{business_name}} is confirmed.\n\nDate: {{date}}\nTime: {{time_slot}}\nBoats: {{boat_count}}x {{boat_type}}\nAdd-ons: {{addons}}\nTotal: ${{total}}\n\nLocation: {{location}}\n\nQuestions? Reply to this number or call us!\n\nSee you on the water! 🚤',

  ownerBookingTemplate: 'NEW BOOKING!\n\nCustomer: {{customer_name}}\nPhone: {{customer_phone}}\nEmail: {{customer_email}}\nDate: {{date}}\nTime: {{time_slot}}\nBoats: {{boat_count}}x {{boat_type}}\nAdd-ons: {{addons}}\nGuests: {{guest_count}}\nTotal: ${{total}}\n\nPayment: {{payment_status}}',

  // Photo gallery via SMS
  photoGalleryEnabled: true,
  photoGallerySection: 'gallery', // which part of site photos go to

  // Voice AI
  voiceAiEnabled: false,
  voiceGreeting: 'Hello! This is the AI assistant for {{business_name}}. How can I help you today?',

  // Notification toggles
  notifyCustomerOnBooking: true,
  notifyOwnerOnBooking: true,
  notifyCustomerOnCancel: true,
  notifyOwnerOnCancel: true
};

async function loadMessaging() {
  var apiData = await CC.dashboard.getMessaging();
  if (apiData && typeof apiData === 'object') {
    var map = {
      owner_phone: 'ownerPhone', customer_phone: 'customerPhone',
      notification_phone: 'notificationPhone',
      notification_email: 'notificationEmail',
      customer_booking_template: 'customerBookingTemplate',
      owner_booking_template: 'ownerBookingTemplate',
      photo_gallery_enabled: 'photoGalleryEnabled',
      photo_gallery_section: 'photoGallerySection',
      voice_ai_enabled: 'voiceAiEnabled', voice_greeting: 'voiceGreeting',
      notify_customer_on_booking: 'notifyCustomerOnBooking',
      notify_owner_on_booking: 'notifyOwnerOnBooking',
      notify_customer_on_cancel: 'notifyCustomerOnCancel',
      notify_owner_on_cancel: 'notifyOwnerOnCancel'
    };
    Object.keys(map).forEach(function(col) {
      if (apiData[col] !== undefined) _messagingData[map[col]] = apiData[col];
    });
    try { localStorage.setItem(MESSAGING_STORAGE, JSON.stringify(_messagingData)); } catch(e) {}
  } else {
    loadFromLocalStorage();
  }
  renderMessagingPage();
}

function loadFromLocalStorage() {
  try {
    var saved = localStorage.getItem(MESSAGING_STORAGE);
    if (saved) {
      var parsed = JSON.parse(saved);
      Object.keys(parsed).forEach(function(key) {
        if (_messagingData.hasOwnProperty(key)) {
          _messagingData[key] = parsed[key];
        }
      });
    }
  } catch(e) {}
}

function saveMessagingData() {
  try { localStorage.setItem(MESSAGING_STORAGE, JSON.stringify(_messagingData)); } catch(e) {}
  CC.dashboard.updateMessaging({
    owner_phone: _messagingData.ownerPhone,
    customer_phone: _messagingData.customerPhone,
    notification_phone: _messagingData.notificationPhone,
    notification_email: _messagingData.notificationEmail,
    customer_booking_template: _messagingData.customerBookingTemplate,
    owner_booking_template: _messagingData.ownerBookingTemplate,
    photo_gallery_enabled: _messagingData.photoGalleryEnabled,
    photo_gallery_section: _messagingData.photoGallerySection,
    voice_ai_enabled: _messagingData.voiceAiEnabled,
    voice_greeting: _messagingData.voiceGreeting,
    notify_customer_on_booking: _messagingData.notifyCustomerOnBooking,
    notify_owner_on_booking: _messagingData.notifyOwnerOnBooking,
    notify_customer_on_cancel: _messagingData.notifyCustomerOnCancel,
    notify_owner_on_cancel: _messagingData.notifyOwnerOnCancel
  }).catch(function(err) { console.warn('Failed to save messaging settings:', err); });
}

function renderMessagingPage() {
  // Phone numbers section
  renderPhoneNumbers();
  // Notification toggles
  renderNotificationToggles();
  // Customer booking template
  renderCustomerTemplate();
  // Owner booking template
  renderOwnerTemplate();
  // Template preview
  renderTemplatePreview();
  // Photo gallery via SMS
  renderPhotoGallery();
  // Voice AI section
  renderVoiceAi();
}

// ---- Phone Numbers ----

function renderPhoneNumbers() {
  var container = document.getElementById('phone-numbers-section');
  if (!container) return;

  var html = '';

  // ── Booking notification number (business enters this) ────────────────────
  html += '<div style="padding:20px;background:var(--bg);border:2px solid var(--primary);border-radius:var(--radius-lg);margin-bottom:20px;">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">';
  html += '<div style="width:36px;height:36px;border-radius:50%;background:rgba(0,173,168,0.15);display:flex;align-items:center;justify-content:center;">';
  html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ada8" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
  html += '</div>';
  html += '<div>';
  html += '<strong style="font-size:14px;">Your Booking Notification Number</strong>';
  html += '<div style="font-size:12px;color:var(--text-muted);">This is YOUR phone number — you\'ll get an SMS every time a new booking comes in</div>';
  html += '</div>';
  html += '</div>';
  html += '<div style="display:flex;gap:10px;align-items:center;">';
  html += '<input id="notification-phone-input" type="tel" placeholder="(555) 555-5555" value="' + escHtml(_messagingData.notificationPhone || '') + '" style="flex:1;padding:10px 14px;border:1px solid var(--card-border);border-radius:var(--radius);background:var(--card-bg);color:var(--text);font-size:15px;" />';
  html += '<button class="btn btn-primary" onclick="saveNotificationPhone()">Save</button>';
  html += '</div>';
  if (_messagingData.notificationPhone) {
    html += '<div style="margin-top:8px;font-size:12px;color:var(--success);">✓ Booking alerts will be sent to ' + formatPhone(_messagingData.notificationPhone) + '</div>';
  } else {
    html += '<div style="margin-top:8px;font-size:12px;color:var(--text-dim);">Enter your cell number above to receive booking alerts via SMS</div>';
  }
  html += '<div style="margin-top:12px;padding:12px 14px;background:rgba(0,173,168,0.06);border:1px solid rgba(0,173,168,0.18);border-radius:var(--radius);">';
  html += '<p style="font-size:11px;color:var(--text-muted);margin:0;line-height:1.6;">';
  html += '<strong>SMS Consent:</strong> By saving your phone number above, you agree to receive booking alert text messages from this platform. ';
  html += 'Message frequency varies. Message &amp; data rates may apply. Reply <strong>STOP</strong> to unsubscribe or <strong>HELP</strong> for help. ';
  html += 'View <a href="https://cybercheck-login.vercel.app/privacy.html" target="_blank" style="color:var(--primary);">Privacy Policy</a> and <a href="https://cybercheck-login.vercel.app/terms.html" target="_blank" style="color:var(--primary);">Terms &amp; Conditions</a>.';
  html += '</p></div>';
  html += '</div>';

  // ── Booking notification email ─────────────────────────────────────────────
  html += '<div style="padding:20px;background:var(--bg);border:2px solid var(--primary);border-radius:var(--radius-lg);margin-bottom:20px;">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">';
  html += '<div style="width:36px;height:36px;border-radius:50%;background:rgba(0,173,168,0.15);display:flex;align-items:center;justify-content:center;">📧</div>';
  html += '<div><strong style="font-size:14px;">Your Booking Notification Email</strong>';
  html += '<div style="font-size:12px;color:var(--text-muted);">You\'ll get an email every time a new booking comes in</div></div>';
  html += '</div>';
  html += '<div style="display:flex;gap:10px;align-items:center;">';
  html += '<input id="notification-email-input" type="email" placeholder="you@email.com" value="' + escHtml(_messagingData.notificationEmail || '') + '" style="flex:1;padding:10px 14px;border:1px solid var(--card-border);border-radius:var(--radius);background:var(--card-bg);color:var(--text);font-size:15px;" />';
  html += '<button class="btn btn-primary" onclick="saveNotificationEmail()">Save</button>';
  html += '</div>';
  if (_messagingData.notificationEmail) {
    html += '<div style="margin-top:8px;font-size:12px;color:var(--success);">✓ Booking alerts will be emailed to ' + escHtml(_messagingData.notificationEmail) + '</div>';
  }
  html += '</div>';

  // ── Platform-assigned lines (read-only, admin assigns) ────────────────────
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">';

  // Owner Twilio line
  html += '<div style="padding:20px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius-lg);">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">';
  html += '<div style="width:36px;height:36px;border-radius:50%;background:rgba(168,85,247,0.15);display:flex;align-items:center;justify-content:center;">';
  html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
  html += '</div>';
  html += '<div><strong style="font-size:14px;">Your Business Line</strong>';
  html += '<div style="font-size:12px;color:var(--text-muted);">Text/call this to control your dashboard via AI</div></div>';
  html += '</div>';
  if (_messagingData.ownerPhone) {
    html += '<div style="font-size:22px;font-weight:700;color:#a855f7;margin-bottom:6px;">' + formatPhone(_messagingData.ownerPhone) + '</div>';
    html += '<div style="font-size:12px;color:var(--text-dim);">Text photos → auto-add to gallery | Ask AI questions about bookings</div>';
  } else {
    html += '<div style="padding:12px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:var(--radius);text-align:center;">';
    html += '<div style="font-size:12px;color:var(--warning);">Assigned by admin during setup</div>';
    html += '</div>';
  }
  html += '</div>';

  // Customer Twilio line
  html += '<div style="padding:20px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius-lg);">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">';
  html += '<div style="width:36px;height:36px;border-radius:50%;background:rgba(34,197,94,0.15);display:flex;align-items:center;justify-content:center;">';
  html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  html += '</div>';
  html += '<div><strong style="font-size:14px;">Customer SMS Line</strong>';
  html += '<div style="font-size:12px;color:var(--text-muted);">Customers get booking confirmations from this number</div></div>';
  html += '</div>';
  if (_messagingData.customerPhone) {
    html += '<div style="font-size:22px;font-weight:700;color:var(--success);margin-bottom:6px;">' + formatPhone(_messagingData.customerPhone) + '</div>';
    html += '<div style="font-size:12px;color:var(--text-dim);">Booking confirmations | Cancellation notices | Reminders</div>';
  } else {
    html += '<div style="padding:12px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:var(--radius);text-align:center;">';
    html += '<div style="font-size:12px;color:var(--warning);">Assigned by admin during setup</div>';
    html += '</div>';
  }
  html += '</div>';

  html += '</div>';

  container.innerHTML = html;
}

function saveNotificationEmail() {
  var input = document.getElementById('notification-email-input');
  if (!input) return;
  _messagingData.notificationEmail = input.value.trim();
  saveMessagingData();
  renderPhoneNumbers();
  toast('Notification email saved — booking alerts will go to ' + _messagingData.notificationEmail);
}

function saveNotificationPhone() {
  var input = document.getElementById('notification-phone-input');
  if (!input) return;
  _messagingData.notificationPhone = input.value.trim();
  saveMessagingData();
  renderPhoneNumbers();
  toast('Notification number saved — you\'ll get booking alerts at ' + formatPhone(_messagingData.notificationPhone));
}

function formatPhone(phone) {
  if (!phone) return '';
  var cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned[0] === '1') cleaned = cleaned.substring(1);
  if (cleaned.length === 10) {
    return '(' + cleaned.substring(0,3) + ') ' + cleaned.substring(3,6) + '-' + cleaned.substring(6);
  }
  return phone;
}

// ---- Notification Toggles ----

function renderNotificationToggles() {
  var container = document.getElementById('notification-toggles');
  if (!container) return;

  var toggles = [
    { key: 'notifyCustomerOnBooking', label: 'Text customer when booked', desc: 'Send booking confirmation SMS to customer' },
    { key: 'notifyOwnerOnBooking', label: 'Text you when booked', desc: 'Send booking details to your phone' },
    { key: 'notifyCustomerOnCancel', label: 'Text customer on cancellation', desc: 'Notify customer if booking is cancelled' },
    { key: 'notifyOwnerOnCancel', label: 'Text you on cancellation', desc: 'Notify you when a booking is cancelled' }
  ];

  var html = '<div style="display:grid;gap:12px;">';
  toggles.forEach(function(t) {
    var checked = _messagingData[t.key] ? 'checked' : '';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);">';
    html += '<div><strong style="font-size:13px;">' + t.label + '</strong>';
    html += '<div style="font-size:12px;color:var(--text-dim);">' + t.desc + '</div></div>';
    html += '<label class="toggle"><input type="checkbox" ' + checked + ' onchange="toggleNotification(\'' + t.key + '\', this.checked)"><span class="toggle-slider"></span></label>';
    html += '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

function toggleNotification(key, value) {
  _messagingData[key] = value;
  saveMessagingData();
}

// ---- Customer Booking Template ----

function renderCustomerTemplate() {
  var el = document.getElementById('customer-template-editor');
  if (!el) return;
  el.value = _messagingData.customerBookingTemplate;
}

function renderOwnerTemplate() {
  var el = document.getElementById('owner-template-editor');
  if (!el) return;
  el.value = _messagingData.ownerBookingTemplate;
}

function updateCustomerTemplate() {
  var el = document.getElementById('customer-template-editor');
  if (el) _messagingData.customerBookingTemplate = el.value;
  saveMessagingData();
  renderTemplatePreview();
  toast('Customer template saved');
}

function updateOwnerTemplate() {
  var el = document.getElementById('owner-template-editor');
  if (el) _messagingData.ownerBookingTemplate = el.value;
  saveMessagingData();
  toast('Owner notification template saved');
}

// ---- Template Preview ----

function renderTemplatePreview() {
  var container = document.getElementById('template-preview');
  if (!container) return;

  // Sample data for preview
  var sampleData = {
    customer_name: 'John Smith',
    customer_phone: '(251) 555-0199',
    customer_email: 'john@example.com',
    business_name: 'Beachside Circle Boats',
    date: 'Saturday, March 15, 2026',
    time_slot: 'Half Day AM (9:00 AM - 1:00 PM)',
    boat_count: '3',
    boat_type: 'Single Seater Circle Boat',
    addons: 'Mini Dock, Cooler Pack, Speaker',
    guest_count: '3',
    total: '525.00',
    location: '25856 Canal Road Unit A, Orange Beach, AL 36561',
    payment_status: 'Paid via Stripe'
  };

  var preview = _messagingData.customerBookingTemplate;
  Object.keys(sampleData).forEach(function(key) {
    preview = preview.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), sampleData[key]);
  });

  var html = '<div style="background:#075e54;border-radius:var(--radius-lg);padding:20px;max-width:380px;">';
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1);">';
  html += '<div style="width:32px;height:32px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;">';
  html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  html += '</div>';
  html += '<div><div style="font-size:13px;font-weight:600;color:white;">SMS Preview</div>';
  html += '<div style="font-size:11px;color:rgba(255,255,255,0.6);">What your customer will see</div></div>';
  html += '</div>';

  // Message bubble
  html += '<div style="background:#dcf8c6;border-radius:8px 8px 8px 0;padding:10px 14px;color:#111;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word;">';
  html += escHtml(preview);
  html += '<div style="text-align:right;font-size:10px;color:#999;margin-top:4px;">10:30 AM</div>';
  html += '</div>';
  html += '</div>';

  container.innerHTML = html;
}

// ---- Photo to Gallery via SMS ----

function renderPhotoGallery() {
  var container = document.getElementById('photo-gallery-sms');
  if (!container) return;

  var html = '';

  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">';
  html += '<div>';
  html += '<strong style="font-size:14px;">Photo-to-Gallery via Text</strong>';
  html += '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Text photos to your business line and they automatically appear on your website</div>';
  html += '</div>';
  var photoChecked = _messagingData.photoGalleryEnabled ? 'checked' : '';
  html += '<label class="toggle"><input type="checkbox" ' + photoChecked + ' onchange="togglePhotoGallery(this.checked)"><span class="toggle-slider"></span></label>';
  html += '</div>';

  if (_messagingData.photoGalleryEnabled) {
    html += '<div style="padding:16px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);">';
    html += '<div style="display:flex;align-items:flex-start;gap:12px;">';
    html += '<div style="width:48px;height:48px;border-radius:var(--radius);background:rgba(0,173,168,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">';
    html += '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ada8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
    html += '</div>';
    html += '<div>';
    html += '<strong style="font-size:13px;">How it works:</strong>';
    html += '<ol style="margin:8px 0 0;padding-left:18px;color:var(--text-muted);font-size:12px;line-height:1.8;">';
    html += '<li>Text a photo to your business line' + (_messagingData.ownerPhone ? ' <strong>' + formatPhone(_messagingData.ownerPhone) + '</strong>' : '') + '</li>';
    html += '<li>Our system receives the MMS and processes the image</li>';
    html += '<li>Photo is automatically added to your website\'s gallery</li>';
    html += '<li>You\'ll get a confirmation text back: "Photo added to gallery!"</li>';
    html += '</ol>';
    html += '</div>';
    html += '</div>';

    html += '<div style="margin-top:12px;">';
    html += '<label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px;">Photos appear in:</label>';
    html += '<select style="padding:8px 12px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:var(--radius);color:var(--text);font-size:13px;" onchange="updatePhotoSection(this.value)">';
    html += '<option value="gallery"' + (_messagingData.photoGallerySection === 'gallery' ? ' selected' : '') + '>Photo Gallery</option>';
    html += '<option value="fleet"' + (_messagingData.photoGallerySection === 'fleet' ? ' selected' : '') + '>Fleet Photos</option>';
    html += '<option value="reviews"' + (_messagingData.photoGallerySection === 'reviews' ? ' selected' : '') + '>Customer Reviews</option>';
    html += '</select>';
    html += '</div>';
    html += '</div>';
  }

  container.innerHTML = html;
}

function togglePhotoGallery(enabled) {
  _messagingData.photoGalleryEnabled = enabled;
  saveMessagingData();
  renderPhotoGallery();
}

function updatePhotoSection(section) {
  _messagingData.photoGallerySection = section;
  saveMessagingData();
}

// ---- Voice AI ----

function renderVoiceAi() {
  var container = document.getElementById('voice-ai-section');
  if (!container) return;

  var html = '';

  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">';
  html += '<div>';
  html += '<strong style="font-size:14px;">Voice AI Assistant</strong>';
  html += '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Call your business line and talk to your AI — ask about bookings, customers, revenue</div>';
  html += '</div>';
  var voiceChecked = _messagingData.voiceAiEnabled ? 'checked' : '';
  html += '<label class="toggle"><input type="checkbox" ' + voiceChecked + ' onchange="toggleVoiceAi(this.checked)"><span class="toggle-slider"></span></label>';
  html += '</div>';

  if (_messagingData.voiceAiEnabled) {
    html += '<div style="padding:16px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);margin-bottom:16px;">';
    html += '<div style="display:flex;align-items:flex-start;gap:12px;">';
    html += '<div style="width:48px;height:48px;border-radius:var(--radius);background:rgba(168,85,247,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">';
    html += '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    html += '</div>';
    html += '<div>';
    html += '<strong style="font-size:13px;">Call your business line to ask:</strong>';
    html += '<ul style="margin:8px 0 0;padding-left:18px;color:var(--text-muted);font-size:12px;line-height:1.8;">';
    html += '<li>"How many bookings do we have tomorrow?"</li>';
    html += '<li>"What\'s our revenue this week?"</li>';
    html += '<li>"Who booked the 3pm slot on Saturday?"</li>';
    html += '<li>"Cancel the Smith booking for Friday"</li>';
    html += '<li>"What add-ons are most popular?"</li>';
    html += '</ul>';
    html += '<div style="font-size:11px;color:var(--text-dim);margin-top:8px;">Powered by ElevenLabs voice + your booking data</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // Voice greeting customization
    html += '<div style="margin-bottom:16px;">';
    html += '<label style="font-size:13px;color:var(--text-muted);display:block;margin-bottom:6px;">Voice Greeting (what the AI says when you call)</label>';
    html += '<textarea id="voice-greeting-editor" rows="3" style="width:100%;padding:10px 14px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);color:var(--text);font-size:14px;font-family:inherit;resize:vertical;">' + escHtml(_messagingData.voiceGreeting) + '</textarea>';
    html += '</div>';
    html += '<button class="btn btn-primary btn-sm" onclick="saveVoiceGreeting()">Save Greeting</button>';

    // Text-based dashboard control
    html += '<div style="margin-top:20px;padding:16px;background:rgba(0,173,168,0.05);border:1px solid rgba(0,173,168,0.15);border-radius:var(--radius);">';
    html += '<strong style="font-size:13px;color:var(--text);">You can also TEXT questions to your business line:</strong>';
    html += '<div style="margin-top:8px;font-size:12px;color:var(--text-muted);line-height:1.8;">';
    html += 'Text: <span style="color:var(--primary);">"bookings tomorrow"</span> → Get a list of tomorrow\'s bookings<br>';
    html += 'Text: <span style="color:var(--primary);">"revenue this month"</span> → Get your monthly revenue total<br>';
    html += 'Text: <span style="color:var(--primary);">"schedule"</span> → Get today\'s schedule at a glance';
    html += '</div>';
    html += '</div>';
  }

  container.innerHTML = html;
}

function toggleVoiceAi(enabled) {
  _messagingData.voiceAiEnabled = enabled;
  saveMessagingData();
  renderVoiceAi();
}

function saveVoiceGreeting() {
  var el = document.getElementById('voice-greeting-editor');
  if (el) _messagingData.voiceGreeting = el.value;
  saveMessagingData();
  toast('Voice greeting saved');
}

// ---- Available template tokens ----

function insertTemplateToken(editorId) {
  var tokens = [
    '{{customer_name}}', '{{customer_phone}}', '{{customer_email}}',
    '{{business_name}}', '{{date}}', '{{time_slot}}',
    '{{boat_count}}', '{{boat_type}}', '{{addons}}',
    '{{guest_count}}', '{{total}}', '{{location}}',
    '{{payment_status}}'
  ];

  var el = document.getElementById(editorId);
  if (!el) return;

  var tokensHtml = tokens.map(function(t) {
    return '<button class="btn btn-outline btn-sm" style="margin:3px;" onclick="insertAtCursor(\'' + editorId + '\', \'' + t + '\')">' + t + '</button>';
  }).join('');

  // Show a small popup or just insert
  var popup = document.getElementById('token-popup');
  if (popup) {
    popup.innerHTML = tokensHtml;
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
  }
}

function insertAtCursor(editorId, text) {
  var el = document.getElementById(editorId);
  if (!el) return;
  var start = el.selectionStart;
  var end = el.selectionEnd;
  el.value = el.value.substring(0, start) + text + el.value.substring(end);
  el.selectionStart = el.selectionEnd = start + text.length;
  el.focus();
}

// ---- Simulated SMS send (for demo) ----

function simulateBookingSms(bookingData) {
  // In production: Supabase Edge Function calls Twilio API
  // POST https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json
  // Body: { To: customerPhone, From: _messagingData.customerPhone, Body: filledTemplate }

  if (!_messagingData.notifyCustomerOnBooking) return;

  var msg = _messagingData.customerBookingTemplate;
  Object.keys(bookingData).forEach(function(key) {
    msg = msg.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), bookingData[key]);
  });

  console.log('[SMS → Customer]', msg);

  if (_messagingData.notifyOwnerOnBooking) {
    var ownerMsg = _messagingData.ownerBookingTemplate;
    Object.keys(bookingData).forEach(function(key) {
      ownerMsg = ownerMsg.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), bookingData[key]);
    });
    console.log('[SMS → Owner]', ownerMsg);
  }
}

if (typeof escHtml === 'undefined') {
  function escHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
}

onPageLoad('messaging', loadMessaging);
