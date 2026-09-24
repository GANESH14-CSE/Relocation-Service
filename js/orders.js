/**
 * MoveEase — Orders Controller (orders.js)
 * Implements: 3-stage journey on one page:
 * Stage 1: Service Collections Grid (8 interactive pick cards)
 * Stage 2: Selected Services Cart Panel ("YOUR MOVE") + Move Details & Indicative Range
 * Stage 3: Booking Form + Animated Success Modal
 */

(function () {
  'use strict';

  function initOrdersFlow() {
    const cards = document.querySelectorAll('.collection-pick-card');
    const cartPanel = document.getElementById('yourMoveCartPanel');
    const cartCount = document.getElementById('cartSelectedCount');
    const cartChipsWrap = document.getElementById('cartChipsContainer');
    const clearBtn = document.getElementById('cartClearBtn');
    const continueBtn = document.getElementById('cartContinueBtn');

    const moveDetailsSection = document.getElementById('moveDetailsSection');
    const bookingFormSection = document.getElementById('bookingFormSection');

    // Move Details inputs
    const pickupInput = document.getElementById('orderPickup');
    const destInput = document.getElementById('orderDest');
    const dateInput = document.getElementById('orderDate');
    const propSelect = document.getElementById('orderPropertyType');
    const itemsInput = document.getElementById('orderApproxItems');
    const specialInput = document.getElementById('orderSpecialReq');

    // Indicative Range display
    const rangeDisplay = document.getElementById('indicativeRangeText');
    const toBookingBtn = document.getElementById('proceedToBookingBtn');

    // Booking Form
    const bookingForm = document.getElementById('finalBookingForm');
    const summarySelectedServices = document.getElementById('summarySelectedServices');
    const summaryRouteSchedule = document.getElementById('summaryRouteSchedule');
    const summaryIndicativePrice = document.getElementById('summaryIndicativePrice');

    // Modal
    const modal = document.getElementById('ordersSuccessModal');
    const modalClose = document.getElementById('ordersModalCloseBtn');

    // State
    let selectedServices = [];

    // Service key mapping
    const serviceTitles = {
      'home': 'Home Moving',
      'office': 'Office Relocation',
      'car': 'Car Transport',
      'bike': 'Bike Transport',
      'furniture': 'Furniture Moving',
      'appliances': 'Appliance Moving',
      'packing': 'Packing Service',
      'storage': 'Storage Solutions'
    };

    // -------------------------------------------------------------------------
    // 1. URL QUERY PARAM PRE-SELECTION
    // -------------------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category');
    const initialOption = urlParams.get('option');

    if (initialCategory) {
      const mapped = serviceTitles[initialCategory] || 'Home Moving';
      selectedServices.push(mapped);
    } else {
      // Default initial selection
      selectedServices = ['Home Moving', 'Packing Service'];
    }

    // -------------------------------------------------------------------------
    // 2. RENDER CART & UPDATE CARDS
    // -------------------------------------------------------------------------
    function updateCartUI() {
      // Update cards selected state
      cards.forEach(card => {
        const title = card.querySelector('h3').textContent.trim();
        const btn = card.querySelector('.btn-select-service');
        if (selectedServices.includes(title)) {
          card.classList.add('selected');
          if (btn) btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Selected`;
        } else {
          card.classList.remove('selected');
          if (btn) btn.textContent = 'Select Service';
        }
      });

      // Update cart chips
      if (cartCount) {
        cartCount.textContent = `${selectedServices.length} service${selectedServices.length === 1 ? '' : 's'} selected`;
      }

      if (cartChipsWrap) {
        cartChipsWrap.innerHTML = '';
        selectedServices.forEach(srv => {
          const chip = document.createElement('span');
          chip.className = 'cart-service-chip';
          chip.innerHTML = `${srv} <button type="button" aria-label="Remove ${srv}">&times;</button>`;
          chip.querySelector('button').addEventListener('click', () => {
            selectedServices = selectedServices.filter(s => s !== srv);
            updateCartUI();
            calculateIndicativeEstimate();
          });
          cartChipsWrap.appendChild(chip);
        });
      }

      // Persist in sessionStorage
      try {
        sessionStorage.setItem('moveease_selected_orders', JSON.stringify(selectedServices));
      } catch (e) {}

      // Keep cart panel visible
      if (cartPanel) {
        cartPanel.style.display = selectedServices.length > 0 ? 'flex' : 'none';
      }

      calculateIndicativeEstimate();
    }

    // Toggle card selection
    cards.forEach(card => {
      card.addEventListener('click', function (e) {
        // Prevent double toggle if clicking button directly
        const title = this.querySelector('h3').textContent.trim();
        if (selectedServices.includes(title)) {
          selectedServices = selectedServices.filter(s => s !== title);
        } else {
          selectedServices.push(title);
        }
        updateCartUI();
      });
    });

    // Clear Selection
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        selectedServices = [];
        updateCartUI();
        if (moveDetailsSection) moveDetailsSection.classList.remove('active');
        if (bookingFormSection) bookingFormSection.classList.remove('active');
      });
    }

    // Continue to Move Details
    if (continueBtn) {
      continueBtn.addEventListener('click', function () {
        if (selectedServices.length === 0) {
          if (window.MoveEase && window.MoveEase.showToast) {
            window.MoveEase.showToast('Please select at least one service to continue.', 'info');
          }
          return;
        }

        if (moveDetailsSection) {
          moveDetailsSection.classList.add('active');
          moveDetailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // -------------------------------------------------------------------------
    // 3. INDICATIVE ESTIMATE CALCULATION
    // -------------------------------------------------------------------------
    function calculateIndicativeEstimate() {
      if (!rangeDisplay) return;

      if (selectedServices.length === 0) {
        rangeDisplay.textContent = '₹0';
        return;
      }

      let baseMin = 4500;
      let baseMax = 7500;

      // Service additions
      selectedServices.forEach(srv => {
        if (srv.includes('Home')) { baseMin += 3500; baseMax += 6000; }
        if (srv.includes('Office')) { baseMin += 6000; baseMax += 12000; }
        if (srv.includes('Car')) { baseMin += 7000; baseMax += 11000; }
        if (srv.includes('Bike')) { baseMin += 2500; baseMax += 4500; }
        if (srv.includes('Furniture')) { baseMin += 2000; baseMax += 3500; }
        if (srv.includes('Appliance')) { baseMin += 1500; baseMax += 3000; }
        if (srv.includes('Packing')) { baseMin += 2500; baseMax += 4000; }
        if (srv.includes('Storage')) { baseMin += 3500; baseMax += 5500; }
      });

      // Property type factor
      if (propSelect && propSelect.value) {
        const val = propSelect.value;
        if (val === '2bhk') { baseMin += 2000; baseMax += 3000; }
        if (val === '3bhk') { baseMin += 4500; baseMax += 6500; }
        if (val === '4bhk') { baseMin += 7500; baseMax += 11000; }
        if (val === 'villa') { baseMin += 10000; baseMax += 16000; }
        if (val === 'office') { baseMin += 8000; baseMax += 14000; }
      }

      const formattedRange = `₹${baseMin.toLocaleString('en-IN')} – ₹${baseMax.toLocaleString('en-IN')}`;
      rangeDisplay.textContent = formattedRange;

      if (summaryIndicativePrice) {
        summaryIndicativePrice.textContent = formattedRange;
      }
    }

    if (propSelect) {
      propSelect.addEventListener('change', calculateIndicativeEstimate);
    }

    // Proceed to Final Booking Form Step
    if (toBookingBtn) {
      toBookingBtn.addEventListener('click', function () {
        // Validate Move Details required fields
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

        // Populate summary in booking form
        if (summarySelectedServices) {
          summarySelectedServices.textContent = selectedServices.join(', ');
        }
        if (summaryRouteSchedule) {
          summaryRouteSchedule.textContent = `${pickupVal} ➔ ${destVal} (Date: ${dateVal})`;
        }

        if (bookingFormSection) {
          bookingFormSection.classList.add('active');
          bookingFormSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // -------------------------------------------------------------------------
    // 4. FINAL BOOKING SUBMISSION & MODAL
    // -------------------------------------------------------------------------
    if (bookingForm) {
      bookingForm.addEventListener('submit', function (e) {
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
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    }

    if (modalClose) {
      modalClose.addEventListener('click', function () {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        window.location.href = 'index.html';
      });
    }

    // Escape closes modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        window.location.href = 'index.html';
      }
    });

    // Initialize UI
    updateCartUI();
  }

  document.addEventListener('DOMContentLoaded', initOrdersFlow);
})();
