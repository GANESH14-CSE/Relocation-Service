/**
 * MoveEase — Relocation Cost Estimator & Journey Logic (estimator.js)
 *
 * --------------------------------------------------------------------------
 * PRICING MODEL SPECIFICATION & TRANSPARENT FORMULA:
 * --------------------------------------------------------------------------
 * Total Estimate = Base Fare + (Distance * Rate Per Km) + Property Loading Factor + Selected Addons
 *
 * 1. BASE FARE:
 *    - Standard operational booking setup: ₹2,500
 *
 * 2. DISTANCE RATE:
 *    - Up to 30 km (Local Move)       : ₹35 / km
 *    - 31 km to 150 km (Suburban)     : ₹28 / km
 *    - Above 150 km (Intercity Move)  : ₹22 / km
 *
 * 3. PROPERTY SIZE MULTIPLIER / FLAT ADDITION:
 *    - 1BHK   : +₹3,000 (Small cargo volume, 1 truck load, 2 movers)
 *    - 2BHK   : +₹5,500 (Standard family apartment, 1 large truck, 3 movers)
 *    - 3BHK   : +₹8,500 (Heavy household items, 1 dedicated container, 4 movers)
 *    - 4BHK   : +₹12,000 (Extensive furniture, 2 trucks, 5 movers)
 *    - Villa  : +₹16,500 (Premium multi-story handling, heavy crating)
 *    - Office : +₹14,000 (Workstations, servers, filing cabinets, weekend crew)
 *
 * 4. OPTIONAL ADDONS:
 *    - Professional Packing (bubble, 5-ply cartons, stretch wrap): +₹3,500
 *    - Furniture Dismantling & Assembly (beds, wardrobes): +₹2,200
 *    - Secured Warehouse Storage (first 15 days included buffer): +₹4,000
 *
 * Output note requirement:
 * "Estimated price only. Final quote may vary after inspection."
 * --------------------------------------------------------------------------
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. ESTIMATOR FORM CONTROLLER
  // ---------------------------------------------------------------------------
  function initCostEstimator() {
    const form = document.getElementById('relocationEstimatorForm');
    if (!form) return;

    const pickupInput = document.getElementById('estPickup');
    const destInput = document.getElementById('estDestination');
    const propertySelect = document.getElementById('estPropertyType');
    const distanceInput = document.getElementById('estDistance');

    const optPacking = document.getElementById('optPacking');
    const optFurniture = document.getElementById('optFurniture');
    const optStorage = document.getElementById('optStorage');

    const resultCard = document.getElementById('estimatorResultCard');
    const displayPrice = document.getElementById('estDisplayTotal');
    const rowBase = document.getElementById('rowBaseFare');
    const rowDistance = document.getElementById('rowDistanceFare');
    const rowProperty = document.getElementById('rowPropertyFare');
    const rowAddons = document.getElementById('rowAddonsFare');
    const bookWithEstimateBtn = document.getElementById('bookWithEstimateBtn');

    // Helper: Clear inline errors
    function clearErrors() {
      form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('has-error');
      });
    }

    // Helper: Set inline error
    function setError(inputElement, message) {
      const group = inputElement.closest('.form-group');
      if (group) {
        group.classList.add('has-error');
        const errSpan = group.querySelector('.error-message');
        if (errSpan) errSpan.textContent = message;
      }
    }

    function calculateEstimate(e) {
      if (e) e.preventDefault();
      clearErrors();

      let isValid = true;
      const pickupVal = (pickupInput ? pickupInput.value : '').trim();
      const destVal = (destInput ? destInput.value : '').trim();
      const propertyVal = propertySelect ? propertySelect.value : '';
      const distanceVal = parseFloat(distanceInput ? distanceInput.value : 0);

      // Validation
      if (!pickupVal) {
        setError(pickupInput, 'Please enter pickup location');
        isValid = false;
      }

      if (!destVal) {
        setError(destInput, 'Please enter destination city/area');
        isValid = false;
      }

      if (!propertyVal) {
        setError(propertySelect, 'Please select property configuration');
        isValid = false;
      }

      if (isNaN(distanceVal) || distanceVal < 3 || distanceVal > 4000) {
        setError(distanceInput, 'Enter a realistic distance between 3 and 4,000 km');
        isValid = false;
      }

      if (!isValid) return;

      // Base Fare
      const BASE_FARE = 2500;

      // Distance Rate
      let distanceCost = 0;
      if (distanceVal <= 30) {
        distanceCost = distanceVal * 35;
      } else if (distanceVal <= 150) {
        distanceCost = 30 * 35 + (distanceVal - 30) * 28;
      } else {
        distanceCost = 30 * 35 + 120 * 28 + (distanceVal - 150) * 22;
      }

      // Property Type Loading Factor
      const propertyMultipliers = {
        '1bhk': 3000,
        '2bhk': 5500,
        '3bhk': 8500,
        '4bhk': 12000,
        'villa': 16500,
        'office': 14000
      };
      const propertyCost = propertyMultipliers[propertyVal] || 4000;

      // Addons
      let addonsCost = 0;
      const selectedAddonNames = [];

      if (optPacking && optPacking.checked) {
        addonsCost += 3500;
        selectedAddonNames.push('Premium Packing');
      }
      if (optFurniture && optFurniture.checked) {
        addonsCost += 2200;
        selectedAddonNames.push('Furniture Handling');
      }
      if (optStorage && optStorage.checked) {
        addonsCost += 4000;
        selectedAddonNames.push('Storage Buffer');
      }

      const totalEstimate = Math.round(BASE_FARE + distanceCost + propertyCost + addonsCost);

      // Render Results
      if (displayPrice) {
        displayPrice.textContent = `₹${totalEstimate.toLocaleString('en-IN')}`;
      }
      if (rowBase) rowBase.textContent = `₹${BASE_FARE.toLocaleString('en-IN')}`;
      if (rowDistance) rowDistance.textContent = `₹${Math.round(distanceCost).toLocaleString('en-IN')} (${distanceVal} km)`;
      if (rowProperty) rowProperty.textContent = `₹${propertyCost.toLocaleString('en-IN')}`;
      if (rowAddons) rowAddons.textContent = `₹${addonsCost.toLocaleString('en-IN')}`;

      if (resultCard) {
        resultCard.style.display = 'block';
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Store in sessionStorage to populate orders.html seamlessly
      const estimateData = {
        pickup: pickupVal,
        destination: destVal,
        propertyType: propertyVal,
        distance: distanceVal,
        total: totalEstimate,
        addons: selectedAddonNames
      };
      try {
        sessionStorage.setItem('moveease_active_estimate', JSON.stringify(estimateData));
      } catch (err) {}

      if (bookWithEstimateBtn) {
        bookWithEstimateBtn.onclick = function () {
          window.location.href = `orders.html?pickup=${encodeURIComponent(pickupVal)}&dest=${encodeURIComponent(destVal)}&prop=${encodeURIComponent(propertyVal)}&total=${totalEstimate}`;
        };
      }
    }

    form.addEventListener('submit', calculateEstimate);

    // Live update if already calculated once
    [propertySelect, distanceInput, optPacking, optFurniture, optStorage].forEach(el => {
      if (el) {
        el.addEventListener('change', () => {
          if (resultCard && resultCard.style.display !== 'none') {
            calculateEstimate();
          }
        });
      }
    });

    // Check URL parameters (e.g. from Home page floating quote box)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('pickup') && pickupInput) {
      pickupInput.value = urlParams.get('pickup');
    }
    if (urlParams.has('dest') && destInput) {
      destInput.value = urlParams.get('dest');
    }
    if (urlParams.has('prop') && propertySelect) {
      propertySelect.value = urlParams.get('prop');
    }
    if (urlParams.has('dist') && distanceInput) {
      distanceInput.value = urlParams.get('dist');
    }
    if (urlParams.get('autocalc') === 'true') {
      setTimeout(() => calculateEstimate(), 200);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. INTERACTIVE MOVING JOURNEY STEPPER
  // ---------------------------------------------------------------------------
  function initMovingJourney() {
    const journeyCards = document.querySelectorAll('.journey-step-card');
    const journeyTitle = document.getElementById('journeyActiveTitle');
    const journeyDesc = document.getElementById('journeyActiveDesc');
    const journeyImg = document.getElementById('journeyActiveImg');

    if (!journeyCards.length) return;

    const journeyData = [
      {
        title: 'Step 1: Current Home Survey & Custom Plan',
        desc: 'Our relocation supervisor conducts a thorough room-by-room inventory inspection, assessing fragile glassware, antiques, and heavy appliances to create a tailored moving itinerary.',
        img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Step 2: Scientific Multi-Layer Packing',
        desc: 'Trained packers use 5-ply corrugated sheets, virgin air bubble wrap, edge guards, and custom mattress covers to ensure zero abrasion or vibration damage during transit.',
        img: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Step 3: Secure Ergonomic Loading',
        desc: 'Heavy cargo is loaded using hydraulic lift gates and anchored with industrial ratchet tie-downs inside our shock-absorbed, sealed containerized trucks.',
        img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Step 4: GPS-Monitored Highway Transit',
        desc: 'All MoveEase carrier trucks feature real-time telematics, temperature monitoring, and twin-driver rotation for nonstop, safe transit between regional corridors.',
        img: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Step 5: Delivery & Settle In New Home',
        desc: 'We place each carton in its designated room, reassemble bed frames, position heavy wardrobes, and take back used packing materials for green recycling.',
        img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'
      }
    ];

    journeyCards.forEach((card, index) => {
      card.addEventListener('click', function () {
        journeyCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const data = journeyData[index];
        if (data) {
          if (journeyTitle) journeyTitle.textContent = data.title;
          if (journeyDesc) journeyDesc.textContent = data.desc;
          if (journeyImg) {
            journeyImg.src = data.img;
            journeyImg.alt = data.title;
          }
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 3. INTERACTIVE MOVING CHECKLIST WITH LOCALSTORAGE PERSISTENCE
  // ---------------------------------------------------------------------------
  function initMovingChecklist() {
    const checklistCard = document.querySelector('.checklist-widget-card');
    if (!checklistCard) return;

    const checkboxes = checklistCard.querySelectorAll('.checklist-checkbox');
    const progressBar = document.getElementById('checklistProgressBar');
    const progressText = document.getElementById('checklistProgressText');
    const STORAGE_KEY = 'moveease_checklist_state';

    // Load saved checklist state
    let savedState = {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) savedState = JSON.parse(stored);
    } catch (e) {}

    checkboxes.forEach((cb, idx) => {
      if (savedState[idx]) {
        cb.checked = true;
        const row = cb.closest('.checklist-item-row');
        if (row) row.classList.add('completed');
      }

      cb.addEventListener('change', function () {
        const row = this.closest('.checklist-item-row');
        if (this.checked) {
          if (row) row.classList.add('completed');
          savedState[idx] = true;
        } else {
          if (row) row.classList.remove('completed');
          delete savedState[idx];
        }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
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

  // Initialize all on DOM load
  document.addEventListener('DOMContentLoaded', function () {
    initCostEstimator();
    initMovingJourney();
    initMovingChecklist();
  });
})();
