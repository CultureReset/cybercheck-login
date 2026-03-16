// ============================================
// Website Content Editor
// Every section editable → saves to /api/site-data → website updates instantly
// Images upload to /api/upload-image → stored in circle-boats-website/images/uploads/
// ============================================

let _wc_data = null;
let _wc_activeSection = 'business';

const WC_BASE = 'https://cybercheck-api-database.vercel.app';

// Sections that have dedicated DB columns (saved to site_content via dashboard API)
const WC_DB_SECTIONS = ['whats_included','steps','features','footer','links_page','locations','group_rate','docks','qna'];

function wcGetAuthToken() {
  // Try Supabase session token
  try {
    var keys = Object.keys(localStorage);
    for (var k of keys) {
      if (k.startsWith('sb-') && k.endsWith('-auth-token')) {
        var s = JSON.parse(localStorage.getItem(k));
        if (s && s.access_token) return s.access_token;
      }
    }
  } catch(e) {}
  return localStorage.getItem('cc_token') || sessionStorage.getItem('cc_token') || null;
}

async function wcSaveSection(section, data) {
  const token = wcGetAuthToken();
  if (!token) return; // no auth, skip — blob save is the fallback
  try {
    await fetch(WC_BASE + '/api/dashboard/website-content/' + section, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ value: data })
    });
  } catch(e) { /* silent — blob already saved */ }
}

// Normalize any image URL to a full displayable URL
function wcToUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return WC_BASE + url;
  return WC_BASE + '/beachside-site/' + url;
}

const WC_SECTIONS = [
  { id: 'business',       label: '🏢 Business Info' },
  { id: 'hero',           label: '🌟 Hero Section' },
  { id: 'about',          label: 'ℹ️ About' },
  { id: 'products',       label: '🚤 Boats & Pricing' },
  { id: 'group_rate',     label: '👥 Group Rate' },
  { id: 'docks',          label: '🛟 Docks' },
  { id: 'whats_included', label: '✅ What\'s Included' },
  { id: 'addons',         label: '🎁 Add-ons' },
  { id: 'booking_settings', label: '💳 Booking & Payment' },
  { id: 'steps',          label: '👣 How It Works' },
  { id: 'features',       label: '⭐ Why Circle Boats' },
  { id: 'locations',      label: '📍 Launch Locations' },
  { id: 'links_page',     label: '🔗 Bio Links Page' },
  { id: 'gallery',        label: '🖼️ Gallery' },
  { id: 'reviews',        label: '💬 Reviews' },
  { id: 'qna',            label: '❓ Q&A / FAQ' },
  { id: 'contact',        label: '📞 Contact' },
  { id: 'footer',         label: '📋 Footer' }
];

// ─── Load ─────────────────────────────────────────────────────────────────────

async function loadWebsiteContent() {
  const panel = document.getElementById('wc-panel');
  if (panel) panel.innerHTML = '<p style="padding:32px;color:var(--text-muted);">Loading…</p>';
  try {
    const res = await fetch(WC_BASE + '/api/site-data');
    if (!res.ok) throw new Error(res.status);
    _wc_data = await res.json();
  } catch(e) {
    toast('Could not load site data — is the server running?', 'error');
    return;
  }
  // Overlay fresh DB content sections (more up-to-date than blob)
  try {
    const token = wcGetAuthToken();
    if (token) {
      const dbRes = await fetch(WC_BASE + '/api/dashboard/website-content', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        WC_DB_SECTIONS.forEach(function(section) {
          if (dbData[section] !== undefined && dbData[section] !== null) {
            const isEmpty = Array.isArray(dbData[section])
              ? dbData[section].length === 0
              : (typeof dbData[section] === 'object' ? Object.keys(dbData[section]).length === 0 : !dbData[section]);
            if (!isEmpty) _wc_data[section] = dbData[section];
          }
        });
        // hero CTA
        if (dbData.hero_cta_text || dbData.hero_cta_url) {
          if (!_wc_data.hero) _wc_data.hero = {};
          if (dbData.hero_cta_text) _wc_data.hero.ctaText = dbData.hero_cta_text;
          if (dbData.hero_cta_url)  _wc_data.hero.ctaUrl  = dbData.hero_cta_url;
        }
      }
    }
  } catch(e) { /* use blob data */ }
  renderWCNav();
  renderWCSection(_wc_activeSection);
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function renderWCNav() {
  const nav = document.getElementById('wc-nav');
  if (!nav) return;
  nav.innerHTML = WC_SECTIONS.map(s => `
    <div class="wc-nav-item${_wc_activeSection === s.id ? ' active' : ''}"
         onclick="renderWCSection('${s.id}')">${s.label}</div>
  `).join('');
}

function renderWCSection(id) {
  _wc_activeSection = id;
  renderWCNav();
  const panel = document.getElementById('wc-panel');
  if (!panel || !_wc_data) return;
  const map = {
    business: renderBusiness, hero: renderHero, about: renderAbout,
    products: renderProducts, group_rate: renderGroupRate, docks: renderDocks,
    whats_included: renderWhatsIncluded, addons: renderAddons,
    booking_settings: renderBookingSettings,
    steps: renderSteps, features: renderFeatures, locations: renderLocations,
    links_page: renderLinksPage,
    gallery: renderGallery,
    reviews: renderReviews, qna: renderQnA, contact: renderContact, footer: renderFooter
  };
  panel.innerHTML = (map[id] || (() => '<p>Section not found</p>'))();
}

// ─── Save ─────────────────────────────────────────────────────────────────────

async function wcSave(section, data) {
  _wc_data[section] = data;
  await wcPush();
  // Also save to proper DB column for supported sections
  if (WC_DB_SECTIONS.includes(section)) {
    wcSaveSection(section, data);  // fire and forget
  }
}

async function wcPush() {
  try {
    const res = await fetch(WC_BASE + '/api/site-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(_wc_data)
    });
    if (!res.ok) throw new Error(res.status);
    localStorage.removeItem('beachside_site_data');
    localStorage.removeItem('beachside_site_data_ts');
    toast('Saved — website updated ✓');
  } catch(e) {
    toast('Save failed: ' + e.message, 'error');
  }
}

// ─── In-memory collect (save form → _wc_data without API push) ───────────────
// Called before add/delete so unsaved edits aren't lost on re-render

