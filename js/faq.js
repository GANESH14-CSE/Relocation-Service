/**
 * MoveEase — FAQ Accordion Logic (faq.js)
 * Implements accessible, animated accordion where only one item
 * is open at any time. Supports Enter/Space key toggling.
 */

(function () {
  'use strict';

  function initFaqAccordion() {
    const faqList = document.querySelector('.faq-list');
    if (!faqList) return;

    const items = faqList.querySelectorAll('.faq-item');

    items.forEach((item, index) => {
      const questionBtn = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      if (!questionBtn || !answer) return;

      // Assign unique accessibility attributes
      const questionId = `faq-q-${index + 1}`;
      const answerId = `faq-a-${index + 1}`;

      questionBtn.setAttribute('id', questionId);
      questionBtn.setAttribute('aria-controls', answerId);
      questionBtn.setAttribute('aria-expanded', 'false');
      answer.setAttribute('id', answerId);
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-labelledby', questionId);

      // Open first item by default for great initial presentation
      if (index === 0) {
        openItem(item, questionBtn, answer);
      }

      questionBtn.addEventListener('click', function () {
        const isOpen = item.classList.contains('active');
        // Close all items
        closeAllItems();

        // If wasn't open, open it
        if (!isOpen) {
          openItem(item, questionBtn, answer);
        }
      });
    });

    function openItem(item, button, answer) {
      item.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }

    function closeItem(item, button, answer) {
      item.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = '0px';
    }

    function closeAllItems() {
      items.forEach(it => {
        const btn = it.querySelector('.faq-question');
        const ans = it.querySelector('.faq-answer');
        if (btn && ans) {
          closeItem(it, btn, ans);
        }
      });
    }

    // Auto adjust height on window resize
    window.addEventListener('resize', function () {
      const activeItem = faqList.querySelector('.faq-item.active');
      if (activeItem) {
        const answer = activeItem.querySelector('.faq-answer');
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initFaqAccordion);
})();
