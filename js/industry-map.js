// js/industry-map.js
// The ONE normalization bridge between the three type vocabularies:
//   1. GCR DB:      entity.entity_type (restaurant|coffee|dessert|bakery|activity|
//                   service|shopping|hotel|condo|vacation-rental|park) +
//                   free-form entity_subtype (fishing_charter, dolphin_tours, …;
//                   ~309 active entities have NULL subtype → entity_type fallback)
//   2. Dashboard nav: data-biz-type buckets in app-dashboard.html
//                   (restaurant, bar, cafe, food_truck, boat_rental, charter,
//                   jet_ski_rental, kayak_rental, hotel, condo, vacation_rental,
//                   photographer, salon, spa, retail, service)
//   3. Presets:     apps/_presets.json ids (restaurant, charter, rental, salon,
//                   creator, lodging, fitness, photographer, service, shopping,
//                   park, blank)
// Without this map, DB values like "vacation-rental" (hyphen) or "coffee"
// never match a nav bucket and the sidebar renders blank.

(function () {
  function norm(s) {
    return String(s || '').toLowerCase().replace(/[\s-]+/g, '_');
  }

  // → the nav bucket passed to setupNavForType()
  function navType(entityType, entitySubtype) {
    const t = norm(entityType);
    const sub = norm(entitySubtype);

    if (['restaurant', 'coffee', 'dessert', 'bakery', 'bar', 'cafe', 'food_truck'].includes(t)) return 'restaurant';
    if (t === 'hotel') return 'hotel';
    if (t === 'condo') return 'condo';
    if (t === 'vacation_rental') return 'vacation_rental';
    if (t === 'shopping' || t === 'retail') return 'retail';
    if (t === 'activity') {
      if (/boat_rental|jet_?ski|kayak|paddle|bike|golf_cart|scooter/.test(sub)) return 'boat_rental';
      // charters, dolphin cruises, tours, parasail, excursions all use the
      // charter booking shape (slots + per-person tiers)
      return 'charter';
    }
    if (t === 'service') {
      if (/salon|barber|hair|nail/.test(sub)) return 'salon';
      if (/spa|massage|wellness/.test(sub)) return 'spa';
      if (/photo/.test(sub)) return 'photographer';
      return 'service';
    }
    // parks get the generic service bucket until park-specific dashboard
    // sections (facilities/rules/access) ship
    if (t === 'park') return 'service';
    return 'service';
  }

  // → the _presets.json preset id, for guided setup / auto-provisioning
  function presetId(entityType, entitySubtype) {
    const t = norm(entityType);
    const sub = norm(entitySubtype);

    if (['restaurant', 'coffee', 'dessert', 'bakery', 'bar', 'cafe', 'food_truck'].includes(t)) return 'restaurant';
    if (['hotel', 'condo', 'vacation_rental'].includes(t)) return 'lodging';
    if (t === 'shopping' || t === 'retail') return 'shopping';
    if (t === 'park') return 'park';
    if (t === 'activity') {
      if (/boat_rental|jet_?ski|kayak|paddle|bike|golf_cart|scooter/.test(sub)) return 'rental';
      return 'charter'; // the "Charter / Tours" preset covers charters, cruises, tours
    }
    if (t === 'service') {
      if (/salon|barber|hair|nail|spa|massage|wellness/.test(sub)) return 'salon';
      if (/photo/.test(sub)) return 'photographer';
      if (/gym|fitness|yoga|pilates|class/.test(sub)) return 'fitness';
      if (/artist|musician|band|dj/.test(sub)) return 'creator';
      return 'service';
    }
    return 'blank';
  }

  window.CC_INDUSTRY = { navType: navType, presetId: presetId, norm: norm };
})();