function wcCollect(section) {
  if (section === 'products') {
    _wc_data.products = (_wc_data.products||[]).map((_,i) => ({
      name:val('p-name-'+i), description:val('p-desc-'+i), image:val('p-img-'+i),
      specs:val('p-specs-'+i), featured:chk('p-feat-'+i),
      halfDayAM:num('p-am-'+i), halfDayPM:num('p-pm-'+i), allDay:num('p-all-'+i)
    }));
  } else if (section === 'docks') {
    _wc_data.docks = (_wc_data.docks||[]).map((_,i) => ({
      name:val('dk-name-'+i), badge:val('dk-badge-'+i)||null, size:val('dk-size-'+i),
      capacity:val('dk-cap-'+i), description:val('dk-desc-'+i), image:val('dk-img-'+i),
      halfDay:num('dk-hd-'+i), allDay:num('dk-ad-'+i),
      features:val('dk-feats-'+i).split('\n').map(s=>s.trim()).filter(Boolean)
    }));
  } else if (section === 'addons') {
    _wc_data.addons = (_wc_data.addons||[]).map((_,i) => ({
      icon:val('ao-icon-'+i), name:val('ao-name-'+i), description:val('ao-desc-'+i),
      price:num('ao-price-'+i), unit:val('ao-unit-'+i), image:val('ao-img-'+i)||''
    }));
  } else if (section === 'steps') {
    _wc_data.steps = (_wc_data.steps||[]).map((s,i) => ({
      step:num('st-num-'+i), title:val('st-title-'+i), description:val('st-desc-'+i), image:val('st-img-'+i)||s.image||''
    }));
  } else if (section === 'features') {
    _wc_data.features = (_wc_data.features||[]).map((f,i) => ({
      icon:val('ft-icon-'+i), title:val('ft-title-'+i), description:val('ft-desc-'+i), image:f.image||''
    }));
  } else if (section === 'about') {
    const count = (_wc_data.about?.features||[]).length;
    if (!_wc_data.about) _wc_data.about = {};
    _wc_data.about = {
      ..._wc_data.about,
      title:val('a-title'), subtitle:val('a-sub'), description:val('a-desc'), perfectFor:val('a-for'),
      image: val('a-img') || _wc_data.about?.image || '',
      features: Array.from({length:count},(_,i)=>({ icon:val('af-icon-'+i), title:val('af-title-'+i), description:val('af-desc-'+i), image:val('af-img-'+i)||'' }))
    };
  } else if (section === 'reviews') {
    const count = (_wc_data.reviews?.items||[]).length;
    _wc_data.reviews = {
      ..._wc_data.reviews,
      rating:num('rv-rating'), source:val('rv-source'),
      items: Array.from({length:count},(_,i)=>({ name:val('rv-name-'+i), initial:val('rv-init-'+i), timeAgo:val('rv-time-'+i), stars:num('rv-stars-'+i), text:val('rv-text-'+i) }))
    };
  } else if (section === 'locations') {
    _wc_data.locations = (_wc_data.locations||[]).map((_,i) => ({
      id:val('lc-id-'+i)||('loc'+(i+1)), name:val('lc-name-'+i),
      address:val('lc-addr-'+i), description:val('lc-desc-'+i), mapUrl:val('lc-map-'+i),
      image:val('lc-img-'+i)||undefined
    }));
  } else if (section === 'qna') {
    _wc_data.qna = (_wc_data.qna||[]).map((_,i) => ({
      question:val('qa-q-'+i), answer:val('qa-a-'+i)
    }));
  }
}

// ─── Add / Delete item (in-memory, requires Save to push) ────────────────────

function wcAddItem(section) {
  wcCollect(section);
  const defaults = {
    products:  {name:'New Boat', description:'', specs:'', halfDayAM:0, halfDayPM:0, allDay:0, featured:false, image:''},
    docks:     {name:'New Dock', description:'', size:'', capacity:'', badge:'', halfDay:0, allDay:0, image:'', features:[]},
    addons:    {name:'New Add-on', description:'', icon:'', price:0, unit:'per trip', image:''},
    steps:     {step:(_wc_data.steps||[]).length+1, title:'New Step', description:'', image:''},
    features:  {title:'New Feature', icon:'', description:'', image:''},
    locations: {id:'loc'+Date.now(), name:'New Location', address:'', description:'', mapUrl:''},
    qna: {question:'', answer:''}
  };
  if (section === 'reviews') {
    if (!_wc_data.reviews) _wc_data.reviews = {rating:5, source:'Google Reviews', items:[]};
    if (!_wc_data.reviews.items) _wc_data.reviews.items = [];
    _wc_data.reviews.items.push({name:'', initial:'', timeAgo:'', stars:5, text:''});
  } else if (section === 'about') {
    if (!_wc_data.about) _wc_data.about = {};
    if (!_wc_data.about.features) _wc_data.about.features = [];
    _wc_data.about.features.push({icon:'', title:'New Feature', description:''});
  } else {
    if (!_wc_data[section]) _wc_data[section] = [];
    _wc_data[section].push(defaults[section] || {name:'New Item'});
  }
  renderWCSection(section);
}

