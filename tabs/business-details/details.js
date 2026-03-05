/**
 * Business Details - Shared Logic
 * Auto-sync, save helpers, detail type routing
 */

(function() {
    let cc = null;
    let saveTimeout = null;

    // Initialize - get CyberCheck shared data reference
    function initDetails() {
        cc = getCyberCheck();
        if (!cc) {
            console.warn('Details: CyberCheck shared data not available');
            return null;
        }

        // Listen for data updates from other tabs/iframes
        window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'data_updated') {
                if (typeof onDataUpdated === 'function') {
                    onDataUpdated();
                }
            }
        });

        return cc;
    }

    // Save a field and show indicator
    function saveField(path, value) {
        if (!cc) return;
        cc.set(path, value);
        showSaved();
    }

    // Get a field value
    function getField(path) {
        if (!cc) return undefined;
        return cc.get(path);
    }

    // Get current business type
    function getBusinessType() {
        if (!cc) return 'bakery';
        return cc.get('business.type') || 'bakery';
    }

    // Check if a tool is OAuth connected
    function isConnected(platform) {
        if (!cc) return false;
        return cc.get('connected_tools.' + platform + '.connected') || false;
    }

    // Get connection info for a platform
    function getConnectionInfo(platform) {
        if (!cc) return {};
        return cc.get('connected_tools.' + platform) || {};
    }

    // Toggle OAuth connection (placeholder - real OAuth in production)
    function toggleConnection(platform) {
        if (!cc) return;
        const current = isConnected(platform);
        cc.set('connected_tools.' + platform + '.connected', !current);
        if (!current) {
            // Mock: set a handle/page name when "connecting"
            const mockHandles = {
                instagram: { handle: '@' + cc.get('business.id') },
                facebook: { page: cc.get('business.name') },
                google_business: { name: cc.get('business.name') },
                tiktok: { handle: '@' + cc.get('business.id') },
                twitter: { handle: '@' + cc.get('business.id') }
            };
            const mock = mockHandles[platform] || {};
            for (const key in mock) {
                cc.set('connected_tools.' + platform + '.' + key, mock[key]);
            }
        }
        showSaved();
    }

    // Show "Saved" indicator
    function showSaved() {
        const el = document.getElementById('save-indicator');
        if (!el) return;
        el.classList.add('show');
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(function() {
            el.classList.remove('show');
        }, 1500);
    }

    // Debounced save for text inputs
    function debouncedSave(path, value, delay) {
        clearTimeout(window['_debounce_' + path]);
        window['_debounce_' + path] = setTimeout(function() {
            saveField(path, value);
        }, delay || 300);
    }

    // Toggle card expand/collapse
    function toggleCard(cardId) {
        const body = document.getElementById(cardId + '-body');
        const chevron = document.getElementById(cardId + '-chevron');
        if (!body) return;
        const isOpen = body.classList.contains('open');
        body.classList.toggle('open');
        if (chevron) chevron.classList.toggle('open');
    }

    // Render OAuth status badge
    function renderOAuthBadge(platform) {
        const connected = isConnected(platform);
        const info = getConnectionInfo(platform);
        if (connected) {
            const handle = info.handle || info.page || info.name || 'Connected';
            return '<span class="oauth-badge connected">Connected</span>';
        }
        return '<span class="oauth-badge disconnected" onclick="Details.toggleConnection(\'' + platform + '\'); location.reload();">Connect</span>';
    }

    // Business types that show team editor
    function showsTeam() {
        const type = getBusinessType();
        return ['salon', 'medical', 'fitness', 'trades'].includes(type);
    }

    // Get CyberCheck helper (works in iframe or direct)
    function getCyberCheck() {
        if (window.CyberCheck) return window.CyberCheck;
        if (window.parent && window.parent.CyberCheck) return window.parent.CyberCheck;
        return null;
    }

    // Expose public API
    window.Details = {
        init: initDetails,
        save: saveField,
        get: getField,
        debouncedSave: debouncedSave,
        getBusinessType: getBusinessType,
        isConnected: isConnected,
        getConnectionInfo: getConnectionInfo,
        toggleConnection: toggleConnection,
        toggleCard: toggleCard,
        renderOAuthBadge: renderOAuthBadge,
        showsTeam: showsTeam,
        showSaved: showSaved
    };
})();
