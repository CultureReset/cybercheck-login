// ============================================
// Profile — Beachside Circle Boats
// ============================================

var _profileData = {
  name: 'Beachside Circle Boat Rentals and Sales LLC',
  phone: '(601) 325-1205',
  email: 'beachsideboats@myyahoo.com',
  website: '',
  description: 'Rent a portable, eco-friendly circle boat. No license needed, no experience required. Just show up and cruise.',
  logo: '',
  address: '25856 Canal Road, Unit A',
  city: 'Orange Beach',
  state: 'AL',
  zip: '36561',
  socials: {
    facebook: '',
    instagram: '',
    tiktok: '',
    yelp: '',
    google: '',
    twitter: ''
  },
  hours: {
    monday:    { open: '08:00', close: '18:00', closed: false },
    tuesday:   { open: '08:00', close: '18:00', closed: false },
    wednesday: { open: '08:00', close: '18:00', closed: false },
    thursday:  { open: '08:00', close: '18:00', closed: false },
    friday:    { open: '08:00', close: '18:00', closed: false },
    saturday:  { open: '08:00', close: '18:00', closed: false },
    sunday:    { open: '09:00', close: '17:00', closed: false }
  }
};

async function loadProfile() {
  try {
  // Try local API first (Circle Boats)
  try {
    const localRes = await fetch('/api/site-data');
    if (localRes.ok) {
      const localData = await localRes.json();
      if (localData.business) {
        _profileData.name = localData.business.name || _profileData.name;
        _profileData.phone = localData.business.phone || _profileData.phone;
        _profileData.email = localData.business.email || _profileData.email;
        _profileData.address = localData.business.address || _profileData.address;
        _profileData.description = localData.business.description || _profileData.description;
        _profileData.tagline = localData.business.tagline || _profileData.tagline;
        if (typeof localData.business.hours === 'object') _profileData.hours = localData.business.hours;
      }
      if (localData.social) {
        _profileData.socials = Object.assign({}, _profileData.socials, {
          facebook: localData.social.facebook || '',
          instagram: localData.social.instagram || '',
          google: localData.social.google || ''
        });
      }
      console.log('✅ Loaded from local API');
    }
  } catch (e) {
    console.log('Local API unavailable:', e.message);
  }

  // Also try Supabase via CC — returns { business, content }
  try {
    var apiData = await CC.dashboard.getProfile();
    if (apiData) {
      var biz = apiData.business || {};
      var content = apiData.content || {};
      if (biz.name) _profileData.name = biz.name;
      if (biz.logo_url) _profileData.logo = biz.logo_url;
      if (content.contact_phone) _profileData.phone = content.contact_phone;
      if (content.contact_email) _profileData.email = content.contact_email;
      if (content.website_url) _profileData.website = content.website_url;
      if (content.about_text) _profileData.description = content.about_text;
      if (content.logo_url) _profileData.logo = content.logo_url;
      if (content.address) _profileData.address = content.address;
      if (content.city) _profileData.city = content.city;
      if (content.state) _profileData.state = content.state;
      if (content.zip) _profileData.zip = content.zip;
      if (content.social_links) _profileData.socials = Object.assign({}, _profileData.socials, content.social_links);
      if (content.hours) _profileData.hours = content.hours;
    }
  } catch (e) {
    console.log('Supabase unavailable - using local API data');
  }

  var p = _profileData;
  document.getElementById('prof-name').value = p.name || '';
  document.getElementById('prof-phone').value = p.phone || '';
  document.getElementById('prof-email').value = p.email || '';
  document.getElementById('prof-website').value = p.website || '';
  document.getElementById('prof-description').value = p.description || '';
  document.getElementById('prof-address').value = p.address || '';
  document.getElementById('prof-city').value = p.city || '';
  document.getElementById('prof-state').value = p.state || '';
  document.getElementById('prof-zip').value = p.zip || '';

  document.getElementById('prof-social-facebook').value = p.socials.facebook || '';
  document.getElementById('prof-social-instagram').value = p.socials.instagram || '';
  document.getElementById('prof-social-tiktok').value = p.socials.tiktok || '';
  document.getElementById('prof-social-yelp').value = p.socials.yelp || '';
  document.getElementById('prof-social-google').value = p.socials.google || '';
  document.getElementById('prof-social-twitter').value = p.socials.twitter || '';

  if (p.logo) {
    var preview = document.getElementById('prof-logo-preview');
    preview.src = p.logo;
    preview.style.display = 'block';
  }

  // Ensure hours is properly initialized
  if (!_profileData.hours || typeof _profileData.hours !== 'object') {
    _profileData.hours = {
      monday:    { open: '08:00', close: '18:00', closed: false },
      tuesday:   { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday:  { open: '08:00', close: '18:00', closed: false },
      friday:    { open: '08:00', close: '18:00', closed: false },
      saturday:  { open: '08:00', close: '18:00', closed: false },
      sunday:    { open: '09:00', close: '17:00', closed: false }
    };
  }

  renderHoursEditor();
  } catch (e) { console.error('Failed to load profile:', e); toast('Failed to load profile', 'error'); }
}

function renderHoursEditor() {
  var container = document.getElementById('hours-editor');
  if (!container) return; // Element doesn't exist

  var days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  var html = '<table><thead><tr><th>Day</th><th>Open</th><th>Close</th><th>Closed</th></tr></thead><tbody>';

  days.forEach(function(day) {
    var h = _profileData.hours[day] || { open: '08:00', close: '18:00', closed: false };
    var label = day.charAt(0).toUpperCase() + day.slice(1);
    html += '<tr>';
    html += '<td style="font-weight:500;">' + label + '</td>';
    html += '<td><input type="time" id="hours-' + day + '-open" value="' + (h.open || '08:00') + '" style="padding:6px 10px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);color:var(--text);font-size:13px;"' + (h.closed ? ' disabled' : '') + '></td>';
    html += '<td><input type="time" id="hours-' + day + '-close" value="' + (h.close || '18:00') + '" style="padding:6px 10px;background:var(--bg);border:1px solid var(--card-border);border-radius:var(--radius);color:var(--text);font-size:13px;"' + (h.closed ? ' disabled' : '') + '></td>';
    html += '<td><label class="toggle"><input type="checkbox" id="hours-' + day + '-closed"' + (h.closed ? ' checked' : '') + ' onchange="toggleDayClosed(\'' + day + '\')"><span class="toggle-slider"></span></label></td>';
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function toggleDayClosed(day) {
  var closed = document.getElementById('hours-' + day + '-closed').checked;
  document.getElementById('hours-' + day + '-open').disabled = closed;
  document.getElementById('hours-' + day + '-close').disabled = closed;
}

async function saveProfile() {
  try {
  _profileData.name = document.getElementById('prof-name').value;
  _profileData.phone = document.getElementById('prof-phone').value;
  _profileData.email = document.getElementById('prof-email').value;
  _profileData.website = document.getElementById('prof-website').value;
  _profileData.description = document.getElementById('prof-description').value;
  _profileData.address = document.getElementById('prof-address').value;
  _profileData.city = document.getElementById('prof-city').value;
  _profileData.state = document.getElementById('prof-state').value;
  _profileData.zip = document.getElementById('prof-zip').value;

  _profileData.socials.facebook = document.getElementById('prof-social-facebook').value;
  _profileData.socials.instagram = document.getElementById('prof-social-instagram').value;
  _profileData.socials.tiktok = document.getElementById('prof-social-tiktok').value;
  _profileData.socials.yelp = document.getElementById('prof-social-yelp').value;
  _profileData.socials.google = document.getElementById('prof-social-google').value;
  _profileData.socials.twitter = document.getElementById('prof-social-twitter').value;

  var days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  days.forEach(function(day) {
    _profileData.hours[day] = {
      open: document.getElementById('hours-' + day + '-open').value,
      close: document.getElementById('hours-' + day + '-close').value,
      closed: document.getElementById('hours-' + day + '-closed').checked
    };
  });

  document.getElementById('sidebar-biz-name').textContent = _profileData.name || 'My Business';

  // Save to local API (Circle Boats)
  try {
    const apiRes = await fetch('http://localhost:3001/api/public/save-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: 'business',
        data: {
          name: _profileData.name,
          phone: _profileData.phone,
          email: _profileData.email,
          address: _profileData.address,
          hours: _profileData.hours,
          tagline: _profileData.tagline || 'Your Day on the Water Just Got an Upgrade',
          description: _profileData.description
        }
      })
    });

    if (apiRes.ok) {
      toast('✅ Profile saved!', 'success');
    } else {
      toast('⚠️ Local save failed', 'warning');
    }
  } catch (e) {
    toast('Local API unavailable - ' + e.message, 'warning');
  }

  // Also try Supabase if available
  try {
    await CC.dashboard.updateProfile({
      business: { name: _profileData.name, logo_url: _profileData.logo },
      content: {
        contact_phone: _profileData.phone,
        contact_email: _profileData.email,
        website_url: _profileData.website,
        about_text: _profileData.description,
        address: _profileData.address,
        city: _profileData.city,
        state: _profileData.state,
        zip: _profileData.zip,
        social_links: _profileData.socials,
        hours: _profileData.hours
      }
    });
  } catch (e) {
    console.log('Supabase unavailable - using local API only');
  }
  } catch (e) { console.error('Failed to save profile:', e); toast('Save failed — ' + e.message, 'error'); }
}

async function uploadLogo(input) {
  try {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  if (!file.type.startsWith('image/')) { toast('Please select an image file', 'error'); return; }

  toast('Uploading logo...');
  var url = await uploadToSupabase(file, 'logos');
  if (url) {
    _profileData.logo = url;
    var preview = document.getElementById('prof-logo-preview');
    preview.src = url;
    preview.style.display = 'block';
    // Save logo URL to business record
    await CC.dashboard.updateProfile({ business: { logo_url: url } });
    toast('Logo uploaded and saved');
  } else {
    toast('Logo upload failed', 'error');
  }
  } catch (e) { console.error('Logo upload error:', e); toast('Upload failed', 'error'); }
}

// ===== LIVE PREVIEW =====
function setupLivePreview() {
  const fields = ['prof-name', 'prof-phone', 'prof-email', 'prof-address', 'prof-description'];

  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', updateLivePreview);
      field.addEventListener('change', updateLivePreview);
    }
  });

  console.log('✅ Live preview attached to form fields');
}

