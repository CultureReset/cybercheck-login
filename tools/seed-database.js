#!/usr/bin/env node
// ============================================
// SEED DATABASE — Push all Beachside Circle Boats
// data into Supabase so nothing is hardwired
//
// USAGE:
//   cd /Users/owner/github-uploads/cybercheck-dashboard-platform
//   export SUPABASE_SERVICE_KEY="your-service-role-key"
//   node tools/seed-database.js
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mhafixflyffflwjhcgfn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('ERROR: Set SUPABASE_SERVICE_KEY env var first.');
  console.error('  export SUPABASE_SERVICE_KEY="your-service-role-key"');
  process.exit(1);
}

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
  'Prefer': 'return=representation'
};

async function supabasePost(table, data) {
  const url = SUPABASE_URL + '/rest/v1/' + table;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('  FAIL ' + table + ':', err);
    return null;
  }
  const result = await res.json();
  console.log('  OK ' + table + ' (' + (Array.isArray(result) ? result.length : 1) + ' rows)');
  return result;
}

// Check if data already exists
async function supabaseGet(table, query) {
  const url = SUPABASE_URL + '/rest/v1/' + table + '?' + query;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];
  return await res.json();
}

async function seed() {
  console.log('\n========================================');
  console.log('  SEEDING: Beachside Circle Boats');
  console.log('========================================\n');

  // ---- 1. Business record (let DB generate UUID) ----
  console.log('[1/12] Business...');

  // Check if already exists
  let existing = await supabaseGet('businesses', 'subdomain=eq.beachside-circle-boats&select=site_id');
  let SITE_ID;

  if (existing && existing.length > 0) {
    SITE_ID = existing[0].site_id;
    console.log('  Already exists, site_id: ' + SITE_ID);
  } else {
    const biz = await supabasePost('businesses', {
      name: 'Beachside Circle Boat Rentals and Sales LLC',
      type: 'rental',
      plan: 'pro',
      status: 'active',
      subdomain: 'beachside-circle-boats',
      domain: 'beachsidecircleboats.com'
    });
    if (!biz) { console.error('FATAL: Could not create business. Aborting.'); process.exit(1); }
    SITE_ID = Array.isArray(biz) ? biz[0].site_id : biz.site_id;
    console.log('  Created, site_id: ' + SITE_ID);
  }

  // ---- 2. Site content ----
  console.log('[2/12] Site content...');
  // Check if exists
  let existingContent = await supabaseGet('site_content', 'site_id=eq.' + SITE_ID + '&select=site_id');
  if (existingContent && existingContent.length > 0) {
    console.log('  Already exists, skipping');
  } else {
    await supabasePost('site_content', {
      site_id: SITE_ID,
      hero_text: 'Your Day on the Water Just Got an Upgrade',
      hero_subtext: 'Portable electric circle boats. No license needed.',
      contact_phone: '(601) 325-1205',
      contact_email: 'beachsideboats@myyahoo.com',
      about_text: 'Experience Orange Beach like never before! Portable inflatable circle boats powered by eco-friendly electric trolling motors. Compact, fun, and perfect for a day on the water. No license needed, no experience required.',
      address: '25856 Canal Road, Unit A',
      city: 'Orange Beach',
      state: 'AL',
      zip: '36561',
      hours: {
        monday:    { open: '08:00', close: '18:00', closed: false },
        tuesday:   { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday:  { open: '08:00', close: '18:00', closed: false },
        friday:    { open: '08:00', close: '18:00', closed: false },
        saturday:  { open: '08:00', close: '18:00', closed: false },
        sunday:    { open: '09:00', close: '17:00', closed: false }
      },
      social_links: {
        facebook: '', instagram: '', tiktok: '', yelp: '', google: '', twitter: ''
      },
      theme_color: '#00ada8',
      theme_font: 'Inter',
      seo_title: 'Beachside Circle Boats — Rentals in Orange Beach, AL',
      seo_description: 'Rent portable, eco-friendly circle boats in Orange Beach. No license needed. Half day, all day, and group rates available.'
    });
  }

  // ---- 3. Fleet types ----
  console.log('[3/12] Fleet types...');
  let existingFleet = await supabaseGet('fleet_types', 'site_id=eq.' + SITE_ID + '&select=id,name');
  let fleetTypes;
  if (existingFleet && existingFleet.length > 0) {
    fleetTypes = existingFleet;
    console.log('  Already exists (' + fleetTypes.length + ' types), skipping');
  } else {
    fleetTypes = await supabasePost('fleet_types', [
      {
        site_id: SITE_ID,
        name: 'Single Seater',
        description: 'Solo cruiser. 57 lbs, portable, 35lb electric motor. Fits one adult up to 300 lbs. 70" diameter.',
        specs: '70" diameter | 57 lbs | 35lb 5-speed electric motor | Up to 300 lbs capacity',
        sort_order: 1
      },
      {
        site_id: SITE_ID,
        name: 'Double Seater',
        description: 'Bring a friend. 65 lbs, extra-wide seats, enhanced stability. Fits two adults up to 450 lbs combined. 89" x 70".',
        specs: '89" x 70" | 65 lbs | 5-speed electric motor | Up to 450 lbs combined capacity',
        sort_order: 2
      }
    ]);
  }

  // ---- 4. Fleet items ----
  console.log('[4/12] Fleet items...');
  if (fleetTypes && fleetTypes.length >= 2) {
    let existingItems = await supabaseGet('fleet_items', 'site_id=eq.' + SITE_ID + '&select=id');
    if (existingItems && existingItems.length > 0) {
      console.log('  Already exists (' + existingItems.length + ' items), skipping');
    } else {
      const singleId = fleetTypes[0].id;
      const doubleId = fleetTypes[1].id;
      const items = [];
      for (let i = 1; i <= 5; i++) {
        items.push({ site_id: SITE_ID, fleet_type_id: singleId, unit_name: 'CB-0' + i, condition: 'good' });
      }
      for (let i = 1; i <= 3; i++) {
        items.push({ site_id: SITE_ID, fleet_type_id: doubleId, unit_name: 'CB-D' + i, condition: 'good' });
      }
      await supabasePost('fleet_items', items);
    }

    // ---- 5. Time slots ----
    console.log('[5/12] Time slots...');
    let existingSlots = await supabaseGet('rental_time_slots', 'site_id=eq.' + SITE_ID + '&select=id,name');
    let timeSlots;
    if (existingSlots && existingSlots.length > 0) {
      timeSlots = existingSlots;
      console.log('  Already exists (' + timeSlots.length + ' slots), skipping');
    } else {
      timeSlots = await supabasePost('rental_time_slots', [
        { site_id: SITE_ID, name: 'Half Day AM', start_time: '09:00', end_time: '13:00', sort_order: 1 },
        { site_id: SITE_ID, name: 'Half Day PM', start_time: '13:00', end_time: '17:00', sort_order: 2 },
        { site_id: SITE_ID, name: 'All Day', start_time: '09:00', end_time: '17:00', sort_order: 3 }
      ]);
    }

    // ---- 6. Pricing ----
    console.log('[6/12] Pricing...');
    let existingPricing = await supabaseGet('rental_pricing', 'site_id=eq.' + SITE_ID + '&select=id');
    if (existingPricing && existingPricing.length > 0) {
      console.log('  Already exists (' + existingPricing.length + ' prices), skipping');
    } else if (timeSlots && timeSlots.length >= 3) {
      const singleId = fleetTypes.find(f => f.name === 'Single Seater').id;
      const doubleId = fleetTypes.find(f => f.name === 'Double Seater').id;
      const amId = timeSlots.find(s => s.name === 'Half Day AM').id;
      const pmId = timeSlots.find(s => s.name === 'Half Day PM').id;
      const allId = timeSlots.find(s => s.name === 'All Day').id;

      await supabasePost('rental_pricing', [
        { site_id: SITE_ID, fleet_type_id: singleId, time_slot_id: amId, price: 150 },
        { site_id: SITE_ID, fleet_type_id: singleId, time_slot_id: pmId, price: 150 },
        { site_id: SITE_ID, fleet_type_id: singleId, time_slot_id: allId, price: 225 },
        { site_id: SITE_ID, fleet_type_id: doubleId, time_slot_id: amId, price: 200 },
        { site_id: SITE_ID, fleet_type_id: doubleId, time_slot_id: pmId, price: 200 },
        { site_id: SITE_ID, fleet_type_id: doubleId, time_slot_id: allId, price: 275 }
      ]);
    }
  } else {
    console.log('[5/12] Time slots... SKIPPED (no fleet types)');
    console.log('[6/12] Pricing... SKIPPED (no fleet types)');
  }

  // ---- 7. Add-ons ----
  console.log('[7/12] Add-ons...');
  let existingAddons = await supabaseGet('rental_addons', 'site_id=eq.' + SITE_ID + '&select=id');
  if (existingAddons && existingAddons.length > 0) {
    console.log('  Already exists (' + existingAddons.length + ' addons), skipping');
  } else {
    await supabasePost('rental_addons', [
      { site_id: SITE_ID, name: 'Mini Dock', description: '8\'4" x 44" platform for gear, yoga, sunbathing.', price: 50.00, category: 'dock', sort_order: 1 },
      { site_id: SITE_ID, name: 'X Dock', description: '5\' x 5\' floating dock, holds a 58-qt cooler.', price: 50.00, category: 'dock', sort_order: 2 },
      { site_id: SITE_ID, name: 'Doggie Dock', description: '5\'4" x 43" with weighted mesh ramp for pets.', price: 50.00, category: 'dock', sort_order: 3 }
    ]);
  }

  // ---- 8. Waiver (stored as a signed waiver template row) ----
  console.log('[8/12] Waivers...');
  let existingWaivers = await supabaseGet('waivers', 'site_id=eq.' + SITE_ID + '&select=id');
  if (existingWaivers && existingWaivers.length > 0) {
    console.log('  Already exists, skipping');
  } else {
    await supabasePost('waivers', {
      site_id: SITE_ID,
      customer_name: '_TEMPLATE_',
      customer_email: '_TEMPLATE_',
      waiver_text: 'CIRCLE BOAT RENTAL WAIVER AND RELEASE OF LIABILITY\n\nI, the undersigned, acknowledge that operating an inflatable circle boat involves inherent risks including but not limited to capsizing, falling overboard, and interaction with other watercraft.\n\nBy signing, I agree to:\n1. Wear a life jacket at all times while on the water\n2. Operate the circle boat in a safe manner within designated areas\n3. Not operate under the influence of alcohol or drugs\n4. Be financially responsible for damage to the vessel\n5. Follow all posted rules and staff instructions\n\nBeachside Circle Boat Rentals and Sales LLC is not liable for personal injury, property damage, or loss arising from the rental and use of circle boats.'
    });
  }

  // ---- 9. Site pages ----
  console.log('[9/12] Pages...');
  let existingPages = await supabaseGet('site_pages', 'site_id=eq.' + SITE_ID + '&select=id');
  if (existingPages && existingPages.length > 0) {
    console.log('  Already exists (' + existingPages.length + ' pages), skipping');
  } else {
    await supabasePost('site_pages', [
      { site_id: SITE_ID, title: 'Home', slug: '/', visible: true, sort_order: 1 },
      { site_id: SITE_ID, title: 'Fleet & Pricing', slug: '/fleet', visible: true, sort_order: 2 },
      { site_id: SITE_ID, title: 'Book Now', slug: '/book', visible: true, sort_order: 3 },
      { site_id: SITE_ID, title: 'Reviews', slug: '/reviews', visible: true, sort_order: 4 },
      { site_id: SITE_ID, title: 'Contact', slug: '/contact', visible: true, sort_order: 5 }
    ]);
  }

  // ---- 10. SEO meta tags ----
  console.log('[10/12] SEO...');
  let existingSeo = await supabaseGet('seo_meta_tags', 'site_id=eq.' + SITE_ID + '&select=id');
  if (existingSeo && existingSeo.length > 0) {
    console.log('  Already exists, skipping');
  } else {
    await supabasePost('seo_meta_tags', [
      { site_id: SITE_ID, page_slug: '/', page_title: 'Beachside Circle Boats — Orange Beach, AL', meta_description: 'Rent portable, eco-friendly circle boats in Orange Beach. No license needed.', og_title: 'Beachside Circle Boats', og_description: 'Your Day on the Water Just Got an Upgrade' },
      { site_id: SITE_ID, page_slug: '/book', page_title: 'Book a Circle Boat — Beachside Circle Boats', meta_description: 'Reserve your circle boat rental. Half day from $150, all day from $225.', og_title: 'Book a Circle Boat', og_description: 'Reserve your circle boat rental online.' }
    ]);
  }

  // ---- 11. Sitemap config ----
  console.log('[11/12] Sitemap...');
  let existingSitemap = await supabaseGet('sitemap_config', 'site_id=eq.' + SITE_ID + '&select=id');
  if (existingSitemap && existingSitemap.length > 0) {
    console.log('  Already exists, skipping');
  } else {
    await supabasePost('sitemap_config', {
      site_id: SITE_ID,
      auto_generate: true,
      include_pages: true,
      include_blog: false,
      change_frequency: 'weekly'
    });
  }

  // ---- 12. Robots config ----
  console.log('[12/12] Robots...');
  let existingRobots = await supabaseGet('robots_config', 'site_id=eq.' + SITE_ID + '&select=id');
  if (existingRobots && existingRobots.length > 0) {
    console.log('  Already exists, skipping');
  } else {
    await supabasePost('robots_config', {
      site_id: SITE_ID,
      robots_txt: 'User-agent: *\nAllow: /\nSitemap: https://beachsidecircleboats.com/sitemap.xml'
    });
  }

  console.log('\n========================================');
  console.log('  SEED COMPLETE — site_id: ' + SITE_ID);
  console.log('  All Beachside data is now in Supabase.');
  console.log('========================================\n');
}

seed().catch(function(err) {
  console.error('Seed failed:', err);
  process.exit(1);
});
