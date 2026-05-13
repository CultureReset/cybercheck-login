// CyberCheck Platform — Multi-tenant config
// Loads from URL parameter first, then from session

const USER_CONFIG = {
    user_id: '',
    user_name: '',
    user_email: '',
    business_id: '',
    business_name: '',
    business_type: '',
    installed_apps: [],
    connected_tools: [],
    plan: 'free',
    plan_price: 0,
    features: {},
    notifications: { email: true, sms: true, in_app: true },
    _fromApi: false
};

// Known business mappings (subdomain → site_id)
const BUSINESS_MAP = {
    'beachside-circle-boats': '22222222-2222-2222-2222-222222222222'
};

async function initConfig() {
    // Priority 1: Check URL parameter for explicit business selection
    const params = new URLSearchParams(window.location.search);
    const userSubdomain = params.get('user');

    if (userSubdomain && BUSINESS_MAP[userSubdomain]) {
        const siteId = BUSINESS_MAP[userSubdomain];
        USER_CONFIG.business_id = siteId;
        USER_CONFIG._fromApi = true;

        // Try to get business data from Supabase
        if (window.supabase) {
            try {
                const { data: biz } = await window.supabase
                    .from('businesses')
                    .select('site_id, name, type')
                    .eq('site_id', siteId)
                    .single();

                if (biz) {
                    USER_CONFIG.business_name = biz.name;
                    USER_CONFIG.business_type = biz.type || 'rental';
                }
            } catch(e) {
                console.warn('Failed to load business details:', e);
                USER_CONFIG.business_name = userSubdomain.replace(/-/g, ' ');
                USER_CONFIG.business_type = 'rental';
            }
        }

        const sidebarName = document.getElementById('sidebar-biz-name');
        if (sidebarName) sidebarName.textContent = USER_CONFIG.business_name;

        const sidebarType = document.getElementById('sidebar-biz-type');
        if (sidebarType) sidebarType.textContent = USER_CONFIG.business_type.charAt(0).toUpperCase() + USER_CONFIG.business_type.slice(1);

        syncToSharedStore();
        console.log(`CC: Loaded business from URL: ${USER_CONFIG.business_name} (ID: ${USER_CONFIG.business_id})`);
        return USER_CONFIG;
    }

    // Priority 2: Load from session
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
    if (session.business) {
        USER_CONFIG.business_id = session.business.site_id;
        USER_CONFIG.business_name = session.business.name;
        USER_CONFIG.business_type = session.business.type;
        USER_CONFIG.plan = session.business.plan || 'free';
    }
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
