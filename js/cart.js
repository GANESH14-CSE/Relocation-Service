/**
 * MoveEase — Cart System (cart.js)
 * Handles add-to-cart functionality, cart dropdown display,
 * and cart item management across all pages.
 */

(function () {
  'use strict';

  const CART_STORAGE_KEY = 'moveease_cart';

  // -----------------------------------------------------------------------
  // Cart Data Management
  // -----------------------------------------------------------------------
  function getCart() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
    renderCartUI();
  }

  function addToCart(item) {
    const items = getCart();
    // Check if already in cart by id
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
      saveCart(items);
      if (window.MoveEase && window.MoveEase.showToast) {
        window.MoveEase.showToast(`"${item.name}" quantity updated in cart.`, 'success');
      }
    } else {
      item.qty = 1;
      items.push(item);
      saveCart(items);
      if (window.MoveEase && window.MoveEase.showToast) {
        window.MoveEase.showToast(`"${item.name}" added to cart!`, 'success');
      }
    }
    // Open cart dropdown briefly
    openCartDropdown();
  }

  function removeFromCart(itemId) {
    let items = getCart();
    const removed = items.find(i => i.id === itemId);
    items = items.filter(i => i.id !== itemId);
    saveCart(items);
    if (removed && window.MoveEase && window.MoveEase.showToast) {
      window.MoveEase.showToast(`"${removed.name}" removed from cart.`, 'info');
    }
  }

  function clearCart() {
    saveCart([]);
    if (window.MoveEase && window.MoveEase.showToast) {
      window.MoveEase.showToast('Cart cleared.', 'info');
    }
  }

  // -----------------------------------------------------------------------
  // Cart Dropdown UI
  // -----------------------------------------------------------------------
  function openCartDropdown() {
    const dropdown = document.getElementById('cartDropdown');
    if (dropdown) {
      dropdown.classList.add('open');
      // Auto-close after 4 seconds if user doesn't interact
      clearTimeout(window._cartAutoCloseTimer);
      window._cartAutoCloseTimer = setTimeout(() => {
        closeCartDropdown();
      }, 5000);
    }
  }

  function closeCartDropdown() {
    const dropdown = document.getElementById('cartDropdown');
    if (dropdown) dropdown.classList.remove('open');
  }

  function renderCartUI() {
    const items = getCart();
    const count = items.reduce((sum, item) => sum + (item.qty || 1), 0);

    // Update all badges (basket-badge)
    document.querySelectorAll('.basket-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });

    // Render dropdown body
    const body = document.getElementById('cartDropdownBody');
    const footer = document.getElementById('cartDropdownFooter');
    const emptyMsg = document.getElementById('cartEmptyMsg');

    if (!body) return;

    // Clear existing items (keep empty message)
    body.querySelectorAll('.cart-item').forEach(el => el.remove());

    if (items.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'flex';
      if (footer) footer.style.display = 'none';
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (footer) footer.style.display = 'block';

    items.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.setAttribute('data-id', item.id);

      cartItem.innerHTML = `
        <div class="cart-item-img-wrap">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
        </div>
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${item.price}</span>
          <span class="cart-item-qty">Qty: ${item.qty || 1}</span>
        </div>
        <button type="button" class="cart-item-remove" aria-label="Remove ${item.name} from cart" data-id="${item.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;

      body.appendChild(cartItem);
    });

    // Bind remove buttons
    body.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        removeFromCart(id);
      });
    });
  }

  // -----------------------------------------------------------------------
  // Initialization
  // -----------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    renderCartUI();

    // Toggle cart dropdown on basket button click
    const toggleBtns = document.querySelectorAll('.basket-btn, #cartToggleBtn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const dropdown = document.getElementById('cartDropdown');
        if (dropdown) {
          if (dropdown.classList.contains('open')) {
            closeCartDropdown();
          } else {
            openCartDropdown();
          }
        }
      });
    });

    // Close cart dropdown on close button click
    const closeBtn = document.getElementById('cartCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeCartDropdown();
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
      const dropdown = document.getElementById('cartDropdown');
      if (dropdown && dropdown.classList.contains('open')) {
        if (!dropdown.contains(e.target) && !e.target.closest('.basket-btn') && !e.target.closest('#cartToggleBtn')) {
          closeCartDropdown();
        }
      }
    });

    // Handle "Add to Cart" button clicks (services page)
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const price = this.getAttribute('data-price');
        const image = this.getAttribute('data-image');

        addToCart({ id, name, price, image });

        // Animate button
        this.classList.add('added');
        const origHTML = this.innerHTML;
        this.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Added!</span>
        `;
        setTimeout(() => {
          this.classList.remove('added');
          this.innerHTML = origHTML;
        }, 1800);
      });
    });
  });

  // Expose globally
  window.MoveEaseCart = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    openCartDropdown,
    closeCartDropdown,
    renderCartUI
  };

})();
