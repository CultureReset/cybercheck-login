/* ============================================================
   CYBERCHECK SALES SITE — VERTICAL CONFIG
   ============================================================
   Single source of truth for every industry sales page.

   index.html renders the grid from this list. Each file under
   /industries/ is a thin shell that sets window.CC_VERTICAL to
   one of these ids — the page itself is rendered by
   js/sales-page.js. Adding an industry is one entry here plus a
   4-line HTML shell; nothing else changes.

   Every form on every page posts to the same endpoint with its
   own `source`, so the admin dashboard's Sales Leads panel can
   filter by which page produced the lead.
   ============================================================ */

window.CC_LEAD_ENDPOINT = '/api/gcr/sales-lead';

window.CC_VERTICALS = [
  {
    id: 'restaurants',
    name: 'Restaurants & Bars',
    short: 'Restaurants',
    emoji: '🍽️',
    accent: '#ff7a1a',
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'For restaurants, bars & breweries',
    headline: 'Your menu changes daily. Your website doesn’t.',
    sub: 'Update a special from your phone and it changes everywhere at once — QR menu, your page, Gulf Coast Radar, and the AI that answers customer questions.',
    pains: [
      'Printed QR menus go stale the day a price changes',
      'Specials and live music live on Facebook and nowhere else',
      'Reviews come from people who never actually ate there',
      'No idea which items customers look at and skip'
    ],
    gets: [
      ['Live QR Menu', 'Sections, photos, prices, sold-out toggles — updated from your phone in seconds.'],
      ['Daily Specials & Happy Hour', 'Schedule by day and time. They appear and disappear on their own.'],
      ['Events & Live Music', 'Post the lineup once. Artists get their own page customers can tap into.'],
      ['Table Reservations', 'Take bookings or send people to the system you already use.'],
      ['Verified Reviews', 'Review requests tied to a real visit, not a blind prompt.'],
      ['Loyalty & Perks', 'Turn a first visit into a second one.']
    ],
    links: [
      ['📅', 'Reserve a Table', 'Book a time or join the waitlist'],
      ['🍽️', 'Full Menu', 'Food, drinks, and today’s specials'],
      ['🔥', 'Happy Hour', 'What’s running right now'],
      ['🎵', 'Live Music', 'Who’s playing tonight'],
      ['⭐', 'Verified Reviews', 'From people who actually ate here'],
      ['📍', 'Hours & Directions', 'Find us and when we’re open']
    ],
    interests: ['QR menu & daily updates', 'Table reservations', 'Verified reviews', 'Loyalty & repeat visits', 'Events & live music', 'Everything']
  },

  {
    id: 'charters',
    name: 'Fishing Charters',
    short: 'Charters',
    emoji: '🎣',
    accent: '#13c7b7',
    hero: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'For charter captains & guides',
    headline: 'Stop answering the same five questions by text.',
    sub: 'Trips, rates, what’s included, what to bring, open dates, deposits, and waivers — in one place customers can read before they call.',
    pains: [
      'Every booking starts with the same texts about price and dates',
      'Deposits chased by hand, no-shows eat the day',
      'Weather calls mean re-texting everybody individually',
      'Bookings from FareHarbor, phone, and Facebook never line up'
    ],
    gets: [
      ['Trip Packages', 'Half day, full day, nearshore, offshore — with real prices and party limits.'],
      ['Live Availability', 'Open dates and slots, with blackout days you control.'],
      ['Deposits & Payments', 'Take a deposit to hold the date and cut no-shows.'],
      ['Digital Waivers', 'Signed before they show up at the dock.'],
      ['Platform Sync', 'Forward your FareHarbor or booking emails — the calendar updates itself.'],
      ['Reminders & Reviews', 'Day-before reminders, review request after the trip.']
    ],
    links: [
      ['📅', 'Check Open Dates', 'Live availability and time slots'],
      ['🎣', 'Trips & Rates', 'Half day, full day, and offshore'],
      ['🧾', 'What’s Included', 'Gear, bait, licenses, and what to bring'],
      ['📍', 'Where to Meet Us', 'Dock location, parking, and directions'],
      ['⭐', 'Verified Reviews', 'Real trips, real customers'],
      ['🌤️', 'Weather Policy', 'What happens if we can’t run']
    ],
    interests: ['Online booking & deposits', 'Live availability calendar', 'Digital waivers', 'Sync my existing booking platform', 'Reviews & follow-up', 'Everything']
  },

  {
    id: 'rentals',
    name: 'Boat & Watersport Rentals',
    short: 'Rentals',
    emoji: '🚤',
    accent: '#0ea5e9',
    hero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'For boat, jet ski & gear rentals',
    headline: 'List what people actually want to rent — not just your company name.',
    sub: 'Every pontoon, jet ski, cart, and board with its own photo, rate, and live availability. Customers pick the unit, not a phone number.',
    pains: [
      'Directories list your business but none of your inventory',
      'Customers call to ask what’s available today',
      'Double-bookings when two people want the same unit',
      'Add-ons and deposits handled on paper'
    ],
    gets: [
      ['Fleet & Inventory', 'Each unit with photos, capacity, and its own hourly or daily rate.'],
      ['Live Availability', 'Per-unit calendar so the same boat can’t go out twice.'],
      ['Add-ons & Extras', 'Tubes, coolers, delivery, fuel — priced per booking, day, or person.'],
      ['Deposits & Waivers', 'Hold the reservation and get the waiver signed up front.'],
      ['Pickup & Marina Info', 'Directions, parking, dock instructions, what to bring.'],
      ['Return Reminders', 'Automatic texts before pickup and before return.']
    ],
    links: [
      ['🗓️', 'Live Availability', 'Open dates, slots, and durations'],
      ['💲', 'Rates & Packages', 'Hourly, half day, full day, sunset'],
      ['🧭', 'Our Fleet', 'Compare pontoons, deck boats, and skis'],
      ['📍', 'Pickup & Marina Map', 'Directions, parking, dock details'],
      ['🧾', 'What’s Included', 'Safety gear, fuel policy, what to bring'],
      ['🌤️', 'Weather & Cancellation', 'Know what happens if it turns']
    ],
    interests: ['Inventory listings', 'Live availability per unit', 'Deposits & waivers', 'Add-ons and extras', 'Reviews & follow-up', 'Everything']
  },

  {
    id: 'lodging',
    name: 'Condos & Vacation Rentals',
    short: 'Lodging',
    emoji: '🏖️',
    accent: '#8b5cf6',
    hero: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'For condo owners & property managers',
    headline: 'Keep your Airbnb listing. Own the guest relationship.',
    sub: 'One page per unit with everything a guest asks — check-in, wifi, parking, local recommendations — and a calendar that stays in sync with the platforms you already list on.',
    pains: [
      'Same check-in questions from every single guest',
      'Calendars on three platforms that drift out of sync',
      'Guests book through a platform you never hear from again',
      'Local recommendations retyped into every message'
    ],
    gets: [
      ['Properties & Units', 'Each unit with photos, sleeping arrangements, and amenities.'],
      ['Calendar Sync', 'Import iCal from Airbnb and VRBO, or forward the confirmation emails.'],
      ['Guest Info Page', 'Check-in, wifi, parking, rules, and what’s nearby — one link.'],
      ['Direct Booking', 'Take direct reservations with a deposit when you want to.'],
      ['Local Recommendations', 'Restaurants, charters, and activities pulled from Gulf Coast Radar.'],
      ['Reviews & Rebooking', 'Ask after checkout, invite them back next season.']
    ],
    links: [
      ['📅', 'Check Availability', 'Open dates across every unit'],
      ['🏠', 'Our Units', 'Photos, layouts, and what sleeps how many'],
      ['🔑', 'Check-In Info', 'Codes, parking, wifi, and house rules'],
      ['📍', 'Getting Here', 'Directions, building access, and parking'],
      ['🍴', 'What’s Nearby', 'Places we actually recommend'],
      ['⭐', 'Guest Reviews', 'From people who actually stayed']
    ],
    interests: ['Direct booking', 'Calendar sync with Airbnb/VRBO', 'Guest info page', 'Local recommendations', 'Reviews & rebooking', 'Everything']
  },

  {
    id: 'salons',
    name: 'Salons, Spas & Barbers',
    short: 'Salons',
    emoji: '✂️',
    accent: '#ec4899',
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'For stylists, barbers & spas',
    headline: 'Let clients book the service, the stylist, and the time.',
    sub: 'Your full service menu with real prices and durations, per-stylist availability, and reminders that cut no-shows — without changing how you already work.',
    pains: [
      'DMs and texts at all hours asking about pricing',
      'No-shows that leave an hour of the day empty',
      'Clients don’t know which stylist does what',
      'Rebooking depends on remembering to ask'
    ],
    gets: [
      ['Service Menu', 'Every service with price, duration, and description.'],
      ['Staff & Schedules', 'Per-stylist availability so clients book the right person.'],
      ['Appointment Booking', 'Instant book or request-first — your call.'],
      ['Reminders', 'Day-before texts that cut no-shows.'],
      ['Portfolio Gallery', 'Before-and-after work that sells the next appointment.'],
      ['Loyalty & Rebooking', 'Perks for regulars, nudges for the ones who drift.']
    ],
    links: [
      ['📅', 'Book an Appointment', 'Pick a service, stylist, and time'],
      ['💇', 'Services & Pricing', 'What we do and what it costs'],
      ['👥', 'Meet the Team', 'Who does what, and their work'],
      ['📸', 'Portfolio', 'Recent cuts, color, and styles'],
      ['⭐', 'Verified Reviews', 'From real appointments'],
      ['📍', 'Hours & Location', 'Where to find us']
    ],
    interests: ['Appointment booking', 'Service menu & pricing', 'Staff schedules', 'Reminders & no-show reduction', 'Loyalty & rebooking', 'Everything']
  },

  {
    id: 'home-services',
    name: 'HVAC, Plumbing & Electrical',
    short: 'Home Services',
    emoji: '🔧',
    accent: '#1eaf74',
    hero: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'For trades & home service businesses',
    headline: 'Stop losing the job because nobody answered the phone.',
    sub: 'One link that takes service calls, quote requests, and emergency dispatch — so the lead is captured even when your crew is under a house.',
    pains: [
      'Missed calls during a job are lost jobs',
      'Quote requests scattered across voicemail, text, and Facebook',
      'No easy way to show finished work to the next customer',
      'Emergency calls handled the same as routine ones'
    ],
    gets: [
      ['Service Scheduling', 'Customers pick a service window instead of playing phone tag.'],
      ['Quote Requests', 'Structured intake — what, where, when, photos.'],
      ['Emergency Routing', 'Urgent requests flagged and separated from routine ones.'],
      ['Project Gallery', 'Before-and-after photos that close the next estimate.'],
      ['Service Area & Hours', 'Where you work and when, so you stop fielding out-of-range calls.'],
      ['Verified Reviews', 'Tied to completed jobs, not anonymous ratings.']
    ],
    links: [
      ['📅', 'Schedule Service', 'Book a visit or service window'],
      ['🚨', 'Emergency Help', 'Urgent, after-hours, and no-heat calls'],
      ['🔩', 'Services & Repairs', 'Everything we handle'],
      ['💲', 'Quotes & Estimates', 'Get pricing for a job or upgrade'],
      ['📸', 'Project Gallery', 'Finished work and before/afters'],
      ['📍', 'Service Area & Hours', 'Where we work and when']
    ],
    interests: ['Service scheduling', 'Quote requests', 'Emergency call routing', 'Project photo gallery', 'Reviews & follow-up', 'Everything']
  },

  {
    id: 'activities',
    name: 'Tours & Activities',
    short: 'Activities',
    emoji: '🐬',
    accent: '#f59e0b',
    hero: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'For tours, cruises & attractions',
    headline: 'Sell the seats you have left today.',
    sub: 'Live capacity per departure, ticketing, waivers, and a last-minute channel that fills the empty spots instead of running the trip half full.',
    pains: [
      'Empty seats on a trip that still costs the same to run',
      'Walk-ups asking what time the next one leaves',
      'Waivers signed on a clipboard at the dock',
      'No way to tell tourists you have space right now'
    ],
    gets: [
      ['Departures & Capacity', 'Each time slot with real seats-remaining counts.'],
      ['Ticketing', 'Adult, child, and group pricing that adds up correctly.'],
      ['Digital Waivers', 'Signed before arrival, stored against the booking.'],
      ['Last-Minute Availability', 'Open spots surface to tourists nearby, today.'],
      ['Check-In', 'Know who showed and who didn’t.'],
      ['Reviews & Photos', 'Guests share the trip, the next guests see it.']
    ],
    links: [
      ['📅', 'Today’s Departures', 'Times and seats remaining'],
      ['🎟️', 'Tickets & Pricing', 'Adult, child, and group rates'],
      ['🐬', 'What You’ll See', 'The route and what to expect'],
      ['🧾', 'What to Bring', 'Requirements and what’s included'],
      ['📍', 'Meeting Point', 'Where to check in and park'],
      ['⭐', 'Verified Reviews', 'From guests who actually went']
    ],
    interests: ['Ticketing & capacity', 'Live availability', 'Digital waivers', 'Last-minute deals', 'Reviews & photos', 'Everything']
  },

  {
    id: 'photographers',
    name: 'Photographers',
    short: 'Photographers',
    emoji: '📸',
    accent: '#6366f1',
    hero: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'For photographers & studios',
    headline: 'Book the session, take the deposit, deliver the gallery.',
    sub: 'Packages, locations, deposits, and client galleries in one place — so the whole job runs from a single link instead of a DM thread.',
    pains: [
      'Session details negotiated over Instagram DMs',
      'Deposits chased after the date is already held',
      'Galleries delivered through links that expire',
      'Golden-hour slots booked twice by mistake'
    ],
    gets: [
      ['Session Packages', 'Mini, full, family, wedding — with what’s included and pricing.'],
      ['Booking & Deposits', 'Hold the date with a deposit up front.'],
      ['Location Options', 'Beach, studio, or on-location, priced accordingly.'],
      ['Client Galleries', 'Private delivery each client can download from.'],
      ['Prep Reminders', 'What to wear and where to meet, sent before the shoot.'],
      ['Portfolio', 'Your best work, front and center.']
    ],
    links: [
      ['📅', 'Book a Session', 'Pick a package, date, and location'],
      ['💲', 'Packages & Pricing', 'What’s included in each session'],
      ['📸', 'Portfolio', 'Recent sessions and favorites'],
      ['🖼️', 'Client Galleries', 'Already shot? Find your photos'],
      ['📍', 'Locations', 'Where we shoot and why'],
      ['⭐', 'Reviews', 'From real clients']
    ],
    interests: ['Session booking', 'Deposits & payments', 'Client galleries', 'Portfolio page', 'Reminders', 'Everything']
  },

  {
    id: 'artists',
    name: 'Artists & Live Music',
    short: 'Artists',
    emoji: '🎤',
    accent: '#a855f7',
    hero: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'For musicians, bands & performers',
    headline: 'Every venue lists your name. None of them list you.',
    sub: 'Your own page with the schedule, music, socials, and booking — linked from every restaurant that has you playing, updated once.',
    pains: [
      'Venues post your name with no link and no info',
      'Fans have to search three places to find where you’re playing',
      'Booking inquiries come through five different inboxes',
      'Tips and requests handled with a jar and a shout'
    ],
    gets: [
      ['Artist Page', 'Bio, photos, genre, and links — one URL that stays current.'],
      ['Schedule', 'Every upcoming show, synced to the venues you play.'],
      ['Song Requests', 'Fans request from their phone during the set.'],
      ['Tip Jar', 'Digital tips without breaking the song.'],
      ['Booking Inquiries', 'Venues and private events reach you in one place.'],
      ['Follow & Alerts', 'Fans get told when you add a date nearby.']
    ],
    links: [
      ['📅', 'Upcoming Shows', 'Where and when I’m playing next'],
      ['🎵', 'Listen', 'Spotify, YouTube, and originals'],
      ['🎤', 'Request a Song', 'Send one up during the set'],
      ['💵', 'Tip the Band', 'Support the show'],
      ['📇', 'Book Me', 'Private events and venue inquiries'],
      ['📸', 'Photos & Video', 'Recent sets and clips']
    ],
    interests: ['Artist page & schedule', 'Song requests', 'Tip jar', 'Booking inquiries', 'Venue sync', 'Everything']
  },

  {
    id: 'services',
    name: 'Local Service Businesses',
    short: 'Other Services',
    emoji: '🧰',
    accent: '#64748b',
    hero: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'For any local business that books, quotes or serves',
    headline: 'If customers find you, contact you, and come back — this fits.',
    sub: 'Cleaning, detailing, landscaping, pet care, tutoring, fitness, medical, retail. Same system, arranged around how your customers actually reach you.',
    pains: [
      'Leads arrive through five channels and get lost in three',
      'Customers can’t see what you charge until they call',
      'Follow-up depends on remembering to follow up',
      'Repeat business is left entirely to chance'
    ],
    gets: [
      ['Services & Pricing', 'What you do, what it costs, how long it takes.'],
      ['Booking or Quotes', 'Take appointments, or take requests — whichever fits.'],
      ['Lead Capture', 'Catch the interest before they go back to Google.'],
      ['Reminders & Follow-Up', 'Automatic, so it happens whether you remember or not.'],
      ['Verified Reviews', 'Tied to real completed work.'],
      ['One Customer Record', 'Every job, message, and review in one place.']
    ],
    links: [
      ['📅', 'Book / Request Service', 'Pick a time or send a request'],
      ['💲', 'Services & Pricing', 'What we do and what it costs'],
      ['📸', 'Our Work', 'Recent jobs and results'],
      ['⭐', 'Verified Reviews', 'From real customers'],
      ['📍', 'Service Area & Hours', 'Where we work and when'],
      ['📞', 'Contact Us', 'Call, text, or send a message']
    ],
    interests: ['Booking or scheduling', 'Quote requests', 'Lead capture', 'Reviews', 'Follow-up automation', 'Everything']
  }
];

window.CC_VERTICAL_BY_ID = (function () {
  var m = {};
  window.CC_VERTICALS.forEach(function (v) { m[v.id] = v; });
  return m;
})();