function updateLivePreview() {
  // Update internal data
  _profileData.name = document.getElementById('prof-name').value;
  _profileData.phone = document.getElementById('prof-phone').value;
  _profileData.email = document.getElementById('prof-email').value;
  _profileData.address = document.getElementById('prof-address').value;
  _profileData.description = document.getElementById('prof-description').value;

  // Update website preview if it exists
  const previewIframe = document.querySelector('iframe[src*="localhost:3000"]');
  if (previewIframe && previewIframe.contentWindow) {
    try {
      // Update preview with current data
      const previewDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
      if (previewDoc) {
        const nameElements = previewDoc.querySelectorAll('[data-bind="business.name"]');
        const phoneElements = previewDoc.querySelectorAll('[data-bind="business.phone"]');
        const emailElements = previewDoc.querySelectorAll('[data-bind="business.email"]');
        const addressElements = previewDoc.querySelectorAll('[data-bind="business.address"]');

        nameElements.forEach(el => el.textContent = _profileData.name);
        phoneElements.forEach(el => el.textContent = _profileData.phone);
        emailElements.forEach(el => el.textContent = _profileData.email);
        addressElements.forEach(el => el.textContent = _profileData.address);
      }
    } catch (e) {
      // CORS error - reload iframe instead
      const timestamp = new Date().getTime();
      previewIframe.src = `http://localhost:3000?t=${timestamp}`;
    }
  }

  // Show live update indicator
  const saveBtn = document.querySelector('button[onclick="saveProfile()"]');
  if (saveBtn && _profileData.name !== '') {
    saveBtn.textContent = '💾 Save Changes';
    saveBtn.style.opacity = '1';
  }
}

// Attach live preview when page loads
function attachLivePreview() {
  setTimeout(setupLivePreview, 500);
}

onPageLoad('profile', loadProfile);
document.addEventListener('DOMContentLoaded', attachLivePreview);
