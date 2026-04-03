/* aWavegent — Links Section
   Renders tappable link buttons that open modals or URLs.
   Config: links[] each with { icon, label, sub, action }
   action = "modal:modal-id" or "url:https://..." */

aWavegent.register('links', function(config) {
  const links = config.links || [];
  if (!links.length) return '';

  const items = links.map(l => {
    const isModal = l.action && l.action.startsWith('modal:');
    const isUrl   = l.action && l.action.startsWith('url:');
    let attrs = '';
    if (isModal) attrs = `data-modal-open="${l.action.replace('modal:','')}" role="button" tabindex="0"`;
    if (isUrl)   attrs = `href="${aWavegent.esc(l.action.replace('url:',''))}" target="_blank"`;

    const Tag = isUrl ? 'a' : 'div';
    return `
      <${Tag} class="wg-link-item" ${attrs}>
        <span class="wg-link-icon">${l.icon || '🔗'}</span>
        <div class="wg-link-text">
          <div class="wg-link-title">${aWavegent.esc(l.label)}</div>
          ${l.sub ? `<div class="wg-link-sub">${aWavegent.esc(l.sub)}</div>` : ''}
        </div>
        <span class="wg-link-arrow">›</span>
      </${Tag}>`;
  });

  return `<div class="wg-links-list">${items.join('')}</div>`;
});
