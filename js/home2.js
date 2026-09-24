/**
 * MoveEase — Home 2 Move Planner Logic (home2.js)
 * Implements: 8 Category interactive selection, dynamic detail panel expansion,
 * India map regional pins interaction, and 8-task moving checklist.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. 8 CATEGORY PLANNER INTERACTION
  // ---------------------------------------------------------------------------
  const categoryData = {
    home: {
      title: 'Home Relocation',
      subtitle: 'Apartments, independent houses, and villas with full-room packing.',
      options: ['1 BHK Apartment', '2 BHK Apartment', '3 BHK Apartment', '4 BHK / Duplex', 'Independent Villa'],
      services: ['Multi-Layer 5-Ply Packing', 'Furniture Dismantling & Assembly', 'Safe Loading & Unloading', 'Container Carrier Transit', 'Room-by-Room Unpacking', 'Transit Insurance'],
      ctaText: 'Plan My Home Move',
      param: 'home'
    },
    office: {
      title: 'Office Relocation',
      subtitle: 'Commercial workspaces, server racks, and archives with zero business downtime.',
      options: ['Small Office (1-10 Desks)', 'Medium Office (10-35 Desks)', 'Corporate HQ (35+ Desks)', 'Co-Working Floor'],
      services: ['Anti-Static IT Packaging', 'Cable & Desktop Tagging', 'Workstation Disassembly', 'Confidential File Crating', 'Weekend Phased Shifting'],
      ctaText: 'Plan Office Relocation',
      param: 'office'
    },
    car: {
      title: 'Car Transportation',
      subtitle: 'Door-to-door automobile transport in dedicated covered car carriers.',
      options: ['Hatchback', 'Premium Sedan', 'Compact SUV', 'Full-Size SUV', 'Luxury Car'],
      services: ['Hydraulic Ramp Loading', 'Four-Wheel Tie-Down Anchoring', 'Enclosed Weather Carrier', 'Pre-Move Condition Log', 'Live Highway Tracking'],
      ctaText: 'Move My Car',
      param: 'car'
    },
    bike: {
      title: 'Bike & Two-Wheeler Transport',
      subtitle: 'Scratch-proof crated transport for commuter bikes, sports bikes, and scooters.',
      options: ['Standard Commuter', 'Premium Sports Bike', 'Cruiser / Touring', 'Electric Scooter', 'Vintage Moped'],
      services: ['Mirror & Headlamp Dismantle', 'Foam & Bubble Wrapping', 'Wooden Crate Enclosure', 'Transit Insurance Protection', 'Fuel Drain Assistance'],
      ctaText: 'Move My Bike',
      param: 'bike'
    },
    furniture: {
      title: 'Furniture Moving',
      subtitle: 'Single or multi-piece heavy wooden, marble, and modular furniture transport.',
      options: ['Sofa & Recliners', 'Modular Bed & Mattress', 'Wardrobe & Cupboard', 'Dining Table & Chairs', 'TV Showcase Unit'],
      services: ['Hardware Screw Tagging', 'Quilted Moving Blanket Wrapping', 'Felt Edge Buffer Protection', 'Staircase Sling Transport', 'On-Site Re-Assembly'],
      ctaText: 'Move My Furniture',
      param: 'furniture'
    },
    appliances: {
      title: 'Appliance Moving',
      subtitle: 'Safe transit of refrigerators, washing machines, smart TVs, and kitchen units.',
      options: ['Double Door Refrigerator', 'Front Load Washing Machine', '55+ Inch Smart TV', 'Split AC Outdoor Unit', 'Dishwasher & Oven'],
      services: ['Drum Lock Screw Fitting', 'Anti-Shock Corner Blocks', 'Wooden TV Face Crating', 'Moisture Proof Film Wrap', 'Careful Leveling Placement'],
      ctaText: 'Move My Appliances',
      param: 'appliances'
    },
    small: {
      title: 'Small Items & Student Luggage',
      subtitle: 'Express delivery for 5-15 cartons, college relocations, or single room setups.',
      options: ['5-10 Carton Boxes', '10-20 Carton Boxes', 'Single Student Room', 'Urgent Consignment', 'Luggage Bags Only'],
      services: ['Heavy-Duty Box Supply', 'Priority Express Truck Pickup', 'Doorstep Pickup & Delivery', 'Barcode Tracking', 'Light Weight Discount'],
      ctaText: 'Move Small Items',
      param: 'small'
    },
    commercial: {
      title: 'Commercial Goods & Freight',
      subtitle: 'B2B freight, retail inventory, exhibition stalls, and warehouse pallet transfer.',
      options: ['Retail Stock Transfer', 'Exhibition Display Booth', 'Industrial Spare Machinery', 'Warehouse Pallet Lot', 'E-Commerce Batch Freight'],
      services: ['Palletizing & Stretch Wrap', 'Tailgate Hydraulic Lift', 'E-Way Bill Compliance', 'Scheduled Time-Slot Drop', 'Direct Lorry Freight'],
      ctaText: 'Move Commercial Goods',
      param: 'commercial'
    }
  };

  function initCategoryPlanner() {
    const cards = document.querySelectorAll('.planner-cat-card');
    const panel = document.getElementById('categoryDetailPanel');
    const panelTitle = document.getElementById('catPanelTitle');
    const panelSubtitle = document.getElementById('catPanelSubtitle');
    const optionsContainer = document.getElementById('catOptionsChips');
    const servicesContainer = document.getElementById('catServicesTags');
    const ctaBtn = document.getElementById('catPanelCta');

    if (!cards.length || !panel) return;

    let selectedOption = '';

    function selectCategory(catKey) {
      const data = categoryData[catKey];
      if (!data) return;

      cards.forEach(c => {
        if (c.getAttribute('data-cat') === catKey) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });

      if (panelTitle) panelTitle.textContent = data.title;
      if (panelSubtitle) panelSubtitle.textContent = data.subtitle;

      // Render options chips
      if (optionsContainer) {
        optionsContainer.innerHTML = '';
        selectedOption = data.options[0] || '';
        data.options.forEach((opt, idx) => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = `option-chip ${idx === 0 ? 'active' : ''}`;
          chip.textContent = opt;
          chip.addEventListener('click', function () {
            optionsContainer.querySelectorAll('.option-chip').forEach(ch => ch.classList.remove('active'));
            this.classList.add('active');
            selectedOption = opt;
            updateCtaUrl();
          });
          optionsContainer.appendChild(chip);
        });
      }

      // Render key services tags
      if (servicesContainer) {
        servicesContainer.innerHTML = '';
        data.services.forEach(srv => {
          const tag = document.createElement('span');
          tag.className = 'service-tag';
          tag.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> ${srv}`;
          servicesContainer.appendChild(tag);
        });
      }

      // Update CTA
      function updateCtaUrl() {
        if (ctaBtn) {
          ctaBtn.textContent = data.ctaText;
          ctaBtn.href = `orders.html?category=${encodeURIComponent(data.param)}&option=${encodeURIComponent(selectedOption)}`;
        }
      }
      updateCtaUrl();

      // Show panel smoothly
      panel.style.display = 'block';
    }

    cards.forEach(card => {
      card.addEventListener('click', function () {
        const cat = this.getAttribute('data-cat');
        if (cat) selectCategory(cat);
      });
    });

    // Default select first (Home)
    selectCategory('home');
  }

  // ---------------------------------------------------------------------------
  // 2. INDIA-WIDE MAP 15 CITIES INTERACTION
  // ---------------------------------------------------------------------------
  function initIndiaMap() {
    const pins = document.querySelectorAll('.india-city-pin');
    const statusCity = document.getElementById('indiaActiveCity');
    const statusNote = document.getElementById('indiaActiveNote');

    if (!pins.length) return;

    const cityDetails = {
      chennai: { name: 'Chennai Central Hub', note: 'Southern headquarters with 45+ daily scheduled carrier departures and storage bays.' },
      bangalore: { name: 'Bangalore Tech Corridor Hub', note: 'Primary IT relocation corridor connecting Whitefield, Electronic City, and Koramangala.' },
      hyderabad: { name: 'Hyderabad Cyber Hub', note: 'HITEC City and Secunderabad residential & office express logistics center.' },
      mumbai: { name: 'Mumbai Western Express Depot', note: 'Serving MMR, Navi Mumbai, and Thane with dedicated interstate container trucks.' },
      delhi: { name: 'Delhi NCR Logistics Center', note: 'Connecting Gurgaon, Noida, and South Delhi with secure pan-India routes.' },
      pune: { name: 'Pune Regional Depot', note: 'Hinjawadi IT park, industrial corridors, and residential household shifts.' },
      coimbatore: { name: 'Coimbatore Hub', note: 'Key textile & manufacturing hub with direct lines to Salem, Trichy, and Kerala.' },
      madurai: { name: 'Madurai Southern Depot', note: 'South Tamil Nadu consolidation warehouse connecting southern districts.' },
      salem: { name: 'Salem Transit Hub', note: 'Central highway transit junction facilitating interstate truck cross-docking.' },
      kochi: { name: 'Kochi Coastal Hub', note: 'Ernakulam and coastal Kerala relocation terminal with climate crating.' },
      kolkata: { name: 'Kolkata Eastern Depot', note: 'Eastern corridor gateway linking Howrah, Salt Lake, and regional centers.' },
      ahmedabad: { name: 'Ahmedabad Logistics Hub', note: 'Gujarat industrial transit terminal with regular express truck schedules.' },
      jaipur: { name: 'Jaipur Northern Corridor', note: 'Connecting Rajasthan residential shifts to Delhi NCR and Western India.' },
      trichy: { name: 'Trichy Delta Hub', note: 'Delta district moving services with doorstep packing and verified movers.' },
      pondicherry: { name: 'Pondicherry Coastal Depot', note: 'Express fragile-safe transit connecting ECR and Puducherry residential hubs.' }
    };

    pins.forEach(pin => {
      pin.addEventListener('click', function () {
        const cityKey = this.getAttribute('data-city');
        const info = cityDetails[cityKey];
        if (info) {
          if (statusCity) statusCity.textContent = info.name;
          if (statusNote) statusNote.textContent = info.note;

          // Pulse highlight
          pins.forEach(p => p.classList.remove('selected'));
          this.classList.add('selected');
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 3. 8-TASK MOVING CHECKLIST (With live progress text & progress bar)
  // ---------------------------------------------------------------------------
  function initMovingChecklist() {
    const checkboxes = document.querySelectorAll('.checklist-8-checkbox');
    const progressBar = document.getElementById('checklist8Bar');
    const progressText = document.getElementById('checklist8Text');
    const STORAGE_KEY = 'moveease_home2_checklist';

    if (!checkboxes.length) return;

    let saved = {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) saved = JSON.parse(stored);
    } catch (e) {}

    checkboxes.forEach((cb, idx) => {
      if (saved[idx]) {
        cb.checked = true;
        const parent = cb.closest('.checklist-item-row');
        if (parent) parent.classList.add('completed');
      }

      cb.addEventListener('change', function () {
        const parent = this.closest('.checklist-item-row');
        if (this.checked) {
          if (parent) parent.classList.add('completed');
          saved[idx] = true;
        } else {
          if (parent) parent.classList.remove('completed');
          delete saved[idx];
        }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch (e) {}

        updateProgress();
      });
    });

    function updateProgress() {
      const total = checkboxes.length;
      let completed = 0;
      checkboxes.forEach(cb => {
        if (cb.checked) completed++;
      });

      const percentage = Math.round((completed / total) * 100);
      if (progressBar) progressBar.style.width = `${percentage}%`;
      if (progressText) progressText.textContent = `${completed} of ${total} tasks completed (${percentage}%)`;
    }

    updateProgress();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCategoryPlanner();
    initIndiaMap();
    initMovingChecklist();
  });
})();
