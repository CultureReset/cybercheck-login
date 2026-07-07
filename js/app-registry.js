/* ============================================================
   CYBERCHECK APP REGISTRY — SEED CATALOG
   ============================================================
   This file is DATA, not platform code. The modular dashboard is a
   pure shell/runtime: it renders whatever this registry (plus every
   community-published app) contains. Nothing in the dashboard is
   hardwired to any tool, industry, or business.

   - Add a new seed app: add one manifest object to CC_SEED_APPS.
   - Community apps are published at runtime via the App Studio and
     merge with this list (backend: module_manifest table).
   - Manifest shape:
     { id, name, icon, cat, type?, price, desc, author?, version?,
       block?:  {title, sub},          // renders a public page section
       setup?:  [{key,label,type,options?,def?,ph?,showIf?}],
       dataKey?, fields?,              // gives the app a data panel
       automation?: {trigger, action, template} }
   ============================================================ */

/* ============================================================
   MODULE CATALOG
   Every tool is a module. Modules with `block` render a section
   on the public page. `setup` questions ARE the install wizard.
   `dataKey`+`fields` give a module a generic CRUD panel.
   ============================================================ */
window.CC_SEED_APPS = [
  /* ── BOOKING ── */
  { id:'booking', name:'Bookings', icon:'📅', cat:'booking', price:0,
    desc:'Customers pick a service, date and time, and request or book online.',
    block:{ title:'Book Now', sub:'Check availability & reserve online' },
    setup:[
      {key:'label', label:'Button text on your page', type:'text', def:'Book Now'},
      {key:'mode', label:'How should bookings work?', type:'select', options:['Instant book','Request first (you confirm by SMS)','Send to my existing booking link'], def:'Request first (you confirm by SMS)'},
      {key:'external_url', label:'Existing booking link (if any)', type:'text', def:'', showIf:{key:'mode', val:'Send to my existing booking link'}},
      {key:'notify', label:'Send new booking alerts to', type:'text', def:'', ph:'Phone or email'}
    ],
    dataKey:'bookings',
    fields:[
      {key:'customer', label:'Customer name', type:'text'},
      {key:'phone', label:'Phone', type:'text'},
      {key:'service', label:'Service / item', type:'text'},
      {key:'date', label:'Date', type:'date'},
      {key:'time', label:'Time', type:'text'},
      {key:'party', label:'Party size', type:'number'},
      {key:'status', label:'Status', type:'select', options:['pending','confirmed','completed','cancelled']}
    ] },
  { id:'services', name:'Services & Pricing', icon:'🛠️', cat:'booking', price:0,
    desc:'Your bookable services, trips, rentals or sessions with prices and durations.',
    block:{ title:'Rates & Packages', sub:'Services, durations and pricing' },
    setup:[{key:'label', label:'Section title on your page', type:'text', def:'Rates & Packages'}],
    dataKey:'services',
    fields:[
      {key:'name', label:'Service name', type:'text'},
      {key:'price', label:'Price ($)', type:'number'},
      {key:'duration', label:'Duration', type:'text'},
      {key:'capacity', label:'Max guests', type:'number'},
      {key:'desc', label:'Description', type:'textarea'}
    ] },
  { id:'availability', name:'Availability Calendar', icon:'🗓️', cat:'booking', price:0,
    desc:'Open slots, blocked dates and capacity. Powers "Live Availability" on your page.',
    block:{ title:'Live Availability', sub:'See open dates and time slots' },
    setup:[
      {key:'granularity', label:'How do you sell time?', type:'select', options:['Time slots per day','Whole days','Nights (check-in/out)'], def:'Time slots per day'},
      {key:'capacity', label:'Default capacity per slot', type:'number', def:'1'}
    ],
    dataKey:'blocks',
    fields:[
      {key:'date', label:'Date', type:'date'},
      {key:'kind', label:'Type', type:'select', options:['blocked','open','booked']},
      {key:'note', label:'Note', type:'text'}
    ] },
  { id:'waivers', name:'Digital Waivers', icon:'✍️', cat:'booking', price:0,
    desc:'Liability waivers signed at booking. Stored and searchable.',
    setup:[{key:'text', label:'Waiver text (short version)', type:'textarea', def:'I acknowledge the risks involved and release the business from liability.'}],
    dataKey:'waivers',
    fields:[
      {key:'customer', label:'Customer', type:'text'},
      {key:'date', label:'Signed date', type:'date'},
      {key:'status', label:'Status', type:'select', options:['sent','signed']}
    ] },
  { id:'waitlist', name:'Waitlist', icon:'⏳', cat:'booking', price:0,
    desc:'Collect names when you are fully booked. Text them when a spot opens.',
    block:{ title:'Join the Waitlist', sub:'Get texted when a spot opens' },
    setup:[{key:'label', label:'Button text', type:'text', def:'Join the Waitlist'}],
    dataKey:'waitlist',
    fields:[
      {key:'name', label:'Name', type:'text'},
      {key:'phone', label:'Phone', type:'text'},
      {key:'wants', label:'Wants', type:'text'}
    ] },

  /* ── CONTENT ── */
  { id:'menu', name:'Menu', icon:'🍽️', cat:'content', price:0,
    desc:'Digital menu with sections, items, prices. One QR code, always current.',
    block:{ title:'Full Menu', sub:'Browse the menu with prices' },
    setup:[
      {key:'label', label:'Section title', type:'text', def:'Full Menu'},
      {key:'style', label:'Menu style', type:'select', options:['Text list','With photos'], def:'Text list'}
    ],
    dataKey:'menu_items',
    fields:[
      {key:'section', label:'Menu section', type:'text', ph:'Appetizers'},
      {key:'name', label:'Item name', type:'text'},
      {key:'price', label:'Price ($)', type:'number'},
      {key:'desc', label:'Description', type:'textarea'}
    ] },
  { id:'specials', name:'Specials & Happy Hour', icon:'🔥', cat:'content', price:0,
    desc:'Daily specials and happy hour that update in seconds.',
    block:{ title:"Today's Specials", sub:'Specials & happy hour, live' },
    setup:[{key:'label', label:'Section title', type:'text', def:"Today's Specials"}],
    dataKey:'specials',
    fields:[
      {key:'title', label:'Special', type:'text'},
      {key:'detail', label:'Details', type:'text'},
      {key:'days', label:'Days', type:'text', ph:'Mon–Fri'},
      {key:'time', label:'Time', type:'text', ph:'3–6 PM'}
    ] },
  { id:'events', name:'Events & Live Music', icon:'🎶', cat:'content', price:0,
    desc:'Shows, trivia nights, live music schedule.',
    block:{ title:'Live Music & Events', sub:'See what’s coming up' },
    setup:[{key:'label', label:'Section title', type:'text', def:'Live Music & Events'}],
    dataKey:'events',
    fields:[
      {key:'title', label:'Event / artist', type:'text'},
      {key:'date', label:'Date', type:'date'},
      {key:'time', label:'Time', type:'text'},
      {key:'detail', label:'Details', type:'text'}
    ] },
  { id:'gallery', name:'Gallery', icon:'📸', cat:'content', price:0,
    desc:'Photos of your food, boats, work, or venue.',
    block:{ title:'Gallery', sub:'Photos and highlights' },
    setup:[{key:'label', label:'Section title', type:'text', def:'Gallery'}],
    dataKey:'photos',
    fields:[
      {key:'url', label:'Image URL', type:'text'},
      {key:'caption', label:'Caption', type:'text'}
    ] },
  { id:'links', name:'Custom Links', icon:'🔗', cat:'content', price:0,
    desc:'Add any link to your page — socials, ordering, anything.',
    block:{ title:'More Links', sub:'Everything else in one place' },
    setup:[],
    dataKey:'links',
    fields:[
      {key:'title', label:'Link title', type:'text'},
      {key:'url', label:'URL', type:'text'},
      {key:'desc', label:'Short description', type:'text'}
    ] },
  { id:'hours', name:'Hours & Location', icon:'🕒', cat:'content', price:0,
    desc:'Open hours, address, directions and parking notes.',
    block:{ title:'Hours, Location & Directions', sub:'When and where to find us' },
    setup:[
      {key:'address', label:'Address', type:'text'},
      {key:'hours', label:'Hours (short)', type:'text', ph:'Mon–Sun 9 AM – 6 PM'}
    ] },
  { id:'faq', name:'FAQ / What’s Included', icon:'🧾', cat:'content', price:0,
    desc:'Answer the questions customers always ask.',
    block:{ title:'What’s Included', sub:'Policies and what to bring' },
    setup:[{key:'label', label:'Section title', type:'text', def:'What’s Included'}],
    dataKey:'faqs',
    fields:[
      {key:'q', label:'Question', type:'text'},
      {key:'a', label:'Answer', type:'textarea'}
    ] },

  /* ── ENGAGE ── */
  { id:'reviews', name:'Verified Reviews', icon:'⭐', cat:'engage', price:0,
    desc:'Collect reviews tied to real visits and bookings. Show the proof.',
    block:{ title:'Verified Reviews', sub:'Real customer feedback' },
    setup:[{key:'ask_after', label:'Ask for a review after', type:'select', options:['Every booking','Only completed bookings','Manual only'], def:'Only completed bookings'}],
    dataKey:'reviews',
    fields:[
      {key:'name', label:'Customer', type:'text'},
      {key:'stars', label:'Stars (1–5)', type:'number'},
      {key:'text', label:'Review', type:'textarea'}
    ] },
  { id:'song-request', name:'Song Requests', icon:'🎵', cat:'engage', price:0,
    desc:'Let the crowd request songs, with optional tips. Built for musicians and venues.',
    block:{ title:'Request a Song', sub:'Send a request to the stage' },
    setup:[
      {key:'label', label:'Button text', type:'text', def:'Request a Song'},
      {key:'to', label:'Send requests to', type:'select', options:['Artist','Venue manager','Both'], def:'Artist'},
      {key:'approval', label:'Require approval before display?', type:'select', options:['Yes','No'], def:'Yes'}
    ],
    dataKey:'song_requests',
    fields:[
      {key:'song', label:'Song', type:'text'},
      {key:'from', label:'From', type:'text'},
      {key:'tip', label:'Tip ($)', type:'number'}
    ] },
  { id:'tipjar', name:'Tip Jar', icon:'💸', cat:'engage', price:0,
    desc:'A simple tip button using your own payment links.',
    block:{ title:'Leave a Tip', sub:'Support us directly' },
    setup:[{key:'url', label:'Your tip link (Venmo / CashApp / Stripe)', type:'text'}] },
  { id:'loyalty', name:'Loyalty & Perks', icon:'💚', cat:'engage', price:0,
    desc:'Points, perks and repeat-customer rewards.',
    block:{ title:'Loyalty Rewards', sub:'Earn perks every visit' },
    setup:[{key:'offer', label:'Starting perk', type:'text', def:'Leave a review → earn 50 points'}],
    dataKey:'loyalty_members',
    fields:[
      {key:'name', label:'Member', type:'text'},
      {key:'phone', label:'Phone', type:'text'},
      {key:'points', label:'Points', type:'number'}
    ] },
  { id:'forms', name:'Forms & Lead Capture', icon:'📝', cat:'engage', price:0,
    desc:'Capture interest before customers disappear — name, phone, what they wanted.',
    block:{ title:'Get a Quote', sub:'Tell us what you need' },
    setup:[{key:'label', label:'Button text', type:'text', def:'Get a Quote'}],
    dataKey:'leads',
    fields:[
      {key:'name', label:'Name', type:'text'},
      {key:'phone', label:'Phone', type:'text'},
      {key:'wants', label:'Interested in', type:'text'},
      {key:'source', label:'Source', type:'text', ph:'QR / social / GCR'}
    ] },

  /* ── OPERATE ── */
  { id:'customers', name:'Customers (CRM)', icon:'👥', cat:'operate', price:0,
    desc:'Every customer, their history and contact info in one list.',
    dataKey:'customers',
    setup:[],
    fields:[
      {key:'name', label:'Name', type:'text'},
      {key:'phone', label:'Phone', type:'text'},
      {key:'email', label:'Email', type:'text'},
      {key:'notes', label:'Notes', type:'textarea'}
    ] },
  { id:'messaging', name:'SMS & Email', icon:'💬', cat:'operate', price:0,
    desc:'Booking confirmations, reminders and campaigns. Templates included.',
    setup:[
      {key:'confirm_tpl', label:'Booking confirmation text', type:'textarea', def:'Hi {name}! Your booking at {business} is confirmed for {date}. Reply here with questions.'},
      {key:'remind_tpl', label:'Reminder text', type:'textarea', def:'Reminder: your booking at {business} is today at {time}!'}
    ] },
  { id:'coupons', name:'Coupons & Promos', icon:'🎟️', cat:'operate', price:0,
    desc:'Discount codes and limited-time offers.',
    dataKey:'coupons',
    setup:[],
    fields:[
      {key:'code', label:'Code', type:'text'},
      {key:'off', label:'Discount', type:'text', ph:'10% or $5'},
      {key:'until', label:'Valid until', type:'date'}
    ] },
  { id:'staff', name:'Staff', icon:'👔', cat:'operate', price:0,
    desc:'Captains, stylists, servers — roles and contact info.',
    dataKey:'staff',
    setup:[],
    fields:[
      {key:'name', label:'Name', type:'text'},
      {key:'role', label:'Role', type:'text'},
      {key:'phone', label:'Phone', type:'text'}
    ] },
  { id:'analytics', name:'Analytics', icon:'📈', cat:'operate', price:0,
    desc:'Views, clicks, scans, bookings and where they came from.',
    setup:[] },

  /* ── CONNECT ── */
  { id:'payments', name:'Payments (Stripe/Square)', icon:'💳', cat:'connect', price:0,
    desc:'Connect your own Stripe or Square. Your money goes directly to you.',
    setup:[
      {key:'provider', label:'Payment provider', type:'select', options:['Stripe','Square','Clover','None yet'], def:'Stripe'},
      {key:'mode', label:'Collect at booking', type:'select', options:['Full payment','Deposit only','No payment (pay on site)'], def:'Deposit only'},
      {key:'deposit', label:'Deposit %', type:'number', def:'25'}
    ] },
  { id:'email-parser', name:'Platform Sync (Email)', icon:'📥', cat:'connect', price:0,
    desc:'Forward confirmation emails from Airbnb, FareHarbor, VRBO, OpenTable — any platform — and bookings appear here automatically. No APIs, no permission needed.',
    setup:[
      {key:'platforms', label:'Which platforms do you get booking emails from?', type:'text', ph:'e.g. FareHarbor, Airbnb'},
      {key:'note', label:'Your forwarding address is created on activation', type:'static', def:'gcr-yourbusiness@parse.cybercheckinc.com'}
    ] },
  { id:'gcr-listing', name:'Gulf Coast Radar Listing', icon:'📍', cat:'connect', price:0,
    desc:'Appear in GCR discovery — search, categories and live availability.',
    setup:[{key:'category', label:'GCR category', type:'select', options:['Restaurant','Charter','Boat Rental','Activity','Music/Artist','Transportation','Other'], def:'Restaurant'}] },
  { id:'qr-codes', name:'QR Codes', icon:'📲', cat:'connect', price:0,
    desc:'QR codes for tables, docks, flyers — all pointing at your page.',
    setup:[] },
  { id:'ai-concierge', name:'AI Concierge', icon:'🤖', cat:'connect', price:29,
    desc:'AI that answers customer questions from your verified data only.',
    block:{ title:'Ask Us Anything', sub:'Instant answers, 24/7' },
    setup:[{key:'tone', label:'Tone', type:'select', options:['Friendly','Professional','Fun'], def:'Friendly'}] }
];