function wcDeleteItem(section, index) {
  if (!confirm('Delete this item?')) return;
  wcCollect(section);
  if (section === 'reviews') {
    (_wc_data.reviews?.items||[]).splice(index, 1);
  } else if (section === 'about') {
    (_wc_data.about?.features||[]).splice(index, 1);
  } else {
    (_wc_data[section]||[]).splice(index, 1);
  }
  renderWCSection(section);
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function wcAddBar(section, label) {
  return `<div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
    <button class="btn btn-outline btn-sm" onclick="wcAddItem('${section}')">+ Add ${esc(label)}</button>
  </div>`;
}

function wcDelBtn(section, index, label='Delete') {
  return `<button class="btn btn-sm" onclick="wcDeleteItem('${section}',${index})"
    style="color:var(--danger,#ef4444);border-color:var(--danger,#ef4444);padding:3px 10px;font-size:12px;">🗑 ${esc(label)}</button>`;
}

// ─── Image upload helper ──────────────────────────────────────────────────────

function imgPickerHtml(inputId, currentUrl, label='Image', context='default') {
  const fullUrl = wcToUrl(currentUrl);
  const preview = fullUrl
    ? `<img src="${esc(fullUrl)}" style="height:80px;width:120px;object-fit:cover;border-radius:6px;border:1px solid var(--card-border);" onerror="this.parentElement.innerHTML='<div style=\\'height:80px;width:120px;border-radius:6px;border:2px dashed var(--card-border);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:11px;\\'>No image</div>'">`
    : `<div style="height:80px;width:120px;border-radius:6px;border:2px dashed var(--card-border);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:11px;">No image</div>`;
  return `
    <div class="form-group">
      <label>${label}</label>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <div id="${inputId}-preview">${preview}</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <button type="button" class="btn btn-outline btn-sm"
            onclick="document.getElementById('${inputId}-file').click()">Upload Image</button>
          <input type="file" id="${inputId}-file" accept="image/*" style="display:none"
            data-context="${context}" onchange="wcUploadImg('${inputId}', this)">
          <input type="text" id="${inputId}" value="${esc(currentUrl)}"
            placeholder="or paste URL / path"
            style="font-size:12px;padding:4px 8px;"
            oninput="wcRefreshPreview('${inputId}')">
        </div>
      </div>
    </div>`;
}

async function wcUploadImg(inputId, fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  const btn = fileInput.previousElementSibling;
  if (btn) btn.textContent = 'Uploading…';
  try {
    const context = fileInput.dataset.context || 'website';
    const url = await uploadToSupabase(file, context);
    if (!url) throw new Error('Upload returned no URL');
    document.getElementById(inputId).value = url;
    wcRefreshPreview(inputId);
    toast('Image uploaded ✓');
  } catch(e) {
    toast('Upload failed: ' + e.message, 'error');
  }
  if (btn) btn.textContent = 'Upload Image';
  fileInput.value = '';
}

function wcRefreshPreview(inputId) {
  const input = document.getElementById(inputId);
  const previewEl = document.getElementById(inputId + '-preview');
  if (!input || !previewEl) return;
  const full = wcToUrl(input.value.trim());
  if (full) {
    previewEl.innerHTML = `<img src="${full}" style="height:80px;width:120px;object-fit:cover;border-radius:6px;border:1px solid var(--card-border);" onerror="this.style.display='none'">`;
  } else {
    previewEl.innerHTML = `<div style="height:80px;width:120px;border-radius:6px;border:2px dashed var(--card-border);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:11px;">No image</div>`;
  }
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function fi(label, id, value, type='text', placeholder='') {
  return `<div class="form-group"><label>${label}</label>
    <input type="${type}" id="${id}" value="${esc(value)}" placeholder="${esc(placeholder)}">
  </div>`;
}
function ta(label, id, value, rows=3) {
  return `<div class="form-group"><label>${label}</label>
    <textarea id="${id}" rows="${rows}">${esc(value)}</textarea>
  </div>`;
}
function esc(v) {
  return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function num(id) { return parseFloat(val(id)) || 0; }
function chk(id) { const el = document.getElementById(id); return el ? el.checked : false; }
function saveBtn(fn) {
  return `<div style="margin-top:28px;padding-top:20px;border-top:1px solid var(--card-border);">
    <button class="btn btn-primary" onclick="${fn}()">💾 Save &amp; Publish to Website</button>
  </div>`;
}

// ─── Business ─────────────────────────────────────────────────────────────────

function renderBusiness() {
  const d = _wc_data.business || {};
  return `<h2 class="wc-title">Business Info</h2>
  <div class="form-row">${fi('Business Name','b-name',d.name)}${fi('Phone','b-phone',d.phone,'tel')}</div>
  <div class="form-row">${fi('Email','b-email',d.email,'email')}${fi('Location Tag','b-loc',d.location,'text','Orange Beach, Alabama')}</div>
  ${fi('Address','b-addr',d.address)}
  ${fi('Tagline','b-tag',d.tagline)}
  ${ta('Description','b-desc',d.description)}
  <div class="form-row">${fi('Hours','b-hrs',d.hours)}${fi('Hours note','b-hrsnote',d.hoursNote)}</div>
  ${saveBtn('saveBusiness')}`;
}
function saveBusiness() {
  const bizData = {
    name:val('b-name'), phone:val('b-phone'), email:val('b-email'), location:val('b-loc'),
    address:val('b-addr'), tagline:val('b-tag'), description:val('b-desc'),
    hours:val('b-hrs'), hoursNote:val('b-hrsnote')
  };
  wcSave('business', bizData);
  // Write to DB tables so server.js overlay picks up the changes
  const token = wcGetAuthToken();
  if (token) {
    fetch(WC_BASE + '/api/dashboard/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        business: { name: bizData.name },
        content: {
          about_text:    bizData.description,
          contact_phone: bizData.phone,
          contact_email: bizData.email,
          address:       bizData.address,
          hero_text:     bizData.tagline
        }
      })
    }).catch(function(){});
  }
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function renderHero() {
  const d = _wc_data.hero || {};
  return `<h2 class="wc-title">Hero Section</h2>
  ${fi('Location Tag (top of hero)','h-loc',d.location,'text','Orange Beach, Alabama')}
  ${fi('Headline (H1)','h-title',d.title)}
  ${ta('Subtitle','h-sub',d.subtitle)}
  <div class="form-row">${fi('CTA Button Text','h-cta',d.ctaText,'text','Book Now')}${fi('CTA URL','h-url',d.ctaUrl,'text','#rentals')}</div>
  ${saveBtn('saveHero')}`;
}
function saveHero() {
  const heroData = { location:val('h-loc'), title:val('h-title'), subtitle:val('h-sub'), ctaText:val('h-cta'), ctaUrl:val('h-url') };
  wcSave('hero', heroData);
  // Save CTA fields to DB separately
  const token = wcGetAuthToken();
  if (token && heroData.ctaText) {
    fetch(WC_BASE + '/api/dashboard/website-content/hero_cta_text', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ value: heroData.ctaText })
    }).catch(function(){});
  }
  if (token && heroData.ctaUrl) {
    fetch(WC_BASE + '/api/dashboard/website-content/hero_cta_url', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ value: heroData.ctaUrl })
    }).catch(function(){});
  }
}

// ─── About ────────────────────────────────────────────────────────────────────

