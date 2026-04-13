const API_BASE = 'https://cybercheck-api-database.vercel.app';

// Simple time converter HH:MM:SS → 12h format
function to12h(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const isAM = h < 12;
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${isAM ? 'AM' : 'PM'}`;
}

// Build CONFIG from GCR data
function buildConfig(entity, data = {}) {
  const business = {
    name: entity.name,
    tagline: entity.subtitle || '',
    avatar_url: entity.hero_image_url || '',
    phone: entity.phone || '',
    rating: entity.rating || 0,
    review_count: entity.review_count || 0,
    directions_url: entity.directions_url || '',
    address: entity.address_line_1 || '',
  };

  // Socials
  const socials = [];
  if (entity.social_instagram) socials.push({ platform: 'instagram', url: entity.social_instagram });
  if (entity.social_facebook) socials.push({ platform: 'facebook', url: entity.social_facebook });
  if (entity.social_tiktok) socials.push({ platform: 'tiktok', url: entity.social_tiktok });

  // Hours - convert array to keyed object
  const hours = {};
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  if (data.hours && Array.isArray(data.hours)) {
    data.hours.forEach(h => {
      const day = dayNames[h.day_of_week] || dayNames[0];
      hours[day] = {
        open: h.open_time ? to12h(h.open_time) : '—',
        close: h.close_time ? to12h(h.close_time) : '—',
        closed: h.is_closed || false,
      };
    });
  }

  // Gallery - rename image_url to url
  const gallery = [];
  if (data.photos && Array.isArray(data.photos)) {
    data.photos.forEach(p => {
      gallery.push({ url: p.image_url, caption: p.caption || '' });
    });
  }

  // Reviews - rename fields
  const reviews = [];
  if (data.reviews && Array.isArray(data.reviews)) {
    data.reviews.slice(0, 5).forEach(r => {
      reviews.push({
        name: r.author_name || 'Guest',
        rating: r.rating || 5,
        text: r.review_text || '',
        date: r.review_date || '',
        visit_detail: r.visit_detail || '',
      });
    });
  }

  // Menu - group items by section
  const menu = { categories: [] };
  if (data.menu && data.menu.sections && data.menu.items) {
    data.menu.sections.forEach(section => {
      const items = data.menu.items
        .filter(i => i.menu_section_id === section.id)
        .map(i => ({
          name: i.item_name || '',
          description: i.item_description || '',
          price: i.price_numeric || i.price_text || '',
        }));
      if (items.length > 0) {
        menu.categories.push({ name: section.name || '', items });
      }
    });
  }

  // Specials - happy hour
  const specials = {};
  if (entity.hh_start || entity.hh_end) {
    specials.happy_hour = {
      start: entity.hh_start || '',
      end: entity.hh_end || '',
      description: entity.hh_description || '',
    };
  }

  // Build sections array based on what data exists
  const sections = [{ type: 'profile' }];
  if (socials.length > 0) sections.push({ type: 'social-icons' });
  if (Object.keys(specials).length > 0) sections.push({ type: 'specials-banner' });
  sections.push({ type: 'links' });
  if (menu.categories.length > 0) sections.push({ type: 'menu-images', label: '📋 Menu', sub: 'Full menu' });
  if (reviews.length > 0) sections.push({ type: 'reviews-verified' });
  if (gallery.length > 0) sections.push({ type: 'gallery-grid' });
  if (Object.keys(hours).length > 0) sections.push({ type: 'hours' });

  // Default links if none provided
  const links = [
    { icon: '📸', label: 'Photos', sub: 'Gallery', action: 'modal:modal-gallery-grid' },
    { icon: '⭐', label: 'Reviews', sub: 'See what people say', action: 'modal:modal-reviews-verified' },
    { icon: '🕐', label: 'Hours', sub: 'Open now?', action: 'modal:modal-hours' },
  ];

  return {
    theme: { accent: '#00ada8', bg: '#ffffff' },
    business,
    socials,
    specials,
    links,
    reviews,
    gallery,
    hours,
    menu: menu.categories.length > 0 ? menu : undefined,
    sections,
  };
}

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug required' });
  }

  try {
    // Fetch entity data from GCR API
    const entityRes = await fetch(`${API_BASE}/api/gcr/entity/${slug}`);
    if (!entityRes.ok) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    const entityData = await entityRes.json();
    const entity = entityData.entity || entityData;

    // Build CONFIG
    const config = buildConfig(entity, entityData);

    // Return HTML page with CONFIG embedded
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${entity.name || 'Business Page'}</title>
  <link rel="stylesheet" href="/wavegent/base.css">
  <script src="/wavegent/sections/loader.js"><\/script>
  <script src="/wavegent/sections/profile.js"><\/script>
  <script src="/wavegent/sections/social-icons.js"><\/script>
  <script src="/wavegent/sections/specials-banner.js"><\/script>
  <script src="/wavegent/sections/links.js"><\/script>
  <script src="/wavegent/sections/booking-charter.js"><\/script>
  <script src="/wavegent/sections/booking-reservation.js"><\/script>
  <script src="/wavegent/sections/menu-text.js"><\/script>
  <script src="/wavegent/sections/menu-images.js"><\/script>
  <script src="/wavegent/sections/reviews-verified.js"><\/script>
  <script src="/wavegent/sections/gallery-grid.js"><\/script>
  <script src="/wavegent/sections/hours.js"><\/script>
</head>
<body>
  <div class="wg-container" id="app"></div>
  <div class="wg-footer">Powered by <a href="#" target="_blank">CyberCheck</a></div>
  <script>
    var CONFIG = ${JSON.stringify(config)};
    aWavegent.mount(CONFIG, document.getElementById('app'));
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.send(html);
  } catch (err) {
    console.error('Wavegent error:', err);
    return res.status(500).json({ error: err.message });
  }
}
