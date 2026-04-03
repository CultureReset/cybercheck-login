/* aWavegent — Social Icons Section */
const _socialSvgs = {
  instagram: '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  facebook:  '<svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
  tiktok:    '<svg viewBox="0 0 24 24"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg>',
  youtube:   '<svg viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96C1 8.12 1 12 1 12s0 3.88.46 5.58a2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95C23 15.88 23 12 23 12s0-3.88-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" stroke="none"/></svg>',
  twitter:   '<svg viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>',
  whatsapp:  '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
};

aWavegent.register('social-icons', function(config) {
  const socials = config.socials || [];
  if (!socials.length) return '';
  const icons = socials.map(s => {
    const svg = _socialSvgs[s.platform] || '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
    return `<a href="${aWavegent.esc(s.url)}" class="wg-social-icon" target="_blank" aria-label="${aWavegent.esc(s.platform)}">${svg}</a>`;
  }).join('');
  return `<div class="wg-socials">${icons}</div>`;
});
