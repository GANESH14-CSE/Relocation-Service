/**
 * MoveEase — Interactive Relocation Orders & Inventory Controller (orders.js)
 * Implements:
 * Stage 1: Move Category Selector (Home, Office, Vehicle, Furniture)
 * Stage 2: Room & Item Inventory Explorer with Live Counters (Bed, Fridge, Sofa, AC...)
 * Stage 3: Live Sticky Move Summary Bar & Interactive Inventory Review Modal
 * Stage 4: Route Specifications & Instant Dynamic Estimate
 * Stage 5: Booking Confirmation with Unique Reference
 */

(function () {
  'use strict';

  // SVG Icon Templates for crisp rendering
  const ICONS = {
    bed: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h20v12M2 17h20M6 8v9"/></svg>`,
    mattress: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
    wardrobe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg>`,
    sofa: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><line x1="4" y1="18" x2="4" y2="21"/><line x1="20" y1="18" x2="20" y2="21"/></svg>`,
    table: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="4" rx="1"/><line x1="5" y1="9" x2="5" y2="19"/><line x1="19" y1="9" x2="19" y2="19"/></svg>`,
    tv: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>`,
    fridge: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="6" x2="8.01" y2="6"/><line x1="8" y1="15" x2="8.01" y2="15"/></svg>`,
    dining: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="3" r="2"/><circle cx="12" cy="21" r="2"/><circle cx="3" cy="12" r="2"/><circle cx="21" cy="12" r="2"/></svg>`,
    microwave: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><rect x="5" y="7" width="10" height="10" rx="1"/><circle cx="18" cy="9" r="1"/><circle cx="18" cy="15" r="1"/></svg>`,
    washer: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="13" r="5"/><circle cx="12" cy="6" r="1"/><line x1="7" y1="6" x2="7.01" y2="6"/></svg>`,
    ac: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="10" rx="2"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="6" y1="14" x2="12" y2="14"/></svg>`,
    geyser: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="4"/><line x1="12" y1="7" x2="12" y2="11"/><circle cx="12" cy="15" r="1"/></svg>`,
    box: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
    luggage: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="8" width="12" height="13" rx="2"/><path d="M9 8V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/><circle cx="9" cy="21" r="1"/><circle cx="15" cy="21" r="1"/></svg>`,
    car: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    bike: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 9l4.5-3L17 9"/></svg>`,
    desk: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="4" rx="1"/><line x1="4" y1="10" x2="4" y2="20"/><line x1="20" y1="10" x2="20" y2="20"/><rect x="12" y="10" width="6" height="8" rx="1"/></svg>`,
    chair: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 12 17 12 17 4 7 4 7 12"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="6" y1="21" x2="18" y2="21"/></svg>`,
    pc: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    server: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`
  };

  // Comprehensive Catalog of Relocation Items
  const INVENTORY_CATALOG = [
    // ---------------- HOME: BEDROOM ----------------
    {
      id: 'bed_king',
      name: 'King Size Bed',
      category: 'home',
      room: 'bedroom',
      roomName: 'Bedroom',
      spec: 'Wooden/metal frame, includes headboard dismantling',
      volume: 45, // cu.ft
      weight: 70, // kg
      baseCost: 1200,
      icon: ICONS.bed
    },
    {
      id: 'bed_queen',
      name: 'Queen Size Bed',
      category: 'home',
      room: 'bedroom',
      roomName: 'Bedroom',
      spec: 'Standard 5x6 ft bed frame & carpentry assembly',
      volume: 38,
      weight: 55,
      baseCost: 1000,
      icon: ICONS.bed
    },
    {
      id: 'bed_single',
      name: 'Single Bed / Cot',
      category: 'home',
      room: 'bedroom',
      roomName: 'Bedroom',
      spec: 'Single wooden/steel cot with storage drawer',
      volume: 22,
      weight: 35,
      baseCost: 600,
      icon: ICONS.bed
    },
    {
      id: 'mattress_king',
      name: 'King / Queen Mattress',
      category: 'home',
      room: 'bedroom',
      roomName: 'Bedroom',
      spec: '6-8 inch memory/spring foam, with dust wrap',
      volume: 18,
      weight: 25,
      baseCost: 450,
      icon: ICONS.mattress
    },
    {
      id: 'wardrobe_2door',
      name: '2-Door Wardrobe',
      category: 'home',
      room: 'bedroom',
      roomName: 'Bedroom',
      spec: 'Steel / engineered wood almirah with mirror',
      volume: 35,
      weight: 65,
      baseCost: 950,
      icon: ICONS.wardrobe
    },
    {
      id: 'wardrobe_3door',
      name: '3-Door / Sliding Wardrobe',
      category: 'home',
      room: 'bedroom',
      roomName: 'Bedroom',
      spec: 'Multi-door modular wardrobe, full carpentry service',
      volume: 55,
      weight: 95,
      baseCost: 1500,
      icon: ICONS.wardrobe
    },
    {
      id: 'dressing_table',
      name: 'Dressing Table with Mirror',
      category: 'home',
      room: 'bedroom',
      roomName: 'Bedroom',
      spec: 'Glass mirror protected with bubble film & padding',
      volume: 20,
      weight: 30,
      baseCost: 550,
      icon: ICONS.wardrobe
    },
    {
      id: 'bedside_table',
      name: 'Bedside Nightstands (Pair)',
      category: 'home',
      room: 'bedroom',
      roomName: 'Bedroom',
      spec: '2 small compact drawer units',
      volume: 12,
      weight: 20,
      baseCost: 350,
      icon: ICONS.table
    },

    // ---------------- HOME: LIVING ROOM ----------------
    {
      id: 'sofa_3seater',
      name: '3-Seater Sofa',
      category: 'home',
      room: 'living',
      roomName: 'Living Room',
      spec: 'Fabric or leather cushioned sofa with stretch wrapping',
      volume: 42,
      weight: 55,
      baseCost: 1100,
      icon: ICONS.sofa
    },
    {
      id: 'sofa_2seater',
      name: '2-Seater Sofa / Loveseat',
      category: 'home',
      room: 'living',
      roomName: 'Living Room',
      spec: 'Compact cushioned living room set',
      volume: 28,
      weight: 38,
      baseCost: 800,
      icon: ICONS.sofa
    },
    {
      id: 'recliner',
      name: 'Single Recliner Chair',
      category: 'home',
      room: 'living',
      roomName: 'Living Room',
      spec: 'Motorized or manual single heavy armchair',
      volume: 22,
      weight: 40,
      baseCost: 700,
      icon: ICONS.sofa
    },
    {
      id: 'tv_43',
      name: 'Smart TV (32" to 43")',
      category: 'home',
      room: 'living',
      roomName: 'Living Room',
      spec: 'Anti-shock corrugated box with thermocol cushion',
      volume: 8,
      weight: 14,
      baseCost: 500,
      icon: ICONS.tv
    },
    {
      id: 'tv_55',
      name: 'Large TV (50" to 65"+)',
      category: 'home',
      room: 'living',
      roomName: 'Living Room',
      spec: 'Heavy wood-reinforced edge protection box',
      volume: 16,
      weight: 28,
      baseCost: 900,
      icon: ICONS.tv
    },
    {
      id: 'coffee_table',
      name: 'Center / Coffee Table',
      category: 'home',
      room: 'living',
      roomName: 'Living Room',
      spec: 'Tempered glass or solid wood center table',
      volume: 12,
      weight: 22,
      baseCost: 400,
      icon: ICONS.table
    },
    {
      id: 'tv_unit',
      name: 'TV Entertainment Cabinet',
      category: 'home',
      room: 'living',
      roomName: 'Living Room',
      spec: 'Floor or wall console with shelves & drawers',
      volume: 25,
      weight: 45,
      baseCost: 750,
      icon: ICONS.table
    },
    {
      id: 'bookshelf',
      name: 'Bookshelf / Display Rack',
      category: 'home',
      room: 'living',
      roomName: 'Living Room',
      spec: 'Multi-tier storage rack for decor and books',
      volume: 24,
      weight: 35,
      baseCost: 600,
      icon: ICONS.wardrobe
    },

    // ---------------- HOME: KITCHEN & DINING ----------------
    {
      id: 'fridge_double',
      name: 'Double Door Refrigerator',
      category: 'home',
      room: 'kitchen',
      roomName: 'Kitchen & Dining',
      spec: '250L - 450L Frost Free, bubble & wrap protection',
      volume: 38,
      weight: 70,
      baseCost: 1100,
      icon: ICONS.fridge
    },
    {
      id: 'fridge_single',
      name: 'Single Door Refrigerator',
      category: 'home',
      room: 'kitchen',
      roomName: 'Kitchen & Dining',
      spec: '180L - 220L direct cool compact fridge',
      volume: 24,
      weight: 45,
      baseCost: 750,
      icon: ICONS.fridge
    },
    {
      id: 'fridge_sidebyside',
      name: 'Side-by-Side Large Fridge',
      category: 'home',
      room: 'kitchen',
      roomName: 'Kitchen & Dining',
      spec: '550L+ premium French-door, hydraulic dolly handling',
      volume: 58,
      weight: 110,
      baseCost: 1700,
      icon: ICONS.fridge
    },
    {
      id: 'dining_4seater',
      name: 'Dining Table (4-Seater)',
      category: 'home',
      room: 'kitchen',
      roomName: 'Kitchen & Dining',
      spec: 'Table + 4 cushioned wooden/metal chairs',
      volume: 35,
      weight: 55,
      baseCost: 950,
      icon: ICONS.dining
    },
    {
      id: 'dining_6seater',
      name: 'Dining Table (6-Seater)',
      category: 'home',
      room: 'kitchen',
      roomName: 'Kitchen & Dining',
      spec: 'Large table + 6 chairs, leg disassembly & wrap',
      volume: 50,
      weight: 80,
      baseCost: 1400,
      icon: ICONS.dining
    },
    {
      id: 'microwave_oven',
      name: 'Microwave / OTG Oven',
      category: 'home',
      room: 'kitchen',
      roomName: 'Kitchen & Dining',
      spec: 'Anti-shock packed in padded corrugated box',
      volume: 6,
      weight: 18,
      baseCost: 350,
      icon: ICONS.microwave
    },
    {
      id: 'gas_stove_cylinder',
      name: 'Gas Stove & Cylinders',
      category: 'home',
      room: 'kitchen',
      roomName: 'Kitchen & Dining',
      spec: 'Glass/steel cooktop + 2 sealed empty cylinders',
      volume: 10,
      weight: 35,
      baseCost: 400,
      icon: ICONS.washer
    },
    {
      id: 'water_purifier',
      name: 'Water Purifier (RO System)',
      category: 'home',
      room: 'kitchen',
      roomName: 'Kitchen & Dining',
      spec: 'Unmounted safely with filter kit packing',
      volume: 5,
      weight: 12,
      baseCost: 350,
      icon: ICONS.geyser
    },

    // ---------------- HOME: APPLIANCES & UTILITY ----------------
    {
      id: 'washer_top',
      name: 'Washing Machine (Top Load)',
      category: 'home',
      room: 'appliances',
      roomName: 'Appliances',
      spec: '6.5kg - 8.5kg capacity, hose drained & locked',
      volume: 22,
      weight: 42,
      baseCost: 750,
      icon: ICONS.washer
    },
    {
      id: 'washer_front',
      name: 'Washing Machine (Front Load)',
      category: 'home',
      room: 'appliances',
      roomName: 'Appliances',
      spec: 'Heavy drum unit with transit security bolts',
      volume: 28,
      weight: 72,
      baseCost: 1000,
      icon: ICONS.washer
    },
    {
      id: 'ac_split',
      name: 'Split AC (Indoor + Outdoor Unit)',
      category: 'home',
      room: 'appliances',
      roomName: 'Appliances',
      spec: '1.5 - 2 Ton copper coil units with pipe wrapping',
      volume: 18,
      weight: 50,
      baseCost: 1100,
      icon: ICONS.ac
    },
    {
      id: 'ac_window',
      name: 'Window AC (1.5 Ton)',
      category: 'home',
      room: 'appliances',
      roomName: 'Appliances',
      spec: 'Heavy integrated cooling unit',
      volume: 15,
      weight: 55,
      baseCost: 800,
      icon: ICONS.ac
    },
    {
      id: 'water_geyser',
      name: 'Water Heater / Geyser',
      category: 'home',
      room: 'appliances',
      roomName: 'Appliances',
      spec: '15L - 25L insulated cylinder',
      volume: 8,
      weight: 16,
      baseCost: 400,
      icon: ICONS.geyser
    },
    {
      id: 'inverter_battery',
      name: 'Home Inverter + Tall Battery',
      category: 'home',
      room: 'appliances',
      roomName: 'Appliances',
      spec: 'Acid-sealed tubular battery with heavy handling',
      volume: 12,
      weight: 65,
      baseCost: 650,
      icon: ICONS.washer
    },

    // ---------------- HOME: BOXES & MISC ----------------
    {
      id: 'box_medium',
      name: 'Standard Moving Box (5-Ply)',
      category: 'home',
      room: 'boxes',
      roomName: 'Boxes & Luggage',
      spec: '18"x18"x18" corrugated carton for clothes & books',
      volume: 5,
      weight: 18,
      baseCost: 180,
      icon: ICONS.box
    },
    {
      id: 'box_large',
      name: 'Large Linen & Garment Carton',
      category: 'home',
      room: 'boxes',
      roomName: 'Boxes & Luggage',
      spec: '24"x24"x24" box for quilts, pillows & winterwear',
      volume: 8,
      weight: 22,
      baseCost: 240,
      icon: ICONS.box
    },
    {
      id: 'box_fragile',
      name: 'Fragile Crockery / Glass Crate',
      category: 'home',
      room: 'boxes',
      roomName: 'Boxes & Luggage',
      spec: 'Triple bubble-wrap dividers for glassware & chinaware',
      volume: 6,
      weight: 15,
      baseCost: 320,
      icon: ICONS.box
    },
    {
      id: 'suitcase_luggage',
      name: 'Travel Trolley / Suitcase',
      category: 'home',
      room: 'boxes',
      roomName: 'Boxes & Luggage',
      spec: 'Large 28-32 inch hard or soft suitcase',
      volume: 6,
      weight: 25,
      baseCost: 180,
      icon: ICONS.luggage
    },

    // ---------------- OFFICE RELOCATION ----------------
    {
      id: 'off_workstation',
      name: 'Office Workstation Desk',
      category: 'office',
      room: 'desks',
      roomName: 'Desks & Workstations',
      spec: 'Linear or modular partition desk with cable tray',
      volume: 25,
      weight: 40,
      baseCost: 800,
      icon: ICONS.desk
    },
    {
      id: 'off_exec_desk',
      name: 'Executive L-Shaped Desk',
      category: 'office',
      room: 'desks',
      roomName: 'Desks & Workstations',
      spec: 'Large director desk with return credenza',
      volume: 45,
      weight: 75,
      baseCost: 1300,
      icon: ICONS.desk
    },
    {
      id: 'off_chair_mesh',
      name: 'Ergonomic Mesh Office Chair',
      category: 'office',
      room: 'desks',
      roomName: 'Desks & Workstations',
      spec: 'High-back swivel chair with armrests & lumbar support',
      volume: 12,
      weight: 18,
      baseCost: 400,
      icon: ICONS.chair
    },
    {
      id: 'off_pc_setup',
      name: 'Desktop PC & Dual Monitors',
      category: 'office',
      room: 'it',
      roomName: 'IT & Electronics',
      spec: 'CPU, dual screens, keyboard/mouse in IT safe box',
      volume: 10,
      weight: 16,
      baseCost: 650,
      icon: ICONS.pc
    },
    {
      id: 'off_server_rack',
      name: 'Server Rack Enclosure',
      category: 'office',
      room: 'it',
      roomName: 'IT & Electronics',
      spec: '24U - 42U enclosed network rack with shock pallets',
      volume: 45,
      weight: 120,
      baseCost: 2500,
      icon: ICONS.server
    },
    {
      id: 'off_printer_heavy',
      name: 'Office Copier / Laser Printer',
      category: 'office',
      room: 'it',
      roomName: 'IT & Electronics',
      spec: 'Floor-standing multi-function commercial machine',
      volume: 24,
      weight: 65,
      baseCost: 1200,
      icon: ICONS.washer
    },
    {
      id: 'off_filing_cabinet',
      name: '4-Drawer Steel File Cabinet',
      category: 'office',
      room: 'storage',
      roomName: 'Storage & Filing',
      spec: 'Heavy lockable file organizer for records',
      volume: 20,
      weight: 55,
      baseCost: 750,
      icon: ICONS.wardrobe
    },
    {
      id: 'off_conf_table',
      name: 'Conference Table (8-10 Seater)',
      category: 'office',
      room: 'conference',
      roomName: 'Conference & Common',
      spec: 'Modular boardroom table with wire management',
      volume: 60,
      weight: 90,
      baseCost: 1800,
      icon: ICONS.table
    },

    // ---------------- VEHICLE TRANSPORT ----------------
    {
      id: 'veh_hatchback',
      name: 'Hatchback Car',
      category: 'vehicle',
      room: 'cars',
      roomName: 'Four-Wheelers',
      spec: 'Swift, i10, Tiago, Baleno, Altroz (Enclosed Carrier)',
      volume: 350,
      weight: 1000,
      baseCost: 7500,
      icon: ICONS.car
    },
    {
      id: 'veh_sedan',
      name: 'Mid-Size Sedan',
      category: 'vehicle',
      room: 'cars',
      roomName: 'Four-Wheelers',
      spec: 'Honda City, Verna, Ciaz, Slavia (Chock Tie-down)',
      volume: 420,
      weight: 1250,
      baseCost: 8800,
      icon: ICONS.car
    },
    {
      id: 'veh_suv',
      name: 'Compact / Full SUV',
      category: 'vehicle',
      room: 'cars',
      roomName: 'Four-Wheelers',
      spec: 'Creta, Seltos, Harrier, Innova, Scorpio, XUV700',
      volume: 520,
      weight: 1650,
      baseCost: 10500,
      icon: ICONS.car
    },
    {
      id: 'veh_bike_std',
      name: 'Commuter Bike (100cc-160cc)',
      category: 'vehicle',
      room: 'bikes',
      roomName: 'Two-Wheelers',
      spec: 'Splendor, Shine, Pulsar, Apache (Padded Crate)',
      volume: 45,
      weight: 135,
      baseCost: 2600,
      icon: ICONS.bike
    },
    {
      id: 'veh_bullet',
      name: 'Cruiser / Royal Enfield Bullet',
      category: 'vehicle',
      room: 'bikes',
      roomName: 'Two-Wheelers',
      spec: 'Classic 350, Hunter, Meteor, Himalayan, KTM Duke',
      volume: 55,
      weight: 195,
      baseCost: 3500,
      icon: ICONS.bike
    },
    {
      id: 'veh_scooter',
      name: 'Automatic Scooter',
      category: 'vehicle',
      room: 'bikes',
      roomName: 'Two-Wheelers',
      spec: 'Activa, Jupiter, Access, Ola, Ather (Handle lock strap)',
      volume: 38,
      weight: 110,
      baseCost: 2400,
      icon: ICONS.bike
    },
    {
      id: 'veh_bicycle',
      name: 'Geared / Electric Bicycle',
      category: 'vehicle',
      room: 'bikes',
      roomName: 'Two-Wheelers',
      spec: 'Pedal MTB or electric cycle in cardboard wrap',
      volume: 20,
      weight: 22,
      baseCost: 950,
      icon: ICONS.bike
    },

    // ---------------- FURNITURE & MINI MOVES ----------------
    {
      id: 'furn_bed',
      name: 'Modular Bed & Mattress Set',
      category: 'furniture',
      room: 'pieces',
      roomName: 'Furniture Pieces',
      spec: 'King/Queen bed with spring mattress and dismantling',
      volume: 55,
      weight: 85,
      baseCost: 1600,
      icon: ICONS.bed
    },
    {
      id: 'furn_wardrobe',
      name: 'Wardrobe / Cupboard',
      category: 'furniture',
      room: 'pieces',
      roomName: 'Furniture Pieces',
      spec: '2 or 3 door wooden/steel wardrobe with disassembly',
      volume: 45,
      weight: 70,
      baseCost: 1200,
      icon: ICONS.wardrobe
    },
    {
      id: 'furn_sofa',
      name: 'Living Room Sofa Set',
      category: 'furniture',
      room: 'pieces',
      roomName: 'Furniture Pieces',
      spec: '3+1+1 or L-shape sectional with anti-stain film',
      volume: 65,
      weight: 85,
      baseCost: 1800,
      icon: ICONS.sofa
    },
    {
      id: 'furn_dining',
      name: 'Dining Table & 4 Chairs',
      category: 'furniture',
      room: 'pieces',
      roomName: 'Furniture Pieces',
      spec: 'Solid wood/glass table with cushioned seats',
      volume: 40,
      weight: 60,
      baseCost: 1100,
      icon: ICONS.dining
    }
  ];

  // Room definitions per Category
  const CATEGORY_ROOMS = {
    home: [
      { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
      { id: 'living', name: 'Living Room', icon: '🛋️' },
      { id: 'kitchen', name: 'Kitchen & Dining', icon: '🍳' },
      { id: 'appliances', name: 'Appliances', icon: '⚡' },
      { id: 'boxes', name: 'Boxes & Luggage', icon: '📦' }
    ],
    office: [
      { id: 'desks', name: 'Desks & Chairs', icon: '💼' },
      { id: 'it', name: 'IT & Electronics', icon: '🖥️' },
      { id: 'storage', name: 'Filing & Storage', icon: '📁' },
      { id: 'conference', name: 'Conference', icon: '👥' }
    ],
    vehicle: [
      { id: 'cars', name: 'Cars (4-Wheelers)', icon: '🚗' },
      { id: 'bikes', name: 'Bikes & Scooters', icon: '🏍️' }
    ],
    furniture: [
      { id: 'pieces', name: 'Individual Furniture', icon: '🛋️' }
    ]
  };

  // ---------------------------------------------------------------------------
  // MAIN CONTROLLER INITIALIZATION
  // ---------------------------------------------------------------------------
  function initOrdersController() {
    // DOM Elements
    const catCards = document.querySelectorAll('.order-category-card');
    const roomTabsNav = document.getElementById('roomTabsNav');
    const itemsGrid = document.getElementById('inventoryItemsGrid');
    const searchInput = document.getElementById('inventorySearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const emptyState = document.getElementById('inventoryEmptyState');
    const resetSearchBtn = document.getElementById('resetSearchBtn');
    const activeCatBadge = document.getElementById('activeCategoryBadge');
    const invHeaderTitle = document.getElementById('inventoryHeaderTitle');

    // Sticky Cart Elements
    const cartSelectedCount = document.getElementById('cartSelectedCount');
    const cartVolumeVal = document.getElementById('cartVolumeVal');
    const cartTruckVal = document.getElementById('cartTruckVal');
    const cartPriceVal = document.getElementById('cartPriceVal');
    const cartViewCount = document.getElementById('cartViewCount');
    const viewInventoryBtn = document.getElementById('viewInventoryBtn');
    const cartContinueBtn = document.getElementById('cartContinueBtn');

    // Inventory Modal Elements
    const invModal = document.getElementById('inventoryModal');
    const invModalBody = document.getElementById('invModalBody');
    const closeInvModalBtn = document.getElementById('closeInvModalBtn');
    const saveInvModalBtn = document.getElementById('saveInvModalBtn');
    const clearAllItemsBtn = document.getElementById('clearAllItemsBtn');
    const invModalTotalVolume = document.getElementById('invModalTotalVolume');

    // Move Details & Booking Elements
    const moveDetailsSection = document.getElementById('moveDetailsSection');
    const bookingFormSection = document.getElementById('bookingFormSection');
    const pickupInput = document.getElementById('orderPickup');
    const destInput = document.getElementById('orderDest');
    const dateInput = document.getElementById('orderDate');
    const propSelect = document.getElementById('orderPropertyType');
    const itemsInput = document.getElementById('orderApproxItems');
    const indicativeRangeText = document.getElementById('indicativeRangeText');
    const proceedToBookingBtn = document.getElementById('proceedToBookingBtn');

    const bookingForm = document.getElementById('finalBookingForm');
    const summarySelectedServices = document.getElementById('summarySelectedServices');
    const summaryRouteSchedule = document.getElementById('summaryRouteSchedule');
    const summaryIndicativePrice = document.getElementById('summaryIndicativePrice');

    const successModal = document.getElementById('ordersSuccessModal');
    const successModalClose = document.getElementById('ordersModalCloseBtn');

    // Active State
    let activeCategory = 'home';
    let activeRoom = 'bedroom';
    let searchQuery = '';
    // Map of item id -> quantity
    const itemQuantities = {};

    // -------------------------------------------------------------------------
    // 1. QUERY PARAMS PRE-SELECTION
    // -------------------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const paramCat = urlParams.get('category');
    const paramOption = urlParams.get('option');

    if (paramCat) {
      if (paramCat === 'furniture') activeCategory = 'furniture';
      else if (paramCat === 'office') activeCategory = 'office';
      else if (paramCat === 'vehicle' || paramCat === 'car' || paramCat === 'bike') activeCategory = 'vehicle';
      else activeCategory = 'home';
    }

    // Set initial active room for active category
    const initialRooms = CATEGORY_ROOMS[activeCategory] || CATEGORY_ROOMS.home;
    activeRoom = initialRooms[0].id;

    // Pre-select item if option is passed
    if (paramOption) {
      const decoded = decodeURIComponent(paramOption).toLowerCase();
      const matched = INVENTORY_CATALOG.find(item =>
        item.name.toLowerCase().includes(decoded) || decoded.includes(item.name.toLowerCase())
      );
      if (matched) {
        itemQuantities[matched.id] = 1;
        activeCategory = matched.category;
        activeRoom = matched.room;
      }
    } else {
      // Default: Give a realistic starting state for Home Moving
      if (activeCategory === 'home') {
        itemQuantities['bed_king'] = 1;
        itemQuantities['fridge_double'] = 1;
        itemQuantities['sofa_3seater'] = 1;
        itemQuantities['washer_top'] = 1;
      }
    }

    // -------------------------------------------------------------------------
    // 2. RENDER FUNCTIONS
    // -------------------------------------------------------------------------

    // Render Category Cards Active State
    function renderCategoryCards() {
      catCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (cat === activeCategory) {
          card.classList.add('active');
          card.setAttribute('aria-selected', 'true');
        } else {
          card.classList.remove('active');
          card.setAttribute('aria-selected', 'false');
        }

        // Update tally label on card
        const catItems = INVENTORY_CATALOG.filter(it => it.category === cat && (itemQuantities[it.id] || 0) > 0);
        const catTotalCount = catItems.reduce((acc, it) => acc + (itemQuantities[it.id] || 0), 0);
        const tallyEl = card.querySelector('.cat-item-tally');
        if (tallyEl) {
          tallyEl.textContent = `${catTotalCount} item${catTotalCount === 1 ? '' : 's'} picked`;
        }
      });

      // Update badge in builder header
      if (activeCatBadge) {
        const titleMap = {
          home: 'Home Moving',
          office: 'Office Relocation',
          vehicle: 'Vehicle Transport',
          furniture: 'Furniture & Mini Moves'
        };
        activeCatBadge.textContent = titleMap[activeCategory] || 'Home Moving';
      }

      if (invHeaderTitle) {
        const questionMap = {
          home: 'What household items are you moving?',
          office: 'Select your office & IT inventory',
          vehicle: 'Choose vehicle types for relocation',
          furniture: 'Select furniture pieces to move'
        };
        invHeaderTitle.textContent = questionMap[activeCategory] || 'What items are you shifting?';
      }
    }

    // Render Room Filter Tabs
    function renderRoomTabs() {
      if (!roomTabsNav) return;
      roomTabsNav.innerHTML = '';

      const rooms = CATEGORY_ROOMS[activeCategory] || [];
      rooms.forEach(r => {
        // Count items selected in this room
        const roomItems = INVENTORY_CATALOG.filter(it => it.category === activeCategory && it.room === r.id);
        const selectedInRoom = roomItems.reduce((acc, it) => acc + (itemQuantities[it.id] || 0), 0);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `room-tab-btn ${r.id === activeRoom && !searchQuery ? 'active' : ''}`;
        btn.setAttribute('data-room', r.id);
        btn.innerHTML = `
          <span>${r.icon}</span>
          <span>${r.name}</span>
          <span class="room-tab-count ${selectedInRoom > 0 ? 'has-items' : ''}">${selectedInRoom}</span>
        `;

        btn.addEventListener('click', () => {
          activeRoom = r.id;
          searchQuery = '';
          if (searchInput) searchInput.value = '';
          if (clearSearchBtn) clearSearchBtn.style.display = 'none';
          renderRoomTabs();
          renderInventoryItems();
        });

        roomTabsNav.appendChild(btn);
      });
    }

    // Render Item Cards
    function renderInventoryItems() {
      if (!itemsGrid) return;
      itemsGrid.innerHTML = '';

      let filtered = [];

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        // If searching, search across all rooms of the current category (or all categories)
        filtered = INVENTORY_CATALOG.filter(it =>
          it.name.toLowerCase().includes(q) ||
          it.spec.toLowerCase().includes(q) ||
          it.roomName.toLowerCase().includes(q)
        );
      } else {
        filtered = INVENTORY_CATALOG.filter(it => it.category === activeCategory && it.room === activeRoom);
      }

      if (filtered.length === 0) {
        itemsGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      itemsGrid.style.display = 'grid';
      if (emptyState) emptyState.style.display = 'none';

      filtered.forEach(item => {
        const qty = itemQuantities[item.id] || 0;
        const card = document.createElement('div');
        card.className = `inventory-item-card ${qty > 0 ? 'has-qty' : ''}`;
        card.setAttribute('data-item-id', item.id);

        card.innerHTML = `
          <div class="item-card-top">
            <div class="item-card-icon" aria-hidden="true">${item.icon}</div>
            <div class="item-card-info">
              <h4 class="item-card-title">${item.name}</h4>
              <p class="item-card-spec">${item.spec}</p>
              <div class="item-card-metrics">
                <span class="item-card-tag">${item.volume} cu.ft</span>
                <span class="item-card-tag">~${item.weight} kg</span>
              </div>
            </div>
          </div>
          <div class="item-qty-control">
            ${qty === 0 ? `
              <button type="button" class="btn-add-item" aria-label="Add ${item.name}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Add Item</span>
              </button>
            ` : `
              <div class="qty-counter-group" role="group" aria-label="Quantity for ${item.name}">
                <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">&minus;</button>
                <span class="qty-val">${qty}</span>
                <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">&plus;</button>
              </div>
            `}
          </div>
        `;

        // Event Listeners for Counter Buttons
        const addBtn = card.querySelector('.btn-add-item');
        if (addBtn) {
          addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeItemQty(item.id, 1);
          });
        }

        const minusBtn = card.querySelector('.qty-minus');
        if (minusBtn) {
          minusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeItemQty(item.id, -1);
          });
        }

        const plusBtn = card.querySelector('.qty-plus');
        if (plusBtn) {
          plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeItemQty(item.id, 1);
          });
        }

        itemsGrid.appendChild(card);
      });
    }

    // Change Item Quantity Helper
    function changeItemQty(itemId, delta) {
      const current = itemQuantities[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        delete itemQuantities[itemId];
      } else {
        itemQuantities[itemId] = next;
      }

      // Re-render UI
      renderCategoryCards();
      renderRoomTabs();
      renderInventoryItems();
      updateCartSummary();
    }

    // Update Sticky Move Cart Summary
    function updateCartSummary() {
      // Calculate totals
      let totalCount = 0;
      let totalVolume = 0;
      let totalWeight = 0;
      let totalItemCost = 0;

      const selectedItemsList = [];

      Object.keys(itemQuantities).forEach(id => {
        const count = itemQuantities[id];
        if (count > 0) {
          const item = INVENTORY_CATALOG.find(it => it.id === id);
          if (item) {
            totalCount += count;
            totalVolume += item.volume * count;
            totalWeight += item.weight * count;
            totalItemCost += item.baseCost * count;
            selectedItemsList.push({ ...item, qty: count });
          }
        }
      });

      // Update Counts
      if (cartSelectedCount) {
        cartSelectedCount.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'} selected`;
      }
      if (cartViewCount) {
        cartViewCount.textContent = totalCount;
      }
      if (cartVolumeVal) {
        cartVolumeVal.textContent = `${totalVolume} cu.ft`;
      }
      if (invModalTotalVolume) {
        invModalTotalVolume.textContent = `${totalVolume} cu.ft (~${totalWeight} kg)`;
      }

      // Recommend Truck Size
      let recommendedTruck = 'Tata Ace (7ft)';
      if (totalVolume > 600) {
        recommendedTruck = '19ft Dedicated Container';
      } else if (totalVolume > 350) {
        recommendedTruck = '17ft Container Truck';
      } else if (totalVolume > 200) {
        recommendedTruck = '14ft Eicher Truck';
      } else if (totalVolume > 90) {
        recommendedTruck = '8ft Pickup / 407';
      }
      if (cartTruckVal) {
        cartTruckVal.textContent = recommendedTruck;
      }

      // Estimate Price Range
      let minEst = 4500;
      let maxEst = 7000;

      if (totalCount > 0) {
        minEst += Math.round(totalItemCost * 0.9);
        maxEst += Math.round(totalItemCost * 1.35 + 2500);
      } else {
        minEst = 0;
        maxEst = 0;
      }

      const formattedRange = totalCount > 0
        ? `₹${minEst.toLocaleString('en-IN')} – ₹${maxEst.toLocaleString('en-IN')}`
        : '₹0';

      if (cartPriceVal) cartPriceVal.textContent = formattedRange;
      if (indicativeRangeText) indicativeRangeText.textContent = formattedRange;
      if (summaryIndicativePrice) summaryIndicativePrice.textContent = formattedRange;

      // Populate Approximate Items Input for Stage 3
      if (itemsInput) {
        if (selectedItemsList.length > 0) {
          const summaryStr = selectedItemsList.map(it => `${it.qty}x ${it.name}`).join(', ');
          itemsInput.value = `${summaryStr} (Vol: ~${totalVolume} cu.ft)`;
        } else {
          itemsInput.value = '';
        }
      }

      // Populate Booking Summary
      if (summarySelectedServices) {
        if (selectedItemsList.length > 0) {
          summarySelectedServices.textContent = `${totalCount} items: ` + selectedItemsList.slice(0, 4).map(it => `${it.qty}x ${it.name}`).join(', ') + (selectedItemsList.length > 4 ? ' + more...' : '');
        } else {
          summarySelectedServices.textContent = 'None';
        }
      }

      // Update Cargo Banner in Move Details Section
      const bannerCargoSummary = document.getElementById('bannerCargoSummary');
      if (bannerCargoSummary) {
        if (selectedItemsList.length > 0) {
          bannerCargoSummary.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'} (~${totalVolume} cu.ft, recommended: ${recommendedTruck})`;
        } else {
          bannerCargoSummary.textContent = '0 items selected';
        }
      }

      // Persist in sessionStorage
      try {
        sessionStorage.setItem('moveease_order_inventory', JSON.stringify(itemQuantities));
      } catch (e) {}
    }

    // -------------------------------------------------------------------------
    // 3. INVENTORY REVIEW MODAL RENDER
    // -------------------------------------------------------------------------
    function renderInventoryModal() {
      if (!invModalBody) return;
      invModalBody.innerHTML = '';

      const selectedIds = Object.keys(itemQuantities).filter(id => itemQuantities[id] > 0);

      if (selectedIds.length === 0) {
        invModalBody.innerHTML = `
          <div style="text-align: center; padding: var(--space-6) var(--space-4); color: var(--color-text-secondary);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <h4 style="margin: var(--space-2) 0; color: var(--color-text-primary);">Your move inventory is currently empty</h4>
            <p class="text-xs">Browse the categories and add beds, refrigerators, sofas or cartons to build your quote.</p>
          </div>
        `;
        return;
      }

      // Group selected items by roomName
      const grouped = {};
      selectedIds.forEach(id => {
        const it = INVENTORY_CATALOG.find(x => x.id === id);
        if (it) {
          const groupKey = it.roomName || 'Other Items';
          if (!grouped[groupKey]) grouped[groupKey] = [];
          grouped[groupKey].push(it);
        }
      });

      Object.keys(grouped).forEach(roomName => {
        const groupEl = document.createElement('div');
        groupEl.className = 'inventory-modal-group';

        const titleEl = document.createElement('div');
        titleEl.className = 'inventory-modal-group-title';
        titleEl.textContent = roomName;
        groupEl.appendChild(titleEl);

        grouped[roomName].forEach(it => {
          const qty = itemQuantities[it.id];
          const row = document.createElement('div');
          row.className = 'inventory-modal-item';
          row.innerHTML = `
            <div>
              <div class="modal-item-title">${it.name}</div>
              <div class="modal-item-subtitle">${it.volume} cu.ft · ~${it.weight} kg</div>
            </div>
            <div class="modal-item-actions">
              <div class="modal-qty-counter">
                <button type="button" class="modal-qty-btn modal-minus" aria-label="Decrease">&minus;</button>
                <span class="modal-qty-val">${qty}</span>
                <button type="button" class="modal-qty-btn modal-plus" aria-label="Increase">&plus;</button>
              </div>
              <button type="button" class="modal-remove-item-btn" title="Remove item" aria-label="Remove ${it.name}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          `;

          row.querySelector('.modal-minus').addEventListener('click', () => {
            changeItemQty(it.id, -1);
            renderInventoryModal();
          });

          row.querySelector('.modal-plus').addEventListener('click', () => {
            changeItemQty(it.id, 1);
            renderInventoryModal();
          });

          row.querySelector('.modal-remove-item-btn').addEventListener('click', () => {
            delete itemQuantities[it.id];
            renderCategoryCards();
            renderRoomTabs();
            renderInventoryItems();
            updateCartSummary();
            renderInventoryModal();
          });

          groupEl.appendChild(row);
        });

        invModalBody.appendChild(groupEl);
      });
    }

    // Open Inventory Modal
    function openInventoryModal() {
      renderInventoryModal();
      if (invModal) {
        invModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    // Close Inventory Modal
    function closeInventoryModal() {
      if (invModal) {
        invModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    }

    if (viewInventoryBtn) viewInventoryBtn.addEventListener('click', openInventoryModal);
    if (closeInvModalBtn) closeInvModalBtn.addEventListener('click', closeInventoryModal);
    if (saveInvModalBtn) saveInvModalBtn.addEventListener('click', closeInventoryModal);

    if (clearAllItemsBtn) {
      clearAllItemsBtn.addEventListener('click', () => {
        Object.keys(itemQuantities).forEach(k => delete itemQuantities[k]);
        renderCategoryCards();
        renderRoomTabs();
        renderInventoryItems();
        updateCartSummary();
        renderInventoryModal();
      });
    }

    if (invModal) {
      invModal.addEventListener('click', (e) => {
        if (e.target === invModal) closeInventoryModal();
      });
    }

    // -------------------------------------------------------------------------
    // 4. CATEGORY SELECTOR EVENT LISTENERS
    // -------------------------------------------------------------------------
    catCards.forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-category');
        if (cat === activeCategory) return;
        activeCategory = cat;
        const rooms = CATEGORY_ROOMS[activeCategory] || CATEGORY_ROOMS.home;
        activeRoom = rooms[0].id;
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';

        renderCategoryCards();
        renderRoomTabs();
        renderInventoryItems();
      });
    });

    // -------------------------------------------------------------------------
    // 5. SEARCH INPUT CONTROLLER
    // -------------------------------------------------------------------------
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        }
        renderRoomTabs();
        renderInventoryItems();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        renderRoomTabs();
        renderInventoryItems();
      });
    }

    if (resetSearchBtn) {
      resetSearchBtn.addEventListener('click', () => {
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        renderRoomTabs();
        renderInventoryItems();
      });
    }

    // -------------------------------------------------------------------------
    // 6. STAGE 3: CONTINUE TO MOVE DETAILS
    // -------------------------------------------------------------------------
    if (cartContinueBtn) {
      cartContinueBtn.addEventListener('click', () => {
        const totalSelected = Object.values(itemQuantities).reduce((a, b) => a + b, 0);
        if (totalSelected === 0) {
          if (window.MoveEase && window.MoveEase.showToast) {
            window.MoveEase.showToast('Please add at least one item (e.g. Bed, Fridge, Sofa) to continue.', 'info');
          } else {
            alert('Please add at least one item to continue.');
          }
          return;
        }

        if (moveDetailsSection) {
          moveDetailsSection.classList.add('active');
          setTimeout(() => {
            const headerOffset = 90;
            const elementPosition = moveDetailsSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 60);
        }
      });
    }

    // "Modify Items" button inside Move Details banner -> scrolls back up to inventory builder
    const editBannerBtn = document.getElementById('editInventoryFromBannerBtn');
    if (editBannerBtn) {
      editBannerBtn.addEventListener('click', () => {
        const builderCard = document.getElementById('inventoryBuilderCard');
        if (builderCard) {
          const headerOffset = 90;
          const elementPosition = builderCard.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    }

    // -------------------------------------------------------------------------
    // 7. STAGE 4: PROCEED TO BOOKING FORM
    // -------------------------------------------------------------------------
    if (proceedToBookingBtn) {
      proceedToBookingBtn.addEventListener('click', () => {
        let valid = true;
        const pickupVal = (pickupInput ? pickupInput.value : '').trim();
        const destVal = (destInput ? destInput.value : '').trim();
        const dateVal = dateInput ? dateInput.value : '';

        [pickupInput, destInput, dateInput].forEach(inp => {
          if (inp && !inp.value.trim()) {
            inp.closest('.form-group').classList.add('has-error');
            valid = false;
          } else if (inp) {
            inp.closest('.form-group').classList.remove('has-error');
          }
        });

        if (!valid) return;

        // Populate summary
        if (summaryRouteSchedule) {
          summaryRouteSchedule.textContent = `${pickupVal} ➔ ${destVal} (Date: ${dateVal})`;
        }

        if (bookingFormSection) {
          bookingFormSection.classList.add('active');
          setTimeout(() => {
            const headerOffset = 90;
            const elementPosition = bookingFormSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 60);
        }
      });
    }

    // -------------------------------------------------------------------------
    // 8. FINAL BOOKING SUBMISSION & MODAL
    // -------------------------------------------------------------------------
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        bookingForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));

        let valid = true;
        const name = document.getElementById('bookCustName');
        const phone = document.getElementById('bookCustPhone');
        const email = document.getElementById('bookCustEmail');

        if (!name || !name.value.trim()) {
          name.closest('.form-group').classList.add('has-error');
          valid = false;
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phone || !phoneRegex.test(phone.value.replace(/[\s-]/g, ''))) {
          phone.closest('.form-group').classList.add('has-error');
          valid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.value.trim())) {
          email.closest('.form-group').classList.add('has-error');
          valid = false;
        }

        if (!valid) return;

        // Show Success Modal
        if (successModal) {
          successModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    }

    if (successModalClose) {
      successModalClose.addEventListener('click', () => {
        if (successModal) successModal.classList.remove('active');
        document.body.style.overflow = '';
        window.location.href = 'index.html';
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (invModal && invModal.classList.contains('open')) closeInventoryModal();
        if (successModal && successModal.classList.contains('active')) {
          successModal.classList.remove('active');
          document.body.style.overflow = '';
          window.location.href = 'index.html';
        }
      }
    });

    if (propSelect) {
      propSelect.addEventListener('change', updateCartSummary);
    }

    // Initial render
    renderCategoryCards();
    renderRoomTabs();
    renderInventoryItems();
    updateCartSummary();
  }

  document.addEventListener('DOMContentLoaded', initOrdersController);
})();
