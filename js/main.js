/**
 * MoveEase — Core Main JavaScript (main.js)
 * Modular IIFE to prevent global namespace pollution.
 * Handles: Sticky navigation, Mobile drawer, Active link detection,
 * Scroll-reveal IntersectionObserver, Animated stat counters,
 * Toast notification system, and Relocation Basket management.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. DOM REFERENCES & STATE
  // ---------------------------------------------------------------------------
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileOverlay = document.querySelector('.mobile-drawer-overlay');
  const mobileCloseBtn = document.querySelector('.mobile-close-btn');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const basketBadges = document.querySelectorAll('.basket-badge');
  const basketBtns = document.querySelectorAll('.basket-btn');

  // Relocation Basket State (Saved in localStorage for cross-page persistence)
  const BASKET_STORAGE_KEY = 'moveease_basket';

  function getBasket() {
    try {
      const stored = localStorage.getItem(BASKET_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveBasket(items) {
    try {
      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
    updateBasketUI();
  }

  function updateBasketUI() {
    const items = getBasket();
    const count = items.length;
    basketBadges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // ---------------------------------------------------------------------------
  // 2. TOAST NOTIFICATION UTILITY
  // ---------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
    
    // Hand-coded inline SVG icon for toast
    const iconSvg = type === 'success'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 250ms ease forwards';
      setTimeout(() => toast.remove(), 260);
    }, 3500);
  }

  // Expose toast & basket globally for other modules (booking, services)
  window.MoveEase = {
    showToast,
    getBasket,
    saveBasket,
    addToBasket(serviceName) {
      const items = getBasket();
      if (!items.includes(serviceName)) {
        items.push(serviceName);
        saveBasket(items);
        showToast(`"${serviceName}" added to your move plan.`, 'success');
      } else {
        showToast(`"${serviceName}" is already in your move plan.`, 'info');
      }
    },
    removeFromBasket(serviceName) {
      let items = getBasket();
      items = items.filter(i => i !== serviceName);
      saveBasket(items);
      showToast(`"${serviceName}" removed from your move plan.`, 'info');
    }
  };

  // ---------------------------------------------------------------------------
  // 3. STICKY HEADER SCROLL EFFECT
  // ---------------------------------------------------------------------------
  function handleScrollHeader() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScrollHeader, { passive: true });
  handleScrollHeader(); // Initialize on load

  // ---------------------------------------------------------------------------
  // 4. MOBILE DRAWER NAVIGATION & FOCUS TRAPPING
  // ---------------------------------------------------------------------------
  function openMobileMenu() {
    if (!mobileDrawer || !mobileToggle) return;
    mobileDrawer.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Focus first link in drawer for keyboard accessibility
    const firstFocusable = mobileDrawer.querySelector('button, a');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeMobileMenu() {
    if (!mobileDrawer || !mobileToggle) return;
    mobileDrawer.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', closeMobileMenu);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close on Escape key press
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeMobileMenu();
      mobileToggle.focus();
    }
  });

  // ---------------------------------------------------------------------------
  // 5. ACTIVE PAGE DETECTION
  // ---------------------------------------------------------------------------
  function highlightActivePage() {
    const currentPath = window.location.pathname.toLowerCase();
    const pageName = currentPath.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const targetPage = href.split('/').pop().split('?')[0].split('#')[0];

      if (pageName === targetPage || (pageName === '' && targetPage === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 6. SCROLL REVEAL VIA INTERSECTION OBSERVER
  // ---------------------------------------------------------------------------
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -10px 0px',
      threshold: 0.05
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // ---------------------------------------------------------------------------
  // 7. ANIMATED STAT COUNTERS (Fires Once Upon Viewport Entry)
  // ---------------------------------------------------------------------------
  function initStatCounters() {
    const statElements = document.querySelectorAll('.stat-number[data-target]');
    if (!statElements.length) return;

    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetValue = parseFloat(el.getAttribute('data-target')) || 0;
          const suffix = el.getAttribute('data-suffix') || '';
          const prefix = el.getAttribute('data-prefix') || '';
          const duration = 1600; // ms
          const startTime = performance.now();

          function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentNum = Math.floor(easeProgress * targetValue);

            el.textContent = `${prefix}${currentNum.toLocaleString()}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = `${prefix}${targetValue.toLocaleString()}${suffix}`;
            }
          }

          requestAnimationFrame(updateCount);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.35 });

    statElements.forEach(stat => counterObserver.observe(stat));
  }

  // ---------------------------------------------------------------------------
  // 8. PROCESS TIMELINE DRAWING LINE TRIGGER
  // ---------------------------------------------------------------------------
  function initProcessLineDraw() {
    const drawLine = document.querySelector('.process-line-draw');
    if (!drawLine) return;

    const lineObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          drawLine.classList.add('is-drawn');
          obs.unobserve(drawLine);
        }
      });
    }, { threshold: 0.25 });

    lineObserver.observe(drawLine);
  }

  // ---------------------------------------------------------------------------
  // 9. SERVICE AREA INTERACTIVE REGIONAL PINS (index.html)
  // ---------------------------------------------------------------------------
  function initServiceAreas() {
    const pins = document.querySelectorAll('.map-pin');
    const pills = document.querySelectorAll('.city-pill');
    const statusCity = document.getElementById('mapStatusCity');
    const statusNote = document.getElementById('mapStatusNote');

    if (!pins.length && !pills.length) return;

    const cityData = {
      chennai: { name: 'Chennai Hub', note: 'Primary Headquarters. 45+ daily active carrier trucks & 4 local dispatch depots.' },
      bangalore: { name: 'Bangalore Hub', note: 'Tech park & residential express corridor. 24/7 dedicated fleet support.' },
      hyderabad: { name: 'Hyderabad Hub', note: 'HITEC City & Secunderabad full relocation coverage with climate storage.' },
      coimbatore: { name: 'Coimbatore Hub', note: 'Industrial & household logistics center. Regular interstate dispatch.' },
      madurai: { name: 'Madurai Hub', note: 'South Tamil Nadu regional hub. Direct connections to Tirunelveli & Salem.' },
      salem: { name: 'Salem Hub', note: 'Strategic central transit warehouse & packaging distribution hub.' },
      trichy: { name: 'Trichy Hub', note: 'Delta region hub offering verified household moving & warehousing.' },
      pondicherry: { name: 'Pondicherry Hub', note: 'Coastal relocation express line with safe fragile item transit.' }
    };

    function selectCity(cityKey) {
      const data = cityData[cityKey.toLowerCase()];
      if (!data) return;

      if (statusCity) statusCity.textContent = data.name;
      if (statusNote) statusNote.textContent = data.note;

      // Update active pills
      pills.forEach(pill => {
        if (pill.getAttribute('data-city') === cityKey) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }

    pins.forEach(pin => {
      pin.addEventListener('click', function () {
        const city = this.getAttribute('data-city');
        if (city) selectCity(city);
      });
    });

    pills.forEach(pill => {
      pill.addEventListener('click', function () {
        const city = this.getAttribute('data-city');
        if (city) selectCity(city);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 10. BASKET BUTTON CLICK REDIRECT TO ORDERS
  // ---------------------------------------------------------------------------
  if (basketBtns.length) {
    basketBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        window.location.href = 'orders.html';
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 11. THEME (DARK/LIGHT) & RTL SUPPORT
  // ---------------------------------------------------------------------------
  function initThemeAndRTL() {
    const themeBtns = document.querySelectorAll('.theme-toggle-btn');
    const rtlBtns = document.querySelectorAll('.rtl-toggle-btn');

    function applyTheme(theme, showNotice = false) {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        if (document.body) document.body.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
        if (document.body) document.body.classList.remove('dark-mode');
      }

      themeBtns.forEach(btn => {
        const sunIcons = btn.querySelectorAll('.sun-icon');
        const moonIcons = btn.querySelectorAll('.moon-icon');
        if (theme === 'dark') {
          sunIcons.forEach(i => i.style.display = 'none');
          moonIcons.forEach(i => i.style.display = 'block');
          btn.setAttribute('aria-label', 'Switch to light mode');
          btn.setAttribute('title', 'Switch to Light Mode');
        } else {
          sunIcons.forEach(i => i.style.display = 'block');
          moonIcons.forEach(i => i.style.display = 'none');
          btn.setAttribute('aria-label', 'Switch to dark mode');
          btn.setAttribute('title', 'Switch to Dark Mode');
        }
      });

      try {
        localStorage.setItem('moveease_theme', theme);
      } catch (e) {}

      if (showNotice && window.MoveEase && window.MoveEase.showToast) {
        window.MoveEase.showToast(theme === 'dark' ? 'Dark Mode activated' : 'Light Mode activated', 'info');
      }
    }

    function applyRTL(dir, showNotice = false) {
      document.documentElement.setAttribute('dir', dir);
      if (dir === 'rtl') {
        document.documentElement.classList.add('rtl-mode');
        if (document.body) document.body.classList.add('rtl-mode');
        rtlBtns.forEach(btn => {
          btn.classList.add('is-active');
          btn.setAttribute('aria-label', 'Switch to LTR layout');
          btn.setAttribute('title', 'Switch to LTR (Left-to-Right) layout');
        });
      } else {
        document.documentElement.classList.remove('rtl-mode');
        if (document.body) document.body.classList.remove('rtl-mode');
        rtlBtns.forEach(btn => {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-label', 'Switch to RTL layout');
          btn.setAttribute('title', 'Switch to RTL (Right-to-Left) layout');
        });
      }

      try {
        localStorage.setItem('moveease_direction', dir);
      } catch (e) {}

      if (showNotice && window.MoveEase && window.MoveEase.showToast) {
        window.MoveEase.showToast(dir === 'rtl' ? 'RTL Layout activated' : 'LTR Layout activated', 'info');
      }
    }

    // Attach listeners
    themeBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
      });
    });

    rtlBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const current = document.documentElement.getAttribute('dir') || 'ltr';
        const next = current === 'rtl' ? 'ltr' : 'rtl';
        applyRTL(next, true);
      });
    });

    // Initial sync
    let initialTheme = 'light';
    try {
      initialTheme = localStorage.getItem('moveease_theme') || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (e) {}
    applyTheme(initialTheme, false);

    let initialDir = 'ltr';
    try {
      initialDir = localStorage.getItem('moveease_direction') || 'ltr';
    } catch (e) {}
    applyRTL(initialDir, false);
  }

  // ---------------------------------------------------------------------------
  // 12. INITIALIZATION ON DOM READY
  // ---------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    highlightActivePage();
    initScrollReveal();
    initStatCounters();
    initProcessLineDraw();
    initServiceAreas();
    updateBasketUI();
    initThemeAndRTL();
  });

})();