function renderAbout() {
  const d = _wc_data.about || {};
  const feats = d.features || [];
  return `<h2 class="wc-title">About Section</h2>
  ${fi('Section Title','a-title',d.title)}
  ${fi('Subtitle','a-sub',d.subtitle)}
  ${ta('Main Description','a-desc',d.description,4)}
  ${ta('"Perfect For" line','a-for',d.perfectFor)}
  ${imgPickerHtml('a-img', d.image||'', 'Section Photo (displays full-width on website)', 'about')}
  <div style="display:flex;justify-content:space-between;align-items:center;margin:24px 0 12px;">
    <h3 style="margin:0;font-size:15px;font-weight:600;">Feature Highlights</h3>
    <button class="btn btn-outline btn-sm" onclick="wcAddItem('about')">+ Add Feature</button>
  </div>
  ${feats.map((f,i) => `
    <div class="wc-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <strong style="font-size:14px;color:var(--text-muted);">Feature ${i+1}</strong>
        ${wcDelBtn('about', i)}
      </div>
      <div class="form-row">${fi('Icon (optional — hidden when photo is set)','af-icon-'+i,f.icon,'text','⚡')}${fi('Title','af-title-'+i,f.title)}</div>
      ${ta('Description','af-desc-'+i,f.description,2)}
      ${imgPickerHtml('af-img-'+i, f.image||'', 'Photo (optional)', 'about')}
    </div>`).join('')}
  ${feats.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-muted);border:2px dashed var(--card-border);border-radius:10px;">No features yet — click "+ Add Feature" above</div>` : ''}
  ${saveBtn('saveAbout')}`;
}
function saveAbout() {
  const count = (_wc_data.about?.features||[]).length;
  wcSave('about', {
    title:val('a-title'), subtitle:val('a-sub'), description:val('a-desc'), perfectFor:val('a-for'),
    image: val('a-img') || (_wc_data.about?.image || ''),
    features: Array.from({length:count},(_,i)=>({ icon:val('af-icon-'+i), title:val('af-title-'+i), description:val('af-desc-'+i), image:val('af-img-'+i)||'' }))
  });
}

// ─── Products / Boats ─────────────────────────────────────────────────────────

function renderProducts() {
  const prods = _wc_data.products || [];
  return `<h2 class="wc-title">Boats & Pricing</h2>
  ${wcAddBar('products', 'Boat')}
  ${prods.map((p,i) => `
    <div class="wc-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <input type="text" id="p-name-${i}" value="${esc(p.name)}" placeholder="Boat name…"
          style="font-size:16px;font-weight:600;border:none;background:transparent;padding:2px 0;flex:1;color:inherit;outline:none;border-bottom:1px dashed var(--card-border);"
          onfocus="this.style.borderBottomColor='var(--primary)'" onblur="this.style.borderBottomColor='var(--card-border)'">
        <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
            <input type="checkbox" id="p-feat-${i}" ${p.featured?'checked':''}> Mark as Popular
          </label>
          ${wcDelBtn('products', i)}
        </div>
      </div>
      ${imgPickerHtml('p-img-'+i, p.image, 'Boat Photo', 'boat')}
      <div class="form-row">${fi('Specs line','p-specs-'+i,p.specs,'text','70" diameter • Max 300 lbs')}</div>
      ${ta('Description','p-desc-'+i,p.description,2)}
      <div class="form-row">
        ${fi('Half Day AM ($)','p-am-'+i,p.halfDayAM??p.halfDay,'number')}
        ${fi('Half Day PM ($)','p-pm-'+i,p.halfDayPM??p.halfDay,'number')}
        ${fi('All Day ($)','p-all-'+i,p.allDay,'number')}
        ${fi('Qty Available','p-qty-'+i,p.qty??1,'number')}
      </div>
    </div>`).join('')}
  ${prods.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-muted);border:2px dashed var(--card-border);border-radius:10px;">No boats yet — click "+ Add Boat" above</div>` : ''}
  ${saveBtn('saveProducts')}`;
}
async function saveProducts() {
  const prods = (_wc_data.products||[]).map((_,i)=>({
    name:val('p-name-'+i), description:val('p-desc-'+i), image:val('p-img-'+i),
    specs:val('p-specs-'+i), featured:chk('p-feat-'+i),
    halfDayAM:num('p-am-'+i), halfDayPM:num('p-pm-'+i), allDay:num('p-all-'+i),
    qty:num('p-qty-'+i)||1
  }));
  wcSave('products', prods);

  // Sync images + pricing to fleet_types so inventory tab and booking engine stay in sync
  const token = wcGetAuthToken();
  if (!token) return;
  try {
    // Fetch fleet types directly — don't depend on CC.dashboard module
    const ftRes = await fetch(WC_BASE + '/api/dashboard/fleet', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!ftRes.ok) { toast('Price sync failed — could not load fleet types', 'error'); return; }
    const fleetTypes = await ftRes.json();
    if (!Array.isArray(fleetTypes) || !fleetTypes.length) return;

    for (const ft of fleetTypes) {
      const match = prods.find(function(p) {
        return p.name && ft.name && p.name.trim().toLowerCase() === ft.name.trim().toLowerCase();
      });
      if (!match) continue;
      const r = await fetch(WC_BASE + '/api/dashboard/fleet/' + ft.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          description: match.description || ft.description || '',
          image_url: match.image || ft.image_url || null,
          specs: Object.assign({}, ft.specs || {}, {
            halfDayAM: match.halfDayAM || 0,
            halfDayPM: match.halfDayPM || 0,
            allDay: match.allDay || 0,
            specsText: match.specs || '',
            qty: match.qty || (ft.specs && ft.specs.qty) || 1
          })
        })
      });
      if (!r.ok) toast('Price sync failed for ' + ft.name + ' — try saving again', 'error');
    }
  } catch(e) {
    toast('Price sync error: ' + e.message, 'error');
  }
}

// ─── Group Rate ───────────────────────────────────────────────────────────────

function renderGroupRate() {
  const d = _wc_data.group_rate || {};
  return `<h2 class="wc-title">Group Rate</h2>
  ${fi('Title','gr-title',d.title)}
  ${ta('Description','gr-desc',d.description)}
  <div class="form-row">${fi('Price per boat ($)','gr-price',d.price,'number')}${fi('Price label','gr-label',d.priceLabel,'text','each / All Day')}</div>
  <div class="form-row">${fi('CTA Button Text','gr-cta',d.ctaText,'text','Call to Book')}${fi('CTA URL','gr-url',d.ctaUrl,'text','tel:6013251205')}</div>
  ${saveBtn('saveGroupRate')}`;
}
function saveGroupRate() {
  wcSave('group_rate', { title:val('gr-title'), description:val('gr-desc'), price:num('gr-price'), priceLabel:val('gr-label'), ctaText:val('gr-cta'), ctaUrl:val('gr-url') });
}

// ─── Docks ────────────────────────────────────────────────────────────────────

function renderDocks() {
  const docks = _wc_data.docks || [];
  return `<h2 class="wc-title">Docks / Accessories</h2>
  ${wcAddBar('docks', 'Dock')}
  ${docks.map((d,i) => `
    <div class="wc-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:16px;">
        <input type="text" id="dk-name-${i}" value="${esc(d.name)}" placeholder="Dock / accessory name…"
          style="font-size:16px;font-weight:600;border:none;background:transparent;padding:2px 0;flex:1;color:inherit;outline:none;border-bottom:1px dashed var(--card-border);"
          onfocus="this.style.borderBottomColor='var(--primary)'" onblur="this.style.borderBottomColor='var(--card-border)'">
        ${wcDelBtn('docks', i)}
      </div>
      ${imgPickerHtml('dk-img-'+i, d.image, 'Dock Photo', 'dock')}
      <div class="form-row">${fi('Badge','dk-badge-'+i,d.badge,'text','Most Popular')}</div>
      <div class="form-row">${fi('Size','dk-size-'+i,d.size,'text',"8'4\" x 44\"")}${fi('Capacity','dk-cap-'+i,d.capacity,'text','100 lb')}</div>
      ${ta('Description','dk-desc-'+i,d.description,3)}
      <div class="form-row">${fi('Half Day ($)','dk-hd-'+i,d.halfDay,'number')}${fi('All Day ($)','dk-ad-'+i,d.allDay,'number')}</div>
      <div class="form-group">
        <label>Feature Bullets (one per line)</label>
        <textarea id="dk-feats-${i}" rows="4">${esc((d.features||[]).join('\n'))}</textarea>
      </div>
    </div>`).join('')}
  ${docks.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-muted);border:2px dashed var(--card-border);border-radius:10px;">No docks yet — click "+ Add Dock" above</div>` : ''}
  ${saveBtn('saveDocks')}`;
}
function saveDocks() {
  const docks = (_wc_data.docks||[]).map((_,i)=>({
    name:val('dk-name-'+i), badge:val('dk-badge-'+i)||null, size:val('dk-size-'+i),
    capacity:val('dk-cap-'+i), description:val('dk-desc-'+i), image:val('dk-img-'+i),
    halfDay:num('dk-hd-'+i), allDay:num('dk-ad-'+i),
    features:val('dk-feats-'+i).split('\n').map(s=>s.trim()).filter(Boolean)
  }));
  wcSave('docks', docks);
}

// ─── What's Included ──────────────────────────────────────────────────────────

function renderWhatsIncluded() {
  const items = _wc_data.whats_included || [];
  return `<h2 class="wc-title">What's Included</h2>
  <p style="color:var(--text-muted);margin-bottom:16px;font-size:14px;">One item per line — shown as checkmarks on the website.</p>
  <div class="form-group"><textarea id="wi-items" rows="10">${esc(items.join('\n'))}</textarea></div>
  ${saveBtn('saveWhatsIncluded')}`;
}
function saveWhatsIncluded() {
  wcSave('whats_included', val('wi-items').split('\n').map(s=>s.trim()).filter(Boolean));
}

// ─── Add-ons ──────────────────────────────────────────────────────────────────

function renderAddons() {
  const addons = _wc_data.addons || [];
  return `<h2 class="wc-title">Add-ons / Extras</h2>
  ${wcAddBar('addons', 'Add-on')}
  ${addons.map((a,i) => `
    <div class="wc-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;">
        <input type="text" id="ao-name-${i}" value="${esc(a.name)}" placeholder="Add-on name…"
          style="font-size:16px;font-weight:600;border:none;background:transparent;padding:2px 0;flex:1;color:inherit;outline:none;border-bottom:1px dashed var(--card-border);"
          onfocus="this.style.borderBottomColor='var(--primary)'" onblur="this.style.borderBottomColor='var(--card-border)'">
        ${wcDelBtn('addons', i)}
      </div>
      ${imgPickerHtml('ao-img-'+i, a.image||'', 'Add-on Photo (optional)', 'addon')}
      <div class="form-row">
        ${fi('Icon (optional)','ao-icon-'+i,a.icon,'text','🎁')}
        ${fi('Price ($)','ao-price-'+i,a.price,'number')}
        ${fi('Unit','ao-unit-'+i,a.unit,'text','per trip')}
      </div>
      ${fi('Description','ao-desc-'+i,a.description)}
    </div>`).join('')}
  ${addons.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-muted);border:2px dashed var(--card-border);border-radius:10px;">No add-ons yet — click "+ Add Add-on" above</div>` : ''}
  ${saveBtn('saveAddons')}`;
}
async function saveAddons() {
  const addons = (_wc_data.addons||[]).map((_,i)=>({
    icon:val('ao-icon-'+i), name:val('ao-name-'+i), description:val('ao-desc-'+i),
    price:num('ao-price-'+i), unit:val('ao-unit-'+i), image:val('ao-img-'+i)||undefined
  }));
  wcSave('addons', addons);

  // Sync to rental_addons table so website reads live data
  try {
    const token = wcGetAuthToken();
    if (token) {
      const r = await fetch(WC_BASE + '/api/dashboard/addons/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(addons)
      });
      if (!r.ok) { const err = await r.json().catch(()=>({})); toast('Add-on sync failed: ' + (err.error || r.status), 'error'); }
    }
  } catch(e) {
    toast('Add-on sync error: ' + e.message, 'error');
  }
}

// ─── Booking & Payment Settings ───────────────────────────────────────────────

function renderBookingSettings() {
  const d = _wc_data.booking_settings || {};
  const mode = d.paymentMode || 'full';
  return `<h2 class="wc-title">Booking & Payment</h2>
  <p style="color:var(--text-muted);margin-bottom:24px;font-size:14px;">
    Choose how customers pay when they book on your website. This setting applies to every booking.
  </p>

  <div class="form-group">
    <label style="font-weight:600;margin-bottom:12px;display:block;">Payment Policy</label>
    <div style="display:flex;flex-direction:column;gap:10px;">

      <label style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:2px solid ${mode==='full'?'var(--primary)':'var(--card-border)'};border-radius:10px;cursor:pointer;background:${mode==='full'?'var(--primary-bg,rgba(0,173,168,0.06))':'var(--bg)'};">
        <input type="radio" name="bs-mode" value="full" ${mode==='full'?'checked':''} onchange="bsToggleMode()" style="margin-top:3px;flex-shrink:0;">
        <div>
          <div style="font-weight:600;font-size:14px;">Pay in Full at Booking</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:2px;">Customer pays the full amount via credit card when they book.</div>
        </div>
      </label>

      <label style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:2px solid ${mode==='deposit'?'var(--primary)':'var(--card-border)'};border-radius:10px;cursor:pointer;background:${mode==='deposit'?'var(--primary-bg,rgba(0,173,168,0.06))':'var(--bg)'};">
        <input type="radio" name="bs-mode" value="deposit" ${mode==='deposit'?'checked':''} onchange="bsToggleMode()" style="margin-top:3px;flex-shrink:0;">
        <div>
          <div style="font-weight:600;font-size:14px;">Deposit at Booking</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:2px;">Customer pays a deposit now. Balance due at time of rental.</div>
        </div>
      </label>

      <label style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:2px solid ${mode==='at_location'?'var(--primary)':'var(--card-border)'};border-radius:10px;cursor:pointer;background:${mode==='at_location'?'var(--primary-bg,rgba(0,173,168,0.06))':'var(--bg)'};">
        <input type="radio" name="bs-mode" value="at_location" ${mode==='at_location'?'checked':''} onchange="bsToggleMode()" style="margin-top:3px;flex-shrink:0;">
        <div>
          <div style="font-weight:600;font-size:14px;">Book Now — Pay at Location</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:2px;">No payment collected at booking. Customer pays when they arrive.</div>
        </div>
      </label>

    </div>
  </div>

  <div id="bs-deposit-fields" style="display:${mode==='deposit'?'block':'none'};margin-top:4px;">
    <div class="form-row">
      ${fi('Deposit %','bs-pct',d.depositPct||25,'number','25')}
      ${fi('Deposit label shown to customer','bs-label',d.depositLabel||'Deposit required to secure your booking','text')}
    </div>
  </div>

  <div style="margin-top:20px;">
    ${fi('Booking button label (optional override)','bs-btnlabel',d.buttonLabel||'','text','e.g. Reserve Now')}
  </div>

  ${saveBtn('saveBookingSettings')}`;
}

function bsToggleMode() {
  const mode = document.querySelector('input[name="bs-mode"]:checked')?.value || 'full';
  const depositFields = document.getElementById('bs-deposit-fields');
  if (depositFields) depositFields.style.display = mode === 'deposit' ? 'block' : 'none';
  // Update border highlight
  document.querySelectorAll('input[name="bs-mode"]').forEach(function(r) {
    const card = r.closest('label');
    if (!card) return;
    if (r.checked) {
      card.style.borderColor = 'var(--primary)';
      card.style.background = 'var(--primary-bg,rgba(0,173,168,0.06))';
    } else {
      card.style.borderColor = 'var(--card-border)';
      card.style.background = 'var(--bg)';
    }
  });
}

function saveBookingSettings() {
  const mode = document.querySelector('input[name="bs-mode"]:checked')?.value || 'full';
  wcSave('booking_settings', {
    paymentMode: mode,
    depositPct: mode === 'deposit' ? num('bs-pct') || 25 : 0,
    depositLabel: val('bs-label'),
    buttonLabel: val('bs-btnlabel')
  });
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function renderSteps() {
  const steps = _wc_data.steps || [];
  return `<h2 class="wc-title">How It Works</h2>
  ${wcAddBar('steps', 'Step')}
  ${steps.map((s,i) => `
    <div class="wc-card">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <span style="font-size:15px;font-weight:700;color:var(--primary);flex-shrink:0;">Step</span>
        <input type="number" id="st-num-${i}" value="${s.step||i+1}" min="1"
          style="width:44px;font-size:15px;font-weight:700;border:none;background:transparent;padding:2px 0;color:var(--primary);outline:none;text-align:center;border-bottom:1px dashed var(--card-border);"
          onfocus="this.style.borderBottomColor='var(--primary)'" onblur="this.style.borderBottomColor='var(--card-border)'">
        <span style="color:var(--text-muted);flex-shrink:0;">—</span>
        <input type="text" id="st-title-${i}" value="${esc(s.title)}" placeholder="Step title…"
          style="font-size:16px;font-weight:600;border:none;background:transparent;padding:2px 0;flex:1;color:inherit;outline:none;border-bottom:1px dashed var(--card-border);"
          onfocus="this.style.borderBottomColor='var(--primary)'" onblur="this.style.borderBottomColor='var(--card-border)'">
        ${wcDelBtn('steps', i)}
      </div>
      ${ta('Description','st-desc-'+i,s.description,2)}
      ${imgPickerHtml('st-img-'+i, s.image||'', 'Photo (optional)', 'steps')}
    </div>`).join('')}
  ${steps.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-muted);border:2px dashed var(--card-border);border-radius:10px;">No steps yet — click "+ Add Step" above</div>` : ''}
  ${saveBtn('saveSteps')}`;
}
function saveSteps() {
  wcSave('steps', (_wc_data.steps||[]).map((s,i)=>({ step:num('st-num-'+i), title:val('st-title-'+i), description:val('st-desc-'+i), image:val('st-img-'+i)||'' })));
}

// ─── Why Circle Boats ─────────────────────────────────────────────────────────

function renderFeatures() {
  const feats = _wc_data.features || [];
  return `<h2 class="wc-title">Why Circle Boats</h2>
  ${wcAddBar('features', 'Feature')}
  ${feats.map((f,i) => {
    const imgUrl = wcToUrl(f.image);
    return `<div class="wc-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;">
        <input type="text" id="ft-title-${i}" value="${esc(f.title)}" placeholder="Feature title…"
          style="font-size:16px;font-weight:600;border:none;background:transparent;padding:2px 0;flex:1;color:inherit;outline:none;border-bottom:1px dashed var(--card-border);"
          onfocus="this.style.borderBottomColor='var(--primary)'" onblur="this.style.borderBottomColor='var(--card-border)'">
        ${wcDelBtn('features', i)}
      </div>
      <div class="form-row">${fi('Icon (optional)','ft-icon-'+i,f.icon,'text','⚡')}</div>
      ${ta('Description','ft-desc-'+i,f.description,2)}
      <div style="margin-top:10px;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Photo (optional)</label>
        <div style="display:flex;align-items:center;gap:12px;">
          ${imgUrl ? `<img src="${esc(imgUrl)}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--card-border);" onerror="this.style.display='none'" id="ft-img-preview-${i}">` : `<div id="ft-img-preview-${i}" style="width:72px;height:72px;border-radius:8px;border:2px dashed var(--card-border);display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:22px;">📷</div>`}
          <div>
            <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('ft-img-file-${i}').click()">Upload Photo</button>
            <input type="file" id="ft-img-file-${i}" accept="image/*" style="display:none" onchange="wcFeatureImageUpload(this,${i})">
            ${f.image ? `<button type="button" class="btn btn-outline btn-sm" onclick="wcFeatureImageRemove(${i})" style="color:var(--danger);margin-left:6px;">Remove</button>` : ''}
          </div>
        </div>
      </div>
    </div>`;
  }).join('')}
  ${feats.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-muted);border:2px dashed var(--card-border);border-radius:10px;">No features yet — click "+ Add Feature" above</div>` : ''}
  ${saveBtn('saveFeatures')}`;
}
function saveFeatures() {
  wcSave('features', (_wc_data.features||[]).map((f,i)=>({
    icon: val('ft-icon-'+i),
    title: val('ft-title-'+i),
    description: val('ft-desc-'+i),
    image: f.image || ''
  })));
}
async function wcFeatureImageUpload(fileInput, index) {
  const file = fileInput.files[0];
  if (!file) return;
  const btn = fileInput.previousElementSibling;
  if (btn) btn.textContent = 'Uploading…';
  try {
    const url = await uploadToSupabase(file, 'feature');
    if (!url) throw new Error('Upload returned no URL');
    if (!_wc_data.features) _wc_data.features = [];
    if (!_wc_data.features[index]) _wc_data.features[index] = {};
    _wc_data.features[index].image = url;
    await wcPush();
    renderWCSection('features');
    toast('Photo uploaded ✓');
  } catch(e) {
    toast('Upload failed: ' + e.message, 'error');
    if (btn) btn.textContent = 'Upload Photo';
  }
  fileInput.value = '';
}
function wcFeatureImageRemove(index) {
  if (_wc_data.features && _wc_data.features[index]) {
    _wc_data.features[index].image = '';
    wcPush().then(() => renderWCSection('features'));
  }
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

function renderGallery() {
  const gallery = _wc_data.gallery || [];
  const gridHtml = gallery.length === 0
    ? `<div style="background:var(--bg);border:2px dashed var(--card-border);border-radius:12px;padding:48px;text-align:center;color:var(--text-muted);">No gallery photos yet. Upload your first photo above.</div>`
    : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;">
        ${gallery.map((img, i) => {
          const url = typeof img === 'string' ? img : img.url;
          const full = wcToUrl(url);
          return `<div style="position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden;border:1px solid var(--card-border);">
            <img src="${esc(full)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background='#f1f5f9'">
            <button onclick="wcGalleryRemove(${i})" title="Remove photo"
              style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.65);color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:12px;line-height:1;padding:0;">✕</button>
          </div>`;
        }).join('')}
      </div>`;
  return `<h2 class="wc-title">Gallery</h2>
  <p style="color:var(--text-muted);margin-bottom:20px;font-size:14px;">Upload photos that appear in the Gallery section of your website. Each photo uploads and saves instantly.</p>
  <div style="margin-bottom:24px;">
    <button type="button" class="btn btn-primary" onclick="document.getElementById('gal-upload-file').click()">+ Upload Photo</button>
    <input type="file" id="gal-upload-file" accept="image/*" multiple style="display:none" onchange="wcGalleryAdd(this)">
  </div>
  ${gridHtml}`;
}

