// Beachside Circle Boats Dashboard - Configuration
//
// Real customer data. When the API is connected, this gets
// overwritten with live data from the session endpoint.
// When offline, this is the fallback so the dashboard still works.

const USER_CONFIG = {
    user_id: 'user_beachside_001',
    user_name: 'Beachside Owner',
    user_email: 'beachsideboats@myyahoo.com',

    business_id: 'beachside-circle-boats',
    business_name: 'Beachside Circle Boat Rentals and Sales LLC',
    business_type: 'rental',

    installed_apps: [
        'booking',
        'sms',
        'loyalty'
    ],

    connected_tools: [
        'stripe',
        'square',
        'google-calendar',
        'gmail',
        'instagram',
        'facebook',
        'twilio'
    ],

    plan: 'professional',
    plan_price: 49.99,

    features: {
        voice_ai: true,
        workflows: true,
        landing_page: true,
        custom_domain: true,
        white_label: false,
        api_access: true,
        webhooks: true
    },

    notifications: {
        email: true,
        sms: true,
        in_app: true
    },

    // Flag: did we load from the API?
    _fromApi: false
};

// Try to load live session from backend API
// If it works, overwrite USER_CONFIG with real data
// If not, Beachside's hardcoded data stays as-is
async function initConfig() {
    const session = await CC.getSession();
    if (!session || !session.user) {
        console.log('CC: Using offline config (Beachside fallback)');
        syncToSharedStore();
        return USER_CONFIG;
    }

    // Overwrite with live data
    USER_CONFIG.user_id = session.user.id;
    USER_CONFIG.user_name = session.user.name;
    USER_CONFIG.user_email = session.user.email;
    USER_CONFIG.business_id = session.business.site_id;
    USER_CONFIG.business_name = session.business.name;
    USER_CONFIG.business_type = session.business.type;
    USER_CONFIG.plan = session.business.plan || 'free';
    USER_CONFIG._fromApi = true;

    // Update sidebar with real business name
    const sidebarName = document.getElementById('sidebar-biz-name');
    if (sidebarName) sidebarName.textContent = USER_CONFIG.business_name;

    const sidebarType = document.getElementById('sidebar-biz-type');
    if (sidebarType) sidebarType.textContent = USER_CONFIG.business_type.charAt(0).toUpperCase() + USER_CONFIG.business_type.slice(1);

    syncToSharedStore();
    console.log(`CC: Loaded session for ${USER_CONFIG.business_name}`);
    return USER_CONFIG;
}

// Push USER_CONFIG into CyberCheck shared data store
// so all tabs/apps read from the same source
function syncToSharedStore() {
    if (!window.CyberCheck) return;
    CyberCheck.set('business.name', USER_CONFIG.business_name);
    CyberCheck.set('business.type', USER_CONFIG.business_type);
    CyberCheck.set('business.id', USER_CONFIG.business_id);
    CyberCheck.set('user.name', USER_CONFIG.user_name);
    CyberCheck.set('user.email', USER_CONFIG.user_email);
    CyberCheck.set('user.id', USER_CONFIG.user_id);
}
