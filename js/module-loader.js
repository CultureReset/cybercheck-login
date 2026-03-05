// ============================================
// Dynamic Module Loader
// Shows/hides dashboard sections based on business type
// ============================================

const BUSINESS_TYPE_MODULES = {
  // Core modules (always shown)
  core: [
    'overview', 'profile', 'media', 'pages', 'customers', 'coupons',
    'analytics', 'seo', 'social', 'reviews', 'messaging',
    'billing', 'theme', 'connections', 'domain', 'publish'
  ],

  // Rental-specific (boats, bikes, equipment)
  rental: [
    'inventory', 'availability', 'addons', 'locations',
    'bookings', 'waivers', 'waitlist'
  ],

  // Restaurant-specific
  restaurant: [
    'menu', 'reservations', 'tables', 'orders', 'delivery',
    'specials', 'waitlist'
  ],

  // Salon/Spa-specific
  salon: [
    'staff', 'appointments', 'services', 'products',
    'intake', 'bookings', 'waitlist'
  ],

  // Retail shop-specific
  shop: [
    'products', 'inventory', 'orders', 'shipping',
    'bookings' // for in-store pickup appointments
  ],

  // Service business (general)
  service: [
    'staff', 'bookings', 'appointments', 'services',
    'waitlist', 'waivers'
  ]
};

/**
 * Initialize dashboard modules based on business type
 */
async function initBusinessTypeModules() {
  // Get business data
  var business = await getSupabaseBusiness();
  if (!business) return;

  var businessType = business.type || 'generic';
  window._businessType = businessType;

  // Get modules for this business type
  var coreModules = BUSINESS_TYPE_MODULES.core;
  var typeModules = BUSINESS_TYPE_MODULES[businessType] || [];
  var activeModules = coreModules.concat(typeModules);

  console.log('Business type:', businessType);
  console.log('Active modules:', activeModules);

  // Hide all nav items first
  document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
    var page = item.dataset.page;
    if (activeModules.indexOf(page) === -1) {
      item.style.display = 'none';
    } else {
      item.style.display = '';
    }
  });

  // Hide nav section labels if all items in section are hidden
  hideEmptySections();

  // Update business type badge
  var badge = document.getElementById('sidebar-biz-type');
  if (badge) {
    var typeLabels = {
      rental: 'Rental Business',
      restaurant: 'Restaurant',
      salon: 'Salon & Spa',
      shop: 'Retail Shop',
      service: 'Service Business'
    };
    badge.textContent = typeLabels[businessType] || 'Business';
  }
}

/**
 * Hide nav section labels if all nav items in that section are hidden
 */
function hideEmptySections() {
  document.querySelectorAll('.nav-section-label').forEach(function(label) {
    var section = label;
    var hasVisibleItems = false;

    // Check next siblings until we hit another label
    var sibling = section.nextElementSibling;
    while (sibling && !sibling.classList.contains('nav-section-label')) {
      if (sibling.classList.contains('nav-item') && sibling.style.display !== 'none') {
        hasVisibleItems = true;
        break;
      }
      sibling = sibling.nextElementSibling;
    }

    label.style.display = hasVisibleItems ? '' : 'none';
  });
}

/**
 * Check if a module is active for current business type
 */
function isModuleActive(moduleName) {
  var businessType = window._businessType || 'generic';
  var coreModules = BUSINESS_TYPE_MODULES.core;
  var typeModules = BUSINESS_TYPE_MODULES[businessType] || [];
  var activeModules = coreModules.concat(typeModules);
  return activeModules.indexOf(moduleName) > -1;
}

/**
 * Get friendly name for business type
 */
function getBusinessTypeName(type) {
  var names = {
    rental: 'Rental Business',
    restaurant: 'Restaurant',
    salon: 'Salon & Spa',
    shop: 'Retail Shop',
    service: 'Service Business',
    generic: 'Business'
  };
  return names[type] || names.generic;
}

/**
 * Get list of business types for signup
 */
function getBusinessTypes() {
  return [
    { value: 'rental', label: 'Rental Business', examples: 'Boats, bikes, equipment' },
    { value: 'restaurant', label: 'Restaurant', examples: 'Restaurants, cafes, food trucks' },
    { value: 'salon', label: 'Salon & Spa', examples: 'Hair, nails, spa services' },
    { value: 'shop', label: 'Retail Shop', examples: 'Boutique, gift shop, online store' },
    { value: 'service', label: 'Service Business', examples: 'Cleaning, repair, consulting' }
  ];
}