async function wcGalleryAdd(fileInput) {
  const files = Array.from(fileInput.files);
  if (!files.length) return;
  const btn = fileInput.previousElementSibling;
  if (btn) btn.textContent = `Uploading ${files.length} photo${files.length>1?'s':''}…`;
  if (!_wc_data.gallery) _wc_data.gallery = [];
  try {
    for (const file of files) {
      const url = await uploadToSupabase(file, 'gallery');
      if (url) _wc_data.gallery.push(url);
    }
    await wcPush();
    renderWCSection('gallery');
    toast(`${files.length} photo${files.length>1?'s':''} added to gallery ✓`);
  } catch(e) {
    toast('Upload failed: ' + e.message, 'error');
  }
  if (btn) btn.textContent = '+ Upload Photo';
  fileInput.value = '';
}

function wcGalleryRemove(i) {
  if (!_wc_data.gallery) return;
  _wc_data.gallery.splice(i, 1);
  wcPush().then(() => renderWCSection('gallery'));
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

function renderReviews() {
  const d = _wc_data.reviews || {};
  const items = d.items || [];
  return `<h2 class="wc-title">Reviews</h2>
  <div class="form-row">${fi('Overall Rating','rv-rating',d.rating,'number','5.0')}${fi('Source label','rv-source',d.source,'text','Google Reviews')}</div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin:20px 0 12px;">
    <h3 style="margin:0;font-size:15px;font-weight:600;">Reviews (${items.length})</h3>
    <button class="btn btn-outline btn-sm" onclick="wcAddItem('reviews')">+ Add Review</button>
  </div>
  ${items.map((r,i) => `
    <div class="wc-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;">
        <input type="text" id="rv-name-${i}" value="${esc(r.name||'')}" placeholder="Reviewer name…"
          style="font-size:15px;font-weight:600;border:none;background:transparent;padding:2px 0;flex:1;color:inherit;outline:none;border-bottom:1px dashed var(--card-border);"
          onfocus="this.style.borderBottomColor='var(--primary)'" onblur="this.style.borderBottomColor='var(--card-border)'">
        ${wcDelBtn('reviews', i)}
      </div>
      <div class="form-row">
        ${fi('Initial (avatar letter)','rv-init-'+i,r.initial,'text','M')}
        ${fi('Time ago','rv-time-'+i,r.timeAgo,'text','2 weeks ago')}
        ${fi('Stars (1-5)','rv-stars-'+i,r.stars,'number')}
      </div>
      ${ta('Review Text','rv-text-'+i,r.text,3)}
    </div>`).join('')}
  ${items.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-muted);border:2px dashed var(--card-border);border-radius:10px;">No reviews yet — click "+ Add Review" above</div>` : ''}
  ${saveBtn('saveReviews')}`;
}
function saveReviews() {
  _wc_data.reviews = {
    rating:num('rv-rating'), source:val('rv-source'),
    items:(_wc_data.reviews?.items||[]).map((_,i)=>({ name:val('rv-name-'+i), initial:val('rv-init-'+i), timeAgo:val('rv-time-'+i), stars:num('rv-stars-'+i), text:val('rv-text-'+i) }))
  };
  wcPush();
}

// ─── Q&A / FAQ ───────────────────────────────────────────────────────────────

function renderQnA() {
  const items = _wc_data.qna || [];
  return `<h2 class="wc-title">Q&A / FAQ</h2>
  <p style="color:var(--text-muted);margin-bottom:20px;font-size:14px;">Add frequently asked questions. These appear in an expandable accordion on your website.</p>
  ${wcAddBar('qna', 'Question')}
  ${items.map((q,i) => `
    <div class="wc-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;">
        <span style="flex-shrink:0;font-size:16px;">❓</span>
        <input type="text" id="qa-q-${i}" value="${esc(q.question)}" placeholder="Question…"
          style="font-size:15px;font-weight:600;border:none;background:transparent;padding:2px 0;flex:1;color:inherit;outline:none;border-bottom:1px dashed var(--card-border);"
          onfocus="this.style.borderBottomColor='var(--primary)'" onblur="this.style.borderBottomColor='var(--card-border)'">
        ${wcDelBtn('qna', i)}
      </div>
      ${ta('Answer','qa-a-'+i,q.answer,3)}
    </div>`).join('')}
  ${items.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-muted);border:2px dashed var(--card-border);border-radius:10px;">No questions yet — click "+ Add Question" above</div>` : ''}
  ${saveBtn('saveQnA')}`;
}
function saveQnA() {
  const items = (_wc_data.qna||[]).map((_,i) => ({
    question: val('qa-q-'+i),
    answer: val('qa-a-'+i)
  }));
  wcSave('qna', items);
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function renderContact() {
  const d = _wc_data.contact || {};
  return `<h2 class="wc-title">Contact Form</h2>
  ${fi('Form Title','ct-title',d.formTitle,'text','Send a Message')}
  <div class="form-group">
    <label>"Interested In" dropdown options (one per line)</label>
    <textarea id="ct-int" rows="10">${esc((d.interests||[]).join('\n'))}</textarea>
  </div>
  ${saveBtn('saveContact')}`;
}
function saveContact() {
  wcSave('contact', { formTitle:val('ct-title'), interests:val('ct-int').split('\n').map(s=>s.trim()).filter(Boolean) });
}

// ─── Bio Links Page ───────────────────────────────────────────────────────────

function renderLinksPage() {
  const lp = _wc_data.links_page || {};
  const links = lp.links || [];
  const shareUrl = WC_BASE + '/beachside-site/links.html';
  return `<h2 class="wc-title">Bio Links Page</h2>
  <p style="color:var(--text-muted);margin-bottom:16px;font-size:14px;">
    This is your shareable Linktree-style page. Choose which sections appear as buttons, and add any custom links (website, booking tool, etc.).
    <br><strong style="color:var(--text);">Share URL:</strong>
    <a href="${shareUrl}" target="_blank" style="color:var(--primary);">${shareUrl}</a>
  </p>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <h3 style="margin:0;font-size:15px;font-weight:600;">Links (${links.length})</h3>
    <button class="btn btn-outline btn-sm" onclick="lpAddLink()">+ Add Custom Link</button>
  </div>
  ${links.map((l,i) => `
    <div class="wc-card" style="display:flex;align-items:center;gap:12px;padding:14px 16px;">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex-shrink:0;">
        <input type="checkbox" id="lp-en-${i}" ${l.enabled ? 'checked' : ''} onchange="lpToggleEnabled(${i})">
        <span style="font-size:18px;">${esc(l.icon||'🔗')}</span>
      </label>
      <div style="flex:1;min-width:0;">
        <input type="text" id="lp-label-${i}" value="${esc(l.label)}"
          style="width:100%;font-size:13px;font-weight:600;margin-bottom:4px;"
          placeholder="Button label">
        <input type="text" id="lp-sub-${i}" value="${esc(l.sub||'')}"
          style="width:100%;font-size:12px;color:var(--text-muted);"
          placeholder="Subtitle (optional)">
        ${l.id === 'website' || l.url ? `<input type="text" id="lp-url-${i}" value="${esc(l.url||'')}" style="width:100%;font-size:12px;margin-top:4px;" placeholder="URL">` : ''}
      </div>
      <input type="text" id="lp-icon-${i}" value="${esc(l.icon||'')}"
        style="width:44px;font-size:18px;text-align:center;flex-shrink:0;" placeholder="🔗">
      ${l.id && !['booking','fleet','gallery','reviews','about','website'].includes(l.id)
        ? `<button class="btn btn-sm" onclick="lpDeleteLink(${i})" style="color:var(--danger,#ef4444);border-color:var(--danger,#ef4444);flex-shrink:0;">✕</button>` : ''}
    </div>`).join('')}
  ${saveBtn('saveLinksPage')}`;
}

function lpToggleEnabled(i) {
  if (!_wc_data.links_page) _wc_data.links_page = { links: [] };
  if (_wc_data.links_page.links[i]) {
    _wc_data.links_page.links[i].enabled = document.getElementById('lp-en-' + i).checked;
  }
}

function lpAddLink() {
  if (!_wc_data.links_page) _wc_data.links_page = { links: [] };
  if (!_wc_data.links_page.links) _wc_data.links_page.links = [];
  _wc_data.links_page.links.push({ id: 'custom_' + Date.now(), enabled: true, icon: '🔗', label: 'New Link', sub: '', url: '' });
  renderWCSection('links_page');
}

function lpDeleteLink(i) {
  if (!_wc_data.links_page?.links) return;
  _wc_data.links_page.links.splice(i, 1);
  renderWCSection('links_page');
}

function saveLinksPage() {
  if (!_wc_data.links_page) _wc_data.links_page = {};
  const links = (_wc_data.links_page.links||[]).map((l, i) => ({
    id: l.id,
    enabled: document.getElementById('lp-en-' + i)?.checked ?? l.enabled,
    icon: val('lp-icon-' + i) || l.icon,
    label: val('lp-label-' + i),
    sub: val('lp-sub-' + i),
    url: val('lp-url-' + i) || l.url || ''
  }));
  _wc_data.links_page.links = links;
  wcSave('links_page', _wc_data.links_page);
}

// ─── Launch Locations ─────────────────────────────────────────────────────────

function renderLocations() {
  const locs = _wc_data.locations || [];
  return `<h2 class="wc-title">Launch Locations</h2>
  <p style="color:var(--text-muted);margin-bottom:20px;font-size:14px;">Manage where customers can launch from. These appear on your website and in the booking flow — customers must choose a location to complete their booking.</p>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <h3 style="margin:0;font-size:15px;font-weight:600;">Locations (${locs.length})</h3>
    <button class="btn btn-outline btn-sm" onclick="wcAddItem('locations')">+ Add Location</button>
  </div>
  ${locs.map((l,i) => `
    <div class="wc-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;">
        <span style="flex-shrink:0;font-size:16px;">📍</span>
        <input type="text" id="lc-name-${i}" value="${esc(l.name)}" placeholder="Location name…"
          style="font-size:15px;font-weight:600;border:none;background:transparent;padding:2px 0;flex:1;color:inherit;outline:none;border-bottom:1px dashed var(--card-border);"
          onfocus="this.style.borderBottomColor='var(--primary)'" onblur="this.style.borderBottomColor='var(--card-border)'">
        ${wcDelBtn('locations', i)}
      </div>
      <input type="hidden" id="lc-id-${i}" value="${esc(l.id||'')}">
      ${imgPickerHtml('lc-img-'+i, l.image||'', 'Location Photo', 'locations')}
      <div class="form-row">${fi('Address','lc-addr-'+i,l.address,'text','25856 Canal Road...')}</div>
      ${ta('Description (shown in booking)','lc-desc-'+i,l.description,2)}
      ${fi('Google Maps URL (optional)','lc-map-'+i,l.mapUrl,'url','https://maps.google.com/?q=...')}
    </div>`).join('')}
  ${locs.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-muted);border:2px dashed var(--card-border);border-radius:10px;">No locations yet — click "+ Add Location" above</div>` : ''}
  ${saveBtn('saveLocations')}`;
}
function saveLocations() {
  wcCollect('locations');
  wcSave('locations', _wc_data.locations);
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function renderFooter() {
  const d = _wc_data.footer || {};
  return `<h2 class="wc-title">Footer</h2>
  ${fi('Business Name','ft2-name',d.businessName)}
  ${ta('Footer Tagline','ft2-tag',d.tagline)}
  <h3 style="margin:20px 0 8px;font-size:14px;font-weight:600;">Footer Links — format: <code>Label|/url</code> (one per line)</h3>
  <div class="form-group"><textarea id="ft2-links" rows="6">${esc((d.links||[]).map(l=>l.label+'|'+l.href).join('\n'))}</textarea></div>
  <h3 style="margin:20px 0 8px;font-size:14px;font-weight:600;">Services (one per line)</h3>
  <div class="form-group"><textarea id="ft2-svcs" rows="5">${esc((d.services||[]).join('\n'))}</textarea></div>
  ${saveBtn('saveFooter')}`;
}
function saveFooter() {
  const links = val('ft2-links').split('\n').map(line => {
    const [label,...rest] = line.split('|');
    return { label:label.trim(), href:rest.join('|').trim() };
  }).filter(l=>l.label);
  wcSave('footer', { businessName:val('ft2-name'), tagline:val('ft2-tag'), links, services:val('ft2-svcs').split('\n').map(s=>s.trim()).filter(Boolean) });
}

// ─── Register page callback ───────────────────────────────────────────────────

if (typeof onPageLoad === 'function') {
  onPageLoad('website-content', loadWebsiteContent);
}
