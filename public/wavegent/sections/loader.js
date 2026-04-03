/* ============================================================
   aWavegent — Section Loader
   Registers and mounts modular sections from JSON config.
   Usage:
     <div id="app"></div>
     <script src="sections/loader.js"></script>
     <script>
       fetch('./data.json').then(r => r.json()).then(config => {
         aWavegent.mount(config, document.getElementById('app'));
       });
     </script>
   ============================================================ */

(function(global) {
  'use strict';

  const _registry = {};

  /** Register a section type */
  function register(type, renderFn) {
    _registry[type] = renderFn;
  }

  /** Mount all sections from config into a container element */
  function mount(config, container) {
    if (!container) { console.error('aWavegent: container not found'); return; }

    // Apply theme CSS variables
    if (config.theme) {
      const r = document.documentElement.style;
      if (config.theme.accent)   r.setProperty('--accent', config.theme.accent);
      if (config.theme.bg)       r.setProperty('--bg', config.theme.bg);
      if (config.theme.text)     r.setProperty('--text', config.theme.text);
      if (config.theme.font)     r.setProperty('--font', config.theme.font);
    }

    // Set page title
    if (config.business && config.business.name) {
      document.title = config.business.name + ' — aWavegent';
    }

    // Render each section in order
    const sections = config.sections || [];
    sections.forEach((sectionDef, i) => {
      const { type, ...sectionConfig } = sectionDef;
      const renderFn = _registry[type];
      if (!renderFn) {
        console.warn('aWavegent: unknown section type "' + type + '"');
        return;
      }
      const wrapper = document.createElement('div');
      wrapper.className = 'wg-section wg-section--' + type;
      wrapper.setAttribute('data-section', type);
      wrapper.setAttribute('data-index', i);
      try {
        const html = renderFn(config, sectionConfig);
        wrapper.innerHTML = html;
      } catch(e) {
        console.error('aWavegent: error rendering section "' + type + '":', e);
      }
      container.appendChild(wrapper);
    });

    // After all sections rendered, initialize any interactive JS
    _initInteractions(container, config);
  }

  /** Wire up all modal open/close, booking steps, etc. after render */
  function _initInteractions(container, config) {
    // Modal open/close
    container.addEventListener('click', function(e) {
      const opener = e.target.closest('[data-modal-open]');
      if (opener) {
        const id = opener.getAttribute('data-modal-open');
        const modal = document.getElementById(id);
        if (modal) { modal.classList.add('wg-modal--open'); document.body.style.overflow = 'hidden'; }
      }
      const closer = e.target.closest('[data-modal-close], .wg-modal__overlay');
      if (closer) {
        const modal = closer.closest('.wg-modal');
        if (modal) { modal.classList.remove('wg-modal--open'); document.body.style.overflow = ''; }
      }
    });

    // Escape key closes modals
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.wg-modal--open').forEach(m => {
          m.classList.remove('wg-modal--open');
          document.body.style.overflow = '';
        });
      }
    });
  }

  /** Utility: escape HTML */
  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /** Utility: render star rating */
  function stars(rating, max) {
    max = max || 5;
    let out = '';
    for (let i = 1; i <= max; i++) {
      out += i <= Math.round(rating) ? '★' : '☆';
    }
    return '<span class="wg-stars">' + out + '</span>';
  }

  /** Utility: check if currently within a time window */
  function isNowBetween(startHHMM, endHHMM) {
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = startHHMM.split(':').map(Number);
    const [eh, em] = endHHMM.split(':').map(Number);
    return cur >= (sh * 60 + sm) && cur < (eh * 60 + em);
  }

  /** Utility: get day name */
  function todayKey() {
    return ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()];
  }

  // Expose public API
  global.aWavegent = { register, mount, esc, stars, isNowBetween, todayKey };

})(window);
