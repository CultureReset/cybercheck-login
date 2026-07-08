// ============================================
// cc.js — CyberCheck API Client
// ALL calls go through gcr-api-clean /api/dashboard/*
// NO direct Supabase calls for dashboard data
// ============================================

const CC = (function() {

  var API_BASE = window.CC_API_BASE || 'https://gcr-api-clean.vercel.app';

  // ---- Token / Session ----
  function getToken() {
    try {
      var sbKey = Object.keys(localStorage).find(function(k) {
        return k.startsWith('sb-') && k.endsWith('-auth-token');
      });
      if (sbKey) {
        var s = JSON.parse(localStorage.getItem(sbKey));
        if (s && s.access_token) return s.access_token;
      }
    } catch(e) {}
    return localStorage.getItem('cc_token') || sessionStorage.getItem('cc_token') || null;
  }

  function setToken(token, remember) {
    if (remember) { localStorage.setItem('cc_token', token); }
    else { sessionStorage.setItem('cc_token', token); }
  }

  function setSession(userData) {
    if (userData && userData.business) {
      try { localStorage.setItem('cc_session_business', JSON.stringify(userData.business)); } catch(e) {}
    }
  }

  function getStoredBusiness() {
    try {
      var s = localStorage.getItem('cc_session_business');
      return s ? JSON.parse(s) : null;
    } catch(e) { return null; }
  }

  function clearToken() {
    localStorage.removeItem('cc_token');
    sessionStorage.removeItem('cc_token');
    localStorage.removeItem('cc_session_business');
  }

  // ---- Core fetch — always sends token, always hits gcr-api-clean ----
  async function request(method, path, body) {
    try {
      var opts = { method: method, headers: { 'Content-Type': 'application/json' } };
      var token = getToken();
      if (token) opts.headers['Authorization'] = 'Bearer ' + token;
      if (body && method !== 'GET') opts.body = JSON.stringify(body);
      var res = await fetch(API_BASE + path, opts);
      if (!res.ok) {
        var err = null;
        try { err = await res.json(); } catch(e) {}
        console.error('CC API error', method, path, res.status, err);
        return null;
      }
      return await res.json();
    } catch(e) {
      console.error('CC request failed', method, path, e);
      return null;
    }
  }

  function get(path)         { return request('GET',    path); }
  function post(path, body)  { return request('POST',   path, body); }
  function put(path, body)   { return request('PUT',    path, body); }
  function patch(path, body) { return request('PATCH',  path, body); }
  function del(path)         { return request('DELETE', path); }

  // ---- Auth ----
  async function login(email, password, remember) {
    // Try Supabase auth first (sets session for gcr-api-clean JWT verify)
    if (window.supabase && window.supabase.auth) {
      try {
        var { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
        if (!error && data && data.session) {
          // Verify with gcr-api-clean to get role + business info
          try {
            var roleRes = await fetch(API_BASE + '/api/auth/verify', {
              headers: { 'Authorization': 'Bearer ' + data.session.access_token }
            });
            var roleData = await roleRes.json();
            if (roleData && roleData.user) {
              data.user.role = roleData.user.role;
              if (roleData.business) setSession({ business: roleData.business });
            }
          } catch(e) {}
          return { token: data.session.access_token, user: data.user, business: getStoredBusiness() };
        }
      } catch(e) {}
    }
    // Fallback: legacy Express login
    try {
      var res = await fetch(API_BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      var data = await res.json();
      if (!res.ok) return { error: data.error || 'Invalid credentials' };
      setToken(data.token, remember !== false);
      setSession(data);
      return { token: data.token, user: data.user, business: data.business };
    } catch(e) {
      return { error: 'Login failed — check your connection' };
    }
  }

  async function signup(payload) {
    try {
      var res = await fetch(API_BASE + '/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
          name: payload.name || payload.businessName,
          businessName: payload.businessName || payload.name,
          businessType: payload.businessType || 'restaurant'
        })
      });
      var data = await res.json();
      if (!res.ok) return { error: data.error || 'Signup failed' };
      return data;
    } catch(e) {
      return { error: 'Cannot reach server' };
    }
  }

  async function logout() {
    try {
      if (window.supabase && window.supabase.auth) await window.supabase.auth.signOut();
    } catch(e) {}
    clearToken();
    window.location.href = 'login.html';
  }

  async function getSession() {
    // Try Supabase session first
    if (window.supabase && window.supabase.auth) {
      try {
        var { data } = await window.supabase.auth.getSession();
        if (data && data.session) {
          var biz = getStoredBusiness();
          if (!biz) {
            // Load from gcr-api-clean
            var profile = await get('/api/dashboard/profile');
            if (profile) {
              setSession({ business: profile });
              biz = profile;
            }
          }
          return { user: data.session.user, business: biz };
        }
      } catch(e) {}
    }
    // Fallback: legacy token
    var token = localStorage.getItem('cc_token') || sessionStorage.getItem('cc_token');
    if (token) {
      var biz = getStoredBusiness();
      return { user: { id: 'legacy', email: '' }, business: biz, legacy: true };
    }
    return null;
  }

  // ---- Dashboard cache ----
  var _cache = {};
  var _cacheTTL = 2 * 60 * 1000;
  function cacheGet(k) { var e = _cache[k]; return (e && Date.now()-e.ts < _cacheTTL) ? e.data : undefined; }
  function cacheSet(k, d) { _cache[k] = { data: d, ts: Date.now() }; }
  function cacheClear(prefix) {
    if (!prefix) { _cache = {}; return; }
    Object.keys(_cache).forEach(function(k) { if (k.indexOf(prefix) === 0) delete _cache[k]; });
  }

  // ---- Dashboard — all calls go to /api/dashboard/* on gcr-api-clean ----
  var dashboard = {

    // PROFILE
    getProfile:    function() { return get('/api/dashboard/profile'); },
    updateProfile: function(d) { cacheClear('getProfile'); return put('/api/dashboard/profile', d); },

    // HOURS
    getHours:    function() { return get('/api/dashboard/hours'); },
    updateHours: function(d) { cacheClear('getHours'); return put('/api/dashboard/hours', d); },

    // SERVICES
    getServices:    function() { return get('/api/dashboard/services'); },
    createService:  function(d) { cacheClear('getServices'); return post('/api/dashboard/services', d); },
    updateService:  function(id, d) { cacheClear('getServices'); return put('/api/dashboard/services/' + id, d); },
    deleteService:  function(id) { cacheClear('getServices'); return del('/api/dashboard/services/' + id); },

    // GALLERY / MEDIA
    getGallery:   function() { return get('/api/dashboard/gallery'); },
    uploadMedia:  function(d) { cacheClear('getGallery'); return post('/api/dashboard/gallery', d); },
    updateMedia:  function(id, d) { cacheClear('getGallery'); return put('/api/dashboard/gallery/' + id, d); },
    deleteMedia:  function(id) { cacheClear('getGallery'); return del('/api/dashboard/gallery/' + id); },

    // FAQS
    getFaqs:    function() { return get('/api/dashboard/faqs'); },
    getFAQs:    function() { return get('/api/dashboard/faqs'); },
    createFaq:  function(d) { cacheClear('getFaq'); return post('/api/dashboard/faqs', d); },
    createFAQ:  function(d) { cacheClear('getFaq'); return post('/api/dashboard/faqs', d); },
    updateFaq:  function(id, d) { cacheClear('getFaq'); return put('/api/dashboard/faqs/' + id, d); },
    updateFAQ:  function(id, d) { cacheClear('getFaq'); return put('/api/dashboard/faqs/' + id, d); },
    deleteFaq:  function(id) { cacheClear('getFaq'); return del('/api/dashboard/faqs/' + id); },
    deleteFAQ:  function(id) { cacheClear('getFaq'); return del('/api/dashboard/faqs/' + id); },

    // SOCIAL
    getSocial:    function() { return get('/api/dashboard/social'); },
    updateSocial: function(d) { cacheClear('getSocial'); return put('/api/dashboard/social', d); },

    // TEAM / STAFF
    getTeam:     function() { return get('/api/dashboard/team'); },
    getStaff:    function() { return get('/api/dashboard/team'); },
    createTeam:  function(d) { cacheClear('getTeam'); return post('/api/dashboard/team', d); },
    createStaff: function(d) { cacheClear('getTeam'); return post('/api/dashboard/team', d); },
    updateTeam:  function(id, d) { cacheClear('getTeam'); return put('/api/dashboard/team/' + id, d); },
    updateStaff: function(id, d) { cacheClear('getTeam'); return put('/api/dashboard/team/' + id, d); },
    deleteTeam:  function(id) { cacheClear('getTeam'); return del('/api/dashboard/team/' + id); },
    deleteStaff: function(id) { cacheClear('getTeam'); return del('/api/dashboard/team/' + id); },

    // MENU ITEMS
    getMenu:         function() { return get('/api/dashboard/menu-items'); },
    createMenuItem:  function(d) { cacheClear('getMenu'); return post('/api/dashboard/menu-items', d); },
    updateMenuItem:  function(id, d) { cacheClear('getMenu'); return put('/api/dashboard/menu-items/' + id, d); },
    deleteMenuItem:  function(id) { cacheClear('getMenu'); return del('/api/dashboard/menu-items/' + id); },

    // MENU CATEGORIES
    getMenuCategories:    function() { return get('/api/dashboard/menu-categories'); },
    createMenuCategory:   function(d) { cacheClear('getMenuCategories'); return post('/api/dashboard/menu-categories', d); },
    updateMenuCategory:   function(id, d) { cacheClear('getMenuCategories'); return put('/api/dashboard/menu-categories/' + id, d); },
    deleteMenuCategory:   function(id) { cacheClear('getMenuCategories'); return del('/api/dashboard/menu-categories/' + id); },

    // MENU SUBCATEGORIES
    getMenuSubcategories:   function() { return get('/api/dashboard/menu-subcategories'); },
    createMenuSubcategory:  function(d) { cacheClear('getMenuSubcategories'); return post('/api/dashboard/menu-subcategories', d); },
    updateMenuSubcategory:  function(id, d) { cacheClear('getMenuSubcategories'); return put('/api/dashboard/menu-subcategories/' + id, d); },
    deleteMenuSubcategory:  function(id) { cacheClear('getMenuSubcategories'); return del('/api/dashboard/menu-subcategories/' + id); },

    // EVENTS
    getEvents:    function() { return get('/api/dashboard/events'); },
    createEvent:  function(d) { cacheClear('getEvents'); return post('/api/dashboard/events', d); },
    updateEvent:  function(id, d) { cacheClear('getEvents'); return put('/api/dashboard/events/' + id, d); },
    deleteEvent:  function(id) { cacheClear('getEvents'); return del('/api/dashboard/events/' + id); },

    // SPECIALS
    getSpecials:    function() { return get('/api/dashboard/specials'); },
    createSpecial:  function(d) { cacheClear('getSpecials'); return post('/api/dashboard/specials', d); },
    updateSpecial:  function(id, d) { cacheClear('getSpecials'); return put('/api/dashboard/specials/' + id, d); },
    deleteSpecial:  function(id) { cacheClear('getSpecials'); return del('/api/dashboard/specials/' + id); },

    // FLEET (charter/rental)
    getFleetTypes:    function() { return get('/api/dashboard/fleet'); },
    createFleetType:  function(d) { cacheClear('getFleet'); return post('/api/dashboard/fleet', d); },
    updateFleetType:  function(id, d) { cacheClear('getFleet'); return put('/api/dashboard/fleet/' + id, d); },
    deleteFleetType:  function(id) { cacheClear('getFleet'); return del('/api/dashboard/fleet/' + id); },

    // FLEET ITEMS
    getFleetItems:    function() { return get('/api/dashboard/fleet-items'); },
    createFleetItem:  function(d) { cacheClear('getFleetItems'); return post('/api/dashboard/fleet-items', d); },
    updateFleetItem:  function(id, d) { cacheClear('getFleetItems'); return put('/api/dashboard/fleet-items/' + id, d); },
    deleteFleetItem:  function(id) { cacheClear('getFleetItems'); return del('/api/dashboard/fleet-items/' + id); },

    // TIME SLOTS
    getTimeSlots:    function() { return get('/api/dashboard/time-slots'); },
    createTimeSlot:  function(d) { cacheClear('getTimeSlots'); return post('/api/dashboard/time-slots', d); },
    updateTimeSlot:  function(id, d) { cacheClear('getTimeSlots'); return put('/api/dashboard/time-slots/' + id, d); },
    deleteTimeSlot:  function(id) { cacheClear('getTimeSlots'); return del('/api/dashboard/time-slots/' + id); },

    // PRICING
    getPricing:  function() { return get('/api/dashboard/pricing'); },
    setPricing:  function(d) { cacheClear('getPricing'); return post('/api/dashboard/pricing', d); },
    updatePricing: function(id, d) { cacheClear('getPricing'); return put('/api/dashboard/pricing/' + id, d); },
    deletePricing: function(id) { cacheClear('getPricing'); return del('/api/dashboard/pricing/' + id); },

    // ADDONS
    getAddons:    function() { return get('/api/dashboard/addons'); },
    createAddon:  function(d) { cacheClear('getAddons'); return post('/api/dashboard/addons', d); },
    updateAddon:  function(id, d) { cacheClear('getAddons'); return put('/api/dashboard/addons/' + id, d); },
    deleteAddon:  function(id) { cacheClear('getAddons'); return del('/api/dashboard/addons/' + id); },

    // GROUP RATES
    getGroupRates:    function() { return get('/api/dashboard/group-rates'); },
    createGroupRate:  function(d) { cacheClear('getGroupRates'); return post('/api/dashboard/group-rates', d); },
    deleteGroupRate:  function(id) { cacheClear('getGroupRates'); return del('/api/dashboard/group-rates/' + id); },

    // BOOKINGS
    getBookings:    function(params) {
      var q = params ? '?' + new URLSearchParams(params).toString() : '';
      return get('/api/dashboard/bookings' + q);
    },
    getBooking:     function(id) { return get('/api/dashboard/bookings/' + id); },
    createBooking:  function(d) { cacheClear('getBookings'); return post('/api/dashboard/bookings', d); },
    updateBooking:  function(id, d) { cacheClear('getBookings'); return put('/api/dashboard/bookings/' + id, d); },
    deleteBooking:  function(id) { cacheClear('getBookings'); return del('/api/dashboard/bookings/' + id); },

    // ORDERS
    getOrders:    function(params) {
      var q = params ? '?' + new URLSearchParams(params).toString() : '';
      return get('/api/dashboard/orders' + q);
    },
    updateOrder:  function(id, d) { cacheClear('getOrders'); return put('/api/dashboard/orders/' + id, d); },

    // CUSTOMERS
    getCustomers:    function(params) {
      var q = params ? '?' + new URLSearchParams(params).toString() : '';
      return get('/api/dashboard/customers' + q);
    },
    getCustomer:     function(id) { return get('/api/dashboard/customers/' + id); },
    createCustomer:  function(d) { cacheClear('getCustomers'); return post('/api/dashboard/customers', d); },
    updateCustomer:  function(id, d) { cacheClear('getCustomers'); return put('/api/dashboard/customers/' + id, d); },
    deleteCustomer:  function(id) { cacheClear('getCustomers'); return del('/api/dashboard/customers/' + id); },

    // REVIEWS
    getReviews:           function() { return get('/api/dashboard/reviews'); },
    updateReview:         function(id, d) { cacheClear('getReviews'); return put('/api/dashboard/reviews/' + id, d); },
    deleteReview:         function(id) { cacheClear('getReviews'); return del('/api/dashboard/reviews/' + id); },
    getPendingReviews:    function() { return get('/api/dashboard/reviews/pending'); },
    sendReviewRequest:    function(d) { return post('/api/dashboard/reviews/send-request', d); },

    // REVIEW QUESTIONS
    getReviewQuestions:    function() { return get('/api/dashboard/review-questions'); },
    createReviewQuestion:  function(d) { cacheClear('getReviewQuestions'); return post('/api/dashboard/review-questions', d); },
    updateReviewQuestion:  function(id, d) { cacheClear('getReviewQuestions'); return put('/api/dashboard/review-questions/' + id, d); },
    deleteReviewQuestion:  function(id) { cacheClear('getReviewQuestions'); return del('/api/dashboard/review-questions/' + id); },

    // WAIVERS
    getWaivers:         function() { return get('/api/dashboard/waivers'); },
    getWaiverTemplate:  function() { return get('/api/dashboard/waivers/template'); },
    updateWaiverTemplate: function(d) { return put('/api/dashboard/waivers/template', d); },
    getWaiverByBooking: function(bookingId) { return get('/api/dashboard/waivers/booking/' + bookingId); },
    getWaiverLink:      function() { return get('/api/dashboard/waivers/link'); },
    createWaiverLink:   function(d) { return post('/api/dashboard/waivers/link', d); },

    // POLICIES (deposit + cancellation/refund terms)
    getPolicies:    function() { return get('/api/dashboard/policies'); },
    updatePolicies: function(d) { return put('/api/dashboard/policies', d); },

    // DOCUMENT UPLOADS (waiver PDF, cancellation/refund policy PDF, etc.)
    uploadDocument: function(d) { return post('/api/dashboard/documents/upload', d); },
    deleteDocument: function(kind) { return del('/api/dashboard/documents/' + kind); },

    // MENU EDITOR BRIDGE (deep-link into menu-editor.html with no separate PIN entry)
    getMenuEditorLink: function() { return get('/api/dashboard/menu-editor-link'); },

    // TRANSPORTATION (brokered ride/pickup dispatch)
    getTransportSettings:    function() { return get('/api/transportation/company/settings'); },
    updateTransportSettings: function(d) { return patch('/api/transportation/company/settings', d); },
    getTransportProviders:   function() { return get('/api/transportation/providers'); },
    addTransportProvider:    function(d) { return post('/api/transportation/providers', d); },
    updateTransportProvider: function(id, d) { return patch('/api/transportation/providers/' + id, d); },
    deleteTransportProvider: function(id) { return del('/api/transportation/providers/' + id); },
    getTransportRequests:    function() { return get('/api/transportation/requests'); },

    // COUPONS
    getCoupons:    function() { return get('/api/dashboard/coupons'); },
    createCoupon:  function(d) { cacheClear('getCoupons'); return post('/api/dashboard/coupons', d); },
    updateCoupon:  function(id, d) { cacheClear('getCoupons'); return put('/api/dashboard/coupons/' + id, d); },
    deleteCoupon:  function(id) { cacheClear('getCoupons'); return del('/api/dashboard/coupons/' + id); },

    // QR THEME
    getQrTheme:    function() { return get('/api/dashboard/qr-theme'); },
    updateQrTheme: function(d) { return put('/api/dashboard/qr-theme', d); },

    // CONNECTIONS
    getConnections: function() { return get('/api/dashboard/connections'); },
    disconnect:     function(id) { return del('/api/dashboard/connections/' + id); },

    // PAGES
    getPages:    function() { return get('/api/dashboard/pages'); },
    createPage:  function(d) { cacheClear('getPages'); return post('/api/dashboard/pages', d); },
    updatePage:  function(id, d) { cacheClear('getPages'); return put('/api/dashboard/pages/' + id, d); },
    deletePage:  function(id) { cacheClear('getPages'); return del('/api/dashboard/pages/' + id); },

    // THEME
    getTheme:    function() { return get('/api/dashboard/theme'); },
    updateTheme: function(d) { cacheClear('getTheme'); return put('/api/dashboard/theme', d); },

    // SEO
    getSeo:    function() { return get('/api/dashboard/seo'); },
    getSEO:    function() { return get('/api/dashboard/seo'); },
    updateSeo: function(d) { cacheClear('getSeo'); return put('/api/dashboard/seo', d); },
    updateSEO: function(d) { cacheClear('getSeo'); return put('/api/dashboard/seo', d); },

    // DOMAIN
    getDomain:    function() { return get('/api/dashboard/domain'); },
    updateDomain: function(d) { cacheClear('getDomain'); return put('/api/dashboard/domain', d); },

    // BILLING
    getBilling: function() { return get('/api/dashboard/billing'); },

    // APPS
    getApps:      function() { return get('/api/dashboard/apps'); },
    installApp:   function(d) { cacheClear('getApps'); return post('/api/dashboard/apps/install', d); },
    uninstallApp: function(d) { cacheClear('getApps'); return post('/api/dashboard/apps/uninstall', d); },

    // NOTIFICATIONS
    getNotifications: function() { return get('/api/dashboard/notifications'); },
    markAllRead:      function() { cacheClear('getNotifications'); return put('/api/dashboard/notifications/read-all'); },

    // SMS LOG
    getSmsLog: function() { return get('/api/dashboard/sms-log'); },

    // AVAILABILITY
    getAvailability: function() { return get('/api/dashboard/availability'); },
    setAvailability: function(d) { cacheClear('getAvailability'); return post('/api/dashboard/availability', d); },
    updateAvailability: function(id, d) { cacheClear('getAvailability'); return put('/api/dashboard/availability/' + id, d); },
    deleteAvailability: function(id) { cacheClear('getAvailability'); return del('/api/dashboard/availability/' + id); },

    // BLACKOUT / BLOCKS
    getBlackoutDates:   function() { return get('/api/dashboard/availability/blocks'); },
    addBlackoutDate:    function(d) { cacheClear('getBlackout'); return post('/api/dashboard/availability/block', d); },
    deleteBlackoutDate: function(id) { cacheClear('getBlackout'); return del('/api/dashboard/availability/block/' + id); },

    // CALENDAR SYNC (iCal export to Airbnb/VRBO/Google Calendar)
    getIcalFeedUrl:      function() { return get('/api/dashboard/ical/feed-url'); },
    regenerateIcalFeed:  function() { return post('/api/dashboard/ical/regenerate'); },

    // CALENDAR SYNC — external calendar import (Airbnb/VRBO -> GCR)
    getExternalCalendars:    function() { return get('/api/dashboard/ical/external'); },
    addExternalCalendar:     function(d) { return post('/api/dashboard/ical/external', d); },
    deleteExternalCalendar:  function(id) { return del('/api/dashboard/ical/external/' + id); },
    syncExternalCalendarNow: function(id) { return post('/api/dashboard/ical/external/' + id + '/sync-now'); },

    // ACTIVITY LOG
    getActivity: function() { return get('/api/dashboard/activity'); },

    // ANALYTICS
    getAnalytics: function() { return get('/api/dashboard/analytics'); },

    // MEDIA (alias for gallery)
    getMedia:    function() { return get('/api/dashboard/media'); },
    uploadImage: function(d) { cacheClear('getMedia'); return post('/api/dashboard/media', d); },
    deleteImage: function(id) { cacheClear('getMedia'); return del('/api/dashboard/media/' + id); },

    // MESSAGING SETTINGS
    getMessaging:    function() { return get('/api/dashboard/messaging-settings'); },
    updateMessaging: function(d) { cacheClear('getMessaging'); return put('/api/dashboard/messaging-settings', d); },

    // SMS CAMPAIGNS
    getSmsCampaigns:  function() { return get('/api/dashboard/sms/campaigns'); },
    createSmsCampaign: function(d) { return post('/api/dashboard/sms/campaign', d); },

    // LOYALTY
    getLoyaltySettings: function() { return get('/api/dashboard/loyalty/settings'); },
    updateLoyaltySettings: function(d) { cacheClear('getLoyalty'); return put('/api/dashboard/loyalty/settings', d); },
    getLoyaltyMembers:  function() { return get('/api/dashboard/loyalty/members'); },
    earnLoyaltyPoints:  function(d) { return post('/api/dashboard/loyalty/earn', d); },
    getLoyaltyHistory:  function(cid) { return get('/api/dashboard/loyalty/history/' + cid); },

    // MODULES
    getModules:    function() { return get('/api/dashboard/modules'); },
    updateModules: function(d) { cacheClear('getModules'); return put('/api/dashboard/modules', d); },

    // ONBOARDING
    getOnboarding:    function() { return get('/api/dashboard/onboarding'); },
    updateOnboarding: function(d) { cacheClear('getOnboarding'); return put('/api/dashboard/onboarding', d); },

    // WEBSITE CONTENT
    getWebsiteContent:    function() { return get('/api/dashboard/website-content'); },
    updateWebsiteContent: function(section, d) {
      cacheClear('getWebsiteContent');
      return put('/api/dashboard/website-content/' + section, d);
    },

    // AI PROFILE / CHAT
    getAiProfile:    function() { return get('/api/dashboard/ai-profile'); },
    updateAiProfile: function(d) { return put('/api/dashboard/ai-profile', d); },
    aiChat:          function(d) { return post('/api/dashboard/ai-chat', d); },
    getAiConversations: function() { return get('/api/dashboard/ai-chat/conversations'); },
    getAiConversation:  function(id) { return get('/api/dashboard/ai-chat/conversations/' + id); },
    deleteAiConversation: function(id) { return del('/api/dashboard/ai-chat/conversations/' + id); },

    // QA PAIRS
    getQaPairs:    function() { return get('/api/dashboard/qa-pairs'); },
    createQaPair:  function(d) { cacheClear('getQaPairs'); return post('/api/dashboard/qa-pairs', d); },
    updateQaPair:  function(id, d) { cacheClear('getQaPairs'); return put('/api/dashboard/qa-pairs/' + id, d); },
    deleteQaPair:  function(id) { cacheClear('getQaPairs'); return del('/api/dashboard/qa-pairs/' + id); },

    // PROMOTIONS
    getPromotions:    function() { return get('/api/dashboard/promotions'); },
    createPromotion:  function(d) { cacheClear('getPromotions'); return post('/api/dashboard/promotions', d); },
    updatePromotion:  function(id, d) { cacheClear('getPromotions'); return put('/api/dashboard/promotions/' + id, d); },
    deletePromotion:  function(id) { cacheClear('getPromotions'); return del('/api/dashboard/promotions/' + id); },

    // PUBLISH
    publish: function() { return post('/api/dashboard/publish', {}); },

    // OVERVIEW
    getOverview:         function() { return get('/api/dashboard/overview'); },
    getDeclinedBookings: function() { return get('/api/dashboard/declined-bookings'); },

    // CALENDAR
    getCalendar: function() { return get('/api/dashboard/calendar'); },

    // STRIPE STATUS
    getStripeStatus: function() { return get('/api/dashboard/stripe-status'); },

    // SEND SMS
    sendSMS: async function(d) {
      var res = await fetch(API_BASE + '/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (getToken() || '') },
        body: JSON.stringify(d)
      });
      if (!res.ok) { var e = await res.json(); throw new Error(e.error || 'SMS failed'); }
      return await res.json();
    },

    // RESEND CONFIRMATION
    resendConfirmation: function(d) { return post('/api/public/resend-confirmation', d); },

    // EXPORT
    exportData: function(type) { return post('/api/dashboard/export/' + type, {}); }
  };

  // ---- Image helpers (no change — these are client-side only) ----
  function isHeicFile(file) {
    if (!file) return false;
    var t = (file.type || '').toLowerCase();
    if (t === 'image/heic' || t === 'image/heif') return true;
    return /\.hei[cf]$/i.test(file.name || '');
  }

  async function isHeicByMagicBytes(file) {
    try {
      var buf = await file.slice(0, 12).arrayBuffer();
      var v = new Uint8Array(buf);
      if (v[4]!==0x66||v[5]!==0x74||v[6]!==0x79||v[7]!==0x70) return false;
      var brand = String.fromCharCode(v[8],v[9],v[10],v[11]);
      return /^(heic|heis|hevx|hevc|mif1|msf1)/i.test(brand);
    } catch(e) { return false; }
  }

  var _heic2anyPromise = null;
  function loadHeic2Any() {
    if (window.heic2any) return Promise.resolve(window.heic2any);
    if (_heic2anyPromise) return _heic2anyPromise;
    _heic2anyPromise = new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
      s.onload = function() { window.heic2any ? resolve(window.heic2any) : reject(new Error('heic2any not available')); };
      s.onerror = function() { reject(new Error('failed to load heic2any')); };
      document.head.appendChild(s);
    });
    return _heic2anyPromise;
  }

  async function heicToJpeg(file) {
    var h = await loadHeic2Any();
    var out = await h({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    var blob = Array.isArray(out) ? out[0] : out;
    var name = (file.name || 'image').replace(/\.[^.]+$/i, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  }

  async function compressImage(file, maxDim, quality) {
    maxDim = maxDim || 1280;
    quality = quality == null ? 0.75 : quality;
    if (isHeicFile(file) || await isHeicByMagicBytes(file)) {
      try { file = await heicToJpeg(file); } catch(e) { throw new Error('HEIC conversion failed: ' + e.message); }
    }
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function() { reject(new Error('read failed')); };
      reader.onload = function(e) {
        var img = new Image();
        img.onerror = function() { reject(new Error('decode failed')); };
        img.onload = function() {
          var w = img.naturalWidth, h = img.naturalHeight;
          var scale = Math.min(1, maxDim / Math.max(w, h));
          var cw = Math.round(w * scale), ch = Math.round(h * scale);
          var canvas = document.createElement('canvas');
          canvas.width = cw; canvas.height = ch;
          canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);
          var dataUrl = canvas.toDataURL('image/jpeg', quality);
          canvas.toBlob(function(blob) {
            resolve({ dataUrl: dataUrl, blob: blob, mimeType: 'image/jpeg' });
          }, 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function compressImageFile(file, maxDim, quality) {
    if (!file) return file;
    var isImg = (file.type || '').indexOf('image/') === 0 || isHeicFile(file);
    if (!isImg) return file;
    try {
      var c = await compressImage(file, maxDim, quality);
      if (!c.blob) return file;
      var name = (file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg';
      return new File([c.blob], name, { type: 'image/jpeg' });
    } catch(e) { return file; }
  }

  function attachSelectSearch(sel, placeholder) {
    if (!sel || sel.dataset.ccSearch === '1') { if (sel) ccSyncSearchOptions(sel); return; }
    sel.dataset.ccSearch = '1';
    var input = document.createElement('input');
    input.type = 'search';
    input.placeholder = placeholder || 'Type to filter...';
    input.style.cssText = 'display:block;width:100%;margin-top:6px;padding:7px 10px;background:var(--bg);border:1px solid var(--card-border);border-radius:8px;color:var(--text);font-size:13px;box-sizing:border-box;';
    input.addEventListener('input', function() {
      var q = (input.value || '').trim().toLowerCase();
      Array.prototype.forEach.call(sel.options, function(o, i) {
        if (i === 0 && o.value === '') { o.hidden = false; return; }
        o.hidden = !(!q || (o.textContent || '').toLowerCase().indexOf(q) !== -1);
      });
    });
    if (sel.parentNode) sel.parentNode.insertBefore(input, sel.nextSibling);
    sel._ccSearchInput = input;
  }

  function ccSyncSearchOptions(sel) {
    if (sel._ccSearchInput) sel._ccSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ---- Public API ----
  return {
    get: get, post: post, put: put, patch: patch, del: del,
    login: login, signup: signup, logout: logout, getSession: getSession,
    getToken: getToken, setToken: setToken, clearToken: clearToken,
    dashboard: dashboard,
    clearDashCache: cacheClear,
    compressImage: compressImage,
    compressImageFile: compressImageFile,
    attachSelectSearch: attachSelectSearch,
    API_BASE: API_BASE
  };
})();