window.CC_APP_CATS = [
  {id:'booking', name:'Booking'},
  {id:'content', name:'Content'},
  {id:'engage',  name:'Engage'},
  {id:'operate', name:'Operate'},
  {id:'connect', name:'Connect'}
];

/* Industry presets = starter bundles ONLY. Not hardwiring. */
window.CC_PRESETS = [
  { id:'restaurant', em:'🍽️', name:'Restaurant / Bar', mods:['menu','specials','events','booking','reviews','hours','gallery','messaging','customers','qr-codes'], type:'Restaurant' },
  { id:'charter', em:'🎣', name:'Charter / Tours', mods:['services','booking','availability','waivers','payments','reviews','hours','gallery','messaging','customers','email-parser'], type:'Charter' },
  { id:'rental', em:'🚤', name:'Boat / Rentals', mods:['services','booking','availability','waivers','payments','faq','hours','gallery','messaging','customers'], type:'Rentals' },
  { id:'salon', em:'✂️', name:'Salon / Services', mods:['services','booking','availability','loyalty','reviews','hours','messaging','customers'], type:'Salon' },
  { id:'creator', em:'🎤', name:'Artist / Creator', mods:['events','song-request','tipjar','links','gallery','forms','messaging'], type:'Artist' },
  { id:'lodging', em:'🏖️', name:'Condo / Lodging', mods:['services','availability','booking','faq','payments','email-parser','messaging','customers'], type:'Lodging' },
  { id:'blank', em:'🧩', name:'Start Blank', mods:['links'], type:'Business' }
];
