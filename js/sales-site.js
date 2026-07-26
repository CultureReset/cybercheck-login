/* ============================================================
   CYBERCHECK SALES SITE — RENDERER + LEAD FORM
   ============================================================
   Loaded by index.html and every page under /industries/.

   Industry pages set window.CC_VERTICAL = '<id>' before this
   script runs; it then renders the whole page body from the
   matching entry in js/verticals.js. index.html renders its own
   body and only borrows the nav, footer, industry grid, and form.

   Every form posts to POST /api/gcr/sales-lead, which writes the
   real `leads` table. Those rows show up in admin.html under
   Sales Leads, filterable by the `source` each page sends.

   Not to be confused with js/sales-page.js — that one is the
   admin-side editor for the cybercheck-links marketing pages.
   ============================================================ */

(function () {
  'use strict';

  var API = window.CC_API_BASE || 'https://gcr-api-clean.vercel.app';
  var SIGNUP = 'bookpro-start.html';
  var DASHBOARD = 'modular-dashboard.html';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ── shared chrome ─────────────────────────────────────── */

  function navHTML(base) {
    base = base || '';
    var links = (window.CC_VERTICALS || []).map(function (v) {
      return '<a href="' + base + 'industries/' + v.id + '.html">' + v.emoji + ' ' + esc(v.short) + '</a>';
    }).join('');
    return '' +
      '<nav class="nav" aria-label="Primary">' +
        '<div class="container nav-inner">' +
          '<a class="brand" href="' + base + 'index.html" aria-label="CyberCheck home">' +
            '<span class="brand-mark">C</span>' +
            '<span><span class="brand-name">CyberCheck</span>' +
            '<span class="brand-sub">Customer Growth Infrastructure</span></span>' +
          '</a>' +
          '<div class="nav-links">' +
            '<a href="' + base + 'index.html#how">How it works</a>' +
            '<a href="' + base + 'index.html#industries">Industries</a>' +
            '<a href="' + base + 'index.html#included">What you get</a>' +
          '</div>' +
          '<div class="nav-actions">' +
            '<a class="btn ghost small" href="' + base + DASHBOARD + '">Sign in</a>' +
            '<a class="btn primary small" href="#start">Get Started</a>' +
          '</div>' +
          '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobileNav" aria-label="Open navigation">☰</button>' +
        '</div>' +
      '</nav>' +
      '<div class="mobile-nav" id="mobileNav">' +
        '<a href="' + base + 'index.html#how">How it works</a>' +
        links +
        '<a href="' + base + DASHBOARD + '">Sign in</a>' +
        '<a href="#start">Get Started</a>' +
      '</div>';
  }

  function footerHTML(base) {
    base = base || '';
    return '' +
      '<footer>' +
        '<div class="container footer-grid">' +
          '<div><strong>CyberCheck</strong> — customer capture, connected operations, reviews, loyalty, and discovery.</div>' +
          '<div class="footer-links">' +
            '<a href="' + base + 'index.html">Home</a>' +
            '<a href="' + base + 'index.html#industries">Industries</a>' +
            '<a href="' + base + DASHBOARD + '">Sign in</a>' +
            '<a href="mailto:info@cybercheckinc.com">info@cybercheckinc.com</a>' +
          '</div>' +
        '</div>' +
      '</footer>' +
      '<div class="mobile-cta"><a class="btn primary" href="#start">Get Started</a></div>';
  }

  /* ── lead form ─────────────────────────────────────────── */
  // opts: { source, industry (locked when set), interests[] }
  function formHTML(opts) {
    opts = opts || {};
    var industryField;

    if (opts.industry) {
      industryField =
        '<div class="field"><label for="lead-industry">Business type</label>' +
        '<input id="lead-industry" name="industry" value="' + esc(opts.industry) + '" readonly></div>';
    } else {
      var options = (window.CC_VERTICALS || []).map(function (v) {
        return '<option value="' + esc(v.name) + '">' + esc(v.name) + '</option>';
      }).join('');
      industryField =
        '<div class="field"><label for="lead-industry">Business type</label>' +
        '<select id="lead-industry" name="industry" required>' +
        '<option value="">Select one</option>' + options +
        '<option value="Something else">Something else</option></select></div>';
    }

    var interests = (opts.interests || ['Everything']).map(function (i) {
      return '<option value="' + esc(i) + '">' + esc(i) + '</option>';
    }).join('');

    return '' +
      '<form class="form-card" id="leadForm" novalidate data-source="' + esc(opts.source || 'sales-site') + '">' +
        '<div class="form-grid">' +
          '<div class="field"><label for="lead-name">Your name</label>' +
            '<input id="lead-name" name="name" autocomplete="name" required></div>' +
          '<div class="field"><label for="lead-business">Business name</label>' +
            '<input id="lead-business" name="business_name" autocomplete="organization" required></div>' +
          '<div class="field"><label for="lead-email">Email</label>' +
            '<input id="lead-email" name="email" type="email" autocomplete="email" required></div>' +
          '<div class="field"><label for="lead-phone">Phone</label>' +
            '<input id="lead-phone" name="phone" type="tel" autocomplete="tel"></div>' +
          industryField +
          '<div class="field"><label for="lead-interest">What do you need first?</label>' +
            '<select id="lead-interest" name="interest">' + interests + '</select></div>' +
          '<div class="field full"><label for="lead-website">Website or booking link <span class="muted">(optional)</span></label>' +
            '<input id="lead-website" name="website" placeholder="https://…"></div>' +
          '<div class="field full"><label for="lead-notes">Anything we should know?</label>' +
            '<textarea id="lead-notes" name="notes" placeholder="How customers find and book you today, and what you want to fix first."></textarea></div>' +
          '<div class="field full"><label class="consent">' +
            '<input type="checkbox" name="sms_consent" value="true">' +
            '<span>Text me about this. Message and data rates may apply, reply STOP to opt out.</span>' +
          '</label></div>' +
          '<div class="field full">' +
            '<button class="btn primary" type="submit" style="width:100%" id="leadSubmit">Send</button></div>' +
        '</div>' +
        '<p class="form-note" id="leadNote">We\'ll reply from a real person. No spam, no autodialer.</p>' +
        '<div class="form-msg" id="leadMsg" role="status" aria-live="polite"></div>' +
      '</form>';
  }

  function wireForm() {
    var form = document.getElementById('leadForm');
    if (!form) return;
    var msg = document.getElementById('leadMsg');
    var btn = document.getElementById('leadSubmit');

    function show(kind, text) {
      msg.className = kind ? 'form-msg ' + kind : 'form-msg';
      msg.textContent = text || '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var industry = (data.get('industry') || '').trim();
      var body = {
        name: (data.get('name') || '').trim(),
        business_name: (data.get('business_name') || '').trim(),
        email: (data.get('email') || '').trim(),
        phone: (data.get('phone') || '').trim(),
        website: (data.get('website') || '').trim(),
        industry: industry,
        business_type: industry,
        interest: (data.get('interest') || '').trim(),
        notes: (data.get('notes') || '').trim(),
        sms_consent: data.get('sms_consent') === 'true',
        source: form.getAttribute('data-source') || 'sales-site'
      };

      if (!body.name || !body.business_name) { show('err', 'Name and business name are required.'); return; }
      if (!body.email && !body.phone) { show('err', 'Add an email or a phone number so we can reach you.'); return; }

      btn.disabled = true;
      btn.textContent = 'Sending…';
      show('', '');

      fetch(API + (window.CC_LEAD_ENDPOINT || '/api/gcr/sales-lead'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok || !res.d || res.d.error) throw new Error((res.d && res.d.error) || 'Something went wrong.');
          form.querySelector('.form-grid').style.display = 'none';
          var note = document.getElementById('leadNote');
          if (note) note.style.display = 'none';
          show('ok', 'Got it — thanks. We\'ll be in touch shortly.');
        })
        .catch(function (err) {
          show('err', err.message + ' You can also email info@cybercheckinc.com.');
          btn.disabled = false;
          btn.textContent = 'Send';
        });
    });
  }

  /* ── industry grid (used by index.html) ────────────────── */

  function verticalGridHTML(base) {
    base = base || '';
    return (window.CC_VERTICALS || []).map(function (v) {
      return '' +
        '<a class="vertical" href="' + base + 'industries/' + v.id + '.html">' +
          '<div class="emoji">' + v.emoji + '</div>' +
          '<h3>' + esc(v.name) + '</h3>' +
          '<p>' + esc(v.sub.split('.')[0]) + '.</p>' +
          '<div class="go">See how it works →</div>' +
        '</a>';
    }).join('');
  }

  /* ── full industry page ────────────────────────────────── */

  function renderVertical(v, base) {
    base = base || '../';

    var previewRows = v.links.map(function (l) {
      return '' +
        '<div class="preview-row">' +
          '<div class="preview-icon">' + l[0] + '</div>' +
          '<div><b>' + esc(l[1]) + '</b><span>' + esc(l[2]) + '</span></div>' +
          '<i>›</i>' +
        '</div>';
    }).join('');

    var pains = v.pains.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('');

    var gets = v.gets.map(function (g, i) {
      return '' +
        '<article class="feature">' +
          '<div class="feature-icon">' + (i + 1) + '</div>' +
          '<h3>' + esc(g[0]) + '</h3>' +
          '<p>' + esc(g[1]) + '</p>' +
        '</article>';
    }).join('');

    var others = (window.CC_VERTICALS || []).filter(function (o) { return o.id !== v.id; })
      .map(function (o) {
        return '<a class="vertical" href="' + o.id + '.html">' +
          '<div class="emoji">' + o.emoji + '</div>' +
          '<h3>' + esc(o.short) + '</h3>' +
          '<div class="go">See how it works →</div></a>';
      }).join('');

    return '' +
      navHTML(base) +
      '<main id="top">' +

      '<header class="hero has-photo" style="--hero-img:url(' + v.hero + ')">' +
        '<div class="container hero-grid">' +
          '<div>' +
            '<span class="eyebrow">' + v.emoji + ' ' + esc(v.eyebrow) + '</span>' +
            '<h1>' + esc(v.headline) + '</h1>' +
            '<p class="hero-copy">' + esc(v.sub) + '</p>' +
            '<div class="hero-actions">' +
              '<a class="btn primary" href="#start">Get Started</a>' +
              '<a class="btn ghost" href="' + base + SIGNUP + '">Set It Up Myself</a>' +
            '</div>' +
            '<div class="hero-checks">' +
              '<span>Keep your current tools</span>' +
              '<span>Keep your checkout</span>' +
              '<span>One dashboard for everything</span>' +
            '</div>' +
          '</div>' +

          '<div class="preview-card">' +
            '<div class="preview-head">' +
              '<div class="preview-avatar">' + v.emoji + '</div>' +
              '<div><strong>What your customers see</strong>' +
              '<span>One link. One QR code. Always current.</span></div>' +
            '</div>' +
            '<div class="preview-rows">' + previewRows + '</div>' +
            '<div class="preview-note"><b>You update the data once.</b> It changes on your page, your QR code, ' +
              'Gulf Coast Radar, and the AI that answers customer questions — all at the same time.</div>' +
          '</div>' +
        '</div>' +
      '</header>' +

      '<section class="section">' +
        '<div class="container">' +
          '<div class="section-head center">' +
            '<span class="eyebrow">Sound familiar?</span>' +
            '<h2>What this actually fixes.</h2>' +
          '</div>' +
          '<div class="problem-grid">' +
            '<article class="problem-card bad">' +
              '<span class="card-label">Right now</span>' +
              '<h3>The parts that leak revenue.</h3>' +
              '<ul class="clean-list">' + pains + '</ul>' +
            '</article>' +
            '<article class="problem-card good">' +
              '<span class="card-label">With CyberCheck</span>' +
              '<h3>One record behind every surface.</h3>' +
              '<ul class="clean-list">' +
                '<li>Update once — page, QR code, and listing all change together</li>' +
                '<li>Customers get answers without calling you</li>' +
                '<li>Every enquiry lands in one place instead of five</li>' +
                '<li>Follow-up happens whether you remember or not</li>' +
              '</ul>' +
            '</article>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section soft" id="included">' +
        '<div class="container">' +
          '<div class="section-head center">' +
            '<span class="eyebrow">What you get</span>' +
            '<h2>Turn on what you need. Ignore the rest.</h2>' +
            '<p class="lead">Everything is modular. Start with the one thing that matters this week and add the rest when you\'re ready.</p>' +
          '</div>' +
          '<div class="feature-grid">' + gets + '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section" id="how">' +
        '<div class="container">' +
          '<div class="section-head center">' +
            '<span class="eyebrow">How it works</span>' +
            '<h2>Four steps, and you keep what already works.</h2>' +
          '</div>' +
          '<div class="steps">' +
            '<article class="step"><div class="step-num">Step 01</div><h3>Tell us about your business</h3>' +
              '<p>Fill out the form below, or set it up yourself in a few minutes.</p></article>' +
            '<article class="step"><div class="step-num">Step 02</div><h3>Pick your tools</h3>' +
              '<p>Install only the modules you need. Your page builds itself around them.</p></article>' +
            '<article class="step"><div class="step-num">Step 03</div><h3>Share one link</h3>' +
              '<p>QR code, website, social bio, Google listing — the same link works everywhere.</p></article>' +
            '<article class="step"><div class="step-num">Step 04</div><h3>Manage it from one dashboard</h3>' +
              '<p>Bookings, customers, reviews, and messages in one place, on your phone.</p></article>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section deep" id="start">' +
        '<div class="container form-wrap">' +
          '<div class="form-copy">' +
            '<span class="eyebrow">Let\'s talk</span>' +
            '<h2>Tell us how customers reach you today.</h2>' +
            '<p class="lead">We\'ll show you what your page would look like and what to turn on first. ' +
              'No obligation, and you keep every tool you already use.</p>' +
            '<div class="promise-box" style="margin-top:24px">' +
              '<div class="promise-row"><div class="promise-icon">1</div><div><strong>Start with one thing</strong>' +
                '<span>One booking path, one lead source, one workflow that\'s costing you money.</span></div></div>' +
              '<div class="promise-row"><div class="promise-icon">2</div><div><strong>Prove it works</strong>' +
                '<span>A captured customer, a booking, a real review.</span></div></div>' +
              '<div class="promise-row"><div class="promise-icon">3</div><div><strong>Expand when you want</strong>' +
                '<span>Add modules once the first one is earning.</span></div></div>' +
            '</div>' +
          '</div>' +
          formHTML({ source: 'sales-site-' + v.id, industry: v.name, interests: v.interests }) +
        '</div>' +
      '</section>' +

      '<section class="section soft">' +
        '<div class="container">' +
          '<div class="section-head center">' +
            '<span class="eyebrow">Same system, different door</span>' +
            '<h2>Different kind of business?</h2>' +
            '<p class="lead">Same engine underneath — just arranged around how your customers reach you.</p>' +
          '</div>' +
          '<div class="vertical-grid">' + others + '</div>' +
        '</div>' +
      '</section>' +

      '</main>' +
      footerHTML(base);
  }

  /* ── mobile nav ────────────────────────────────────────── */

  function wireNav() {
    var btn = document.querySelector('.menu-btn');
    var nav = document.getElementById('mobileNav');
    if (!btn || !nav) return;

    function close() {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open navigation');
      btn.textContent = '☰';
      nav.classList.remove('open');
    }
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      btn.textContent = open ? '☰' : '×';
      nav.classList.toggle('open', !open);
    });
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      a.addEventListener('click', close);
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1040) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ── boot ──────────────────────────────────────────────── */

  function boot() {
    var id = window.CC_VERTICAL;

    if (id) {
      var v = (window.CC_VERTICAL_BY_ID || {})[id];
      if (!v) { console.error('Unknown vertical:', id); return; }
      document.documentElement.style.setProperty('--accent', v.accent);
      document.documentElement.style.setProperty('--accent-dark', v.accent);
      document.body.innerHTML = renderVertical(v, '../');
    } else {
      // index.html renders its own body; fill in the shared pieces.
      var slot = function (sel, html) {
        var el = document.querySelector(sel);
        if (el) el.outerHTML = html;
      };
      slot('#cc-nav', navHTML(''));
      slot('#cc-footer', footerHTML(''));
      var grid = document.getElementById('cc-industry-grid');
      if (grid) grid.innerHTML = verticalGridHTML('');
      var formSlot = document.getElementById('cc-form');
      if (formSlot) {
        formSlot.outerHTML = formHTML({
          source: 'sales-site-index',
          interests: ['Getting found by customers', 'Bookings & appointments', 'Lead capture', 'Verified reviews', 'Loyalty & repeat business', 'Everything']
        });
      }
    }

    wireNav();
    wireForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.CCSalesSite = { formHTML: formHTML, navHTML: navHTML, footerHTML: footerHTML, esc: esc };
}());
