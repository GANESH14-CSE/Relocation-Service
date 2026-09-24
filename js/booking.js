/**
 * MoveEase — Multi-Step Booking / Orders Controller (booking.js)
 * Implements: 5-step wizard navigation, per-step validation,
 * state persistence across steps, dynamic review generation,
 * accessible keyboard support, and simulated success modal.
 */

(function () {
  'use strict';

  function initBookingWizard() {
    const wizardContainer = document.querySelector('.booking-wizard-container');
    if (!wizardContainer) return;

    // Wizard navigation controls
    const stepTabs = wizardContainer.querySelectorAll('.wizard-step-tab');
    const stepPanels = wizardContainer.querySelectorAll('.wizard-step-content');
    const prevBtn = document.getElementById('bookingPrevBtn');
    const nextBtn = document.getElementById('bookingNextBtn');
    const submitBtn = document.getElementById('bookingSubmitBtn');

    // Success Modal
    const modalOverlay = document.getElementById('bookingSuccessModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalRefCode = document.getElementById('modalRefCode');

    let currentStep = 1;
    const totalSteps = 5;

    // Stored Booking State
    const bookingState = {
      pickupLocation: '',
      destinationLocation: '',
      moveDate: '',
      propertyType: '',
      services: [],
      roomsCount: '2 Rooms',
      approxBoxes: '15 - 25 Boxes',
      furnitureList: '',
      specialItems: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: ''
    };

    // -------------------------------------------------------------------------
    // 1. PRE-POPULATE FROM URL PARAMS OR BASKET
    // -------------------------------------------------------------------------
    function prefillFromExternal() {
      const urlParams = new URLSearchParams(window.location.search);

      const pickupField = document.getElementById('orderPickup');
      const destField = document.getElementById('orderDest');
      const propField = document.getElementById('orderPropertyType');

      if (urlParams.has('pickup') && pickupField) {
        pickupField.value = urlParams.get('pickup');
      }
      if (urlParams.has('dest') && destField) {
        destField.value = urlParams.get('dest');
      }
      if (urlParams.has('prop') && propField) {
        propField.value = urlParams.get('prop');
      }

      // Check Relocation Basket for selected services
      if (window.MoveEase && window.MoveEase.getBasket) {
        const basket = window.MoveEase.getBasket();
        if (basket.length > 0) {
          const serviceCheckboxes = document.querySelectorAll('input[name="selectedServices"]');
          serviceCheckboxes.forEach(cb => {
            if (basket.includes(cb.value)) {
              cb.checked = true;
            }
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 2. STEP VALIDATION LOGIC
    // -------------------------------------------------------------------------
    function clearStepErrors(stepIndex) {
      const activePanel = document.getElementById(`wizardStep${stepIndex}`);
      if (!activePanel) return;
      activePanel.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('has-error');
      });
    }

    function setFieldError(fieldId, message) {
      const field = document.getElementById(fieldId);
      if (!field) return;
      const group = field.closest('.form-group');
      if (group) {
        group.classList.add('has-error');
        const err = group.querySelector('.error-message');
        if (err) err.textContent = message;
      }
    }

    function validateStep(stepIndex) {
      clearStepErrors(stepIndex);
      let isValid = true;

      if (stepIndex === 1) {
        const pickup = document.getElementById('orderPickup');
        const dest = document.getElementById('orderDest');
        const date = document.getElementById('orderDate');
        const prop = document.getElementById('orderPropertyType');

        if (!pickup || !pickup.value.trim()) {
          setFieldError('orderPickup', 'Please enter your current pickup city & address');
          isValid = false;
        }
        if (!dest || !dest.value.trim()) {
          setFieldError('orderDest', 'Please enter your destination location');
          isValid = false;
        }
        if (!date || !date.value) {
          setFieldError('orderDate', 'Select your preferred moving date');
          isValid = false;
        } else {
          // Check if date is not in the past
          const selectedDate = new Date(date.value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            setFieldError('orderDate', 'Moving date cannot be in the past');
            isValid = false;
          }
        }
        if (!prop || !prop.value) {
          setFieldError('orderPropertyType', 'Select your property type');
          isValid = false;
        }

        if (isValid) {
          bookingState.pickupLocation = pickup.value.trim();
          bookingState.destinationLocation = dest.value.trim();
          bookingState.moveDate = date.value;
          bookingState.propertyType = prop.options[prop.selectedIndex].text;
        }
      } else if (stepIndex === 2) {
        const checkboxes = document.querySelectorAll('input[name="selectedServices"]:checked');
        const errorEl = document.getElementById('servicesSelectionError');

        if (checkboxes.length === 0) {
          if (errorEl) errorEl.style.display = 'block';
          isValid = false;
        } else {
          if (errorEl) errorEl.style.display = 'none';
          bookingState.services = Array.from(checkboxes).map(cb => cb.value);
        }
      } else if (stepIndex === 3) {
        const rooms = document.getElementById('orderRooms');
        const boxes = document.getElementById('orderBoxes');
        const furniture = document.getElementById('orderFurniture');
        const special = document.getElementById('orderSpecial');

        bookingState.roomsCount = rooms ? rooms.value : '2 Rooms';
        bookingState.approxBoxes = boxes ? boxes.value : '15 - 25 Boxes';
        bookingState.furnitureList = furniture ? furniture.value.trim() : 'None listed';
        bookingState.specialItems = special ? special.value.trim() : 'None';
      } else if (stepIndex === 4) {
        const name = document.getElementById('custName');
        const phone = document.getElementById('custPhone');
        const email = document.getElementById('custEmail');
        const address = document.getElementById('custAddress');

        if (!name || !name.value.trim()) {
          setFieldError('custName', 'Please provide your full name');
          isValid = false;
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanPhone = (phone ? phone.value.replace(/[\s-]/g, '') : '');
        if (!phoneRegex.test(cleanPhone)) {
          setFieldError('custPhone', 'Enter a valid 10-digit Indian phone number');
          isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.value.trim())) {
          setFieldError('custEmail', 'Enter a valid email address');
          isValid = false;
        }

        if (!address || !address.value.trim()) {
          setFieldError('custAddress', 'Please provide your street or landmark address');
          isValid = false;
        }

        if (isValid) {
          bookingState.customerName = name.value.trim();
          bookingState.customerPhone = cleanPhone;
          bookingState.customerEmail = email.value.trim();
          bookingState.customerAddress = address.value.trim();
        }
      }

      return isValid;
    }

    // -------------------------------------------------------------------------
    // 3. RENDER REVIEW SUMMARY (STEP 5)
    // -------------------------------------------------------------------------
    function populateReviewStep() {
      const revPickup = document.getElementById('revPickup');
      const revDest = document.getElementById('revDest');
      const revDate = document.getElementById('revDate');
      const revProperty = document.getElementById('revProperty');
      const revServices = document.getElementById('revServices');
      const revInventory = document.getElementById('revInventory');
      const revCustomer = document.getElementById('revCustomer');

      if (revPickup) revPickup.textContent = bookingState.pickupLocation;
      if (revDest) revDest.textContent = bookingState.destinationLocation;
      if (revDate) revDate.textContent = bookingState.moveDate;
      if (revProperty) revProperty.textContent = bookingState.propertyType;
      if (revServices) revServices.textContent = bookingState.services.join(', ') || 'Standard Transportation';
      if (revInventory) revInventory.textContent = `${bookingState.roomsCount}, ${bookingState.approxBoxes}. Furniture: ${bookingState.furnitureList || 'N/A'}`;
      if (revCustomer) revCustomer.textContent = `${bookingState.customerName} (${bookingState.customerPhone}, ${bookingState.customerEmail})`;

      // Setup Edit Links
      const editLinks = document.querySelectorAll('.edit-step-btn');
      editLinks.forEach(link => {
        link.onclick = function (e) {
          e.preventDefault();
          const target = parseInt(this.getAttribute('data-target-step'), 10);
          if (target >= 1 && target <= totalSteps) {
            goToStep(target);
          }
        };
      });
    }

    // -------------------------------------------------------------------------
    // 4. STEP NAVIGATION
    // -------------------------------------------------------------------------
    function goToStep(step) {
      currentStep = step;

      // Update tabs
      stepTabs.forEach((tab, idx) => {
        const stepNum = idx + 1;
        tab.classList.remove('active', 'completed');
        if (stepNum === currentStep) {
          tab.classList.add('active');
        } else if (stepNum < currentStep) {
          tab.classList.add('completed');
        }
      });

      // Update panels
      stepPanels.forEach((panel, idx) => {
        if (idx + 1 === currentStep) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });

      // Buttons visibility
      if (prevBtn) {
        prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
      }

      if (currentStep === totalSteps) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'inline-flex';
        populateReviewStep();
      } else {
        if (nextBtn) nextBtn.style.display = 'inline-flex';
        if (submitBtn) submitBtn.style.display = 'none';
      }

      // Scroll wizard into comfortable view
      wizardContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (validateStep(currentStep)) {
          goToStep(currentStep + 1);
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (currentStep > 1) {
          goToStep(currentStep - 1);
        }
      });
    }

    // -------------------------------------------------------------------------
    // 5. SIMULATED SUBMISSION & MODAL
    // -------------------------------------------------------------------------
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        // Generate random reference code
        const refNumber = `ME-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        if (modalRefCode) modalRefCode.textContent = refNumber;

        // Open modal
        if (modalOverlay) {
          modalOverlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }

        // Reset Move Basket
        if (window.MoveEase && window.MoveEase.saveBasket) {
          window.MoveEase.saveBasket([]);
        }
      });
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', function () {
        if (modalOverlay) {
          modalOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
        window.location.href = 'index.html';
      });
    }

    // Close modal on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        window.location.href = 'index.html';
      }
    });

    prefillFromExternal();
    goToStep(1);
  }

  document.addEventListener('DOMContentLoaded', initBookingWizard);
})();
