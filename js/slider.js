/**
 * MoveEase — Testimonial Carousel Slider (slider.js)
 * Clean, touch-friendly, vanilla JS carousel with touch gestures,
 * accessible keyboard controls, dot indicators, and auto-rotation.
 */

(function () {
  'use strict';

  function initTestimonialSlider() {
    const sliderWrap = document.querySelector('.testimonials-slider-container');
    if (!sliderWrap) return;

    const track = sliderWrap.querySelector('.slider-track');
    const slides = sliderWrap.querySelectorAll('.testimonial-slide');
    const prevBtn = sliderWrap.querySelector('.slider-prev');
    const nextBtn = sliderWrap.querySelector('.slider-next');
    const dotsContainer = sliderWrap.querySelector('.slider-dots');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoPlayTimer = null;
    const AUTO_PLAY_INTERVAL = 5500;

    // Create dot buttons
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
        dot.setAttribute('type', 'button');
        dot.setAttribute('aria-label', `Go to testimonial slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.slider-dot') : [];

    function updateSliderPosition() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.classList.add('active');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('active');
          dot.removeAttribute('aria-current');
        }
      });
    }

    function goToSlide(index) {
      if (index < 0) {
        currentIndex = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }
      updateSliderPosition();
      restartAutoplay();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Auto-play timer
    function startAutoplay() {
      stopAutoplay();
      autoPlayTimer = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
    }

    function stopAutoplay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    sliderWrap.addEventListener('mouseenter', stopAutoplay);
    sliderWrap.addEventListener('mouseleave', startAutoplay);

    // Touch & Swipe Support
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;

    sliderWrap.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      isSwiping = true;
      stopAutoplay();
    }, { passive: true });

    sliderWrap.addEventListener('touchmove', function (e) {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });

    sliderWrap.addEventListener('touchend', function () {
      if (!isSwiping) return;
      isSwiping = false;
      const diffX = startX - currentX;
      if (Math.abs(diffX) > 45 && currentX !== 0) {
        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      startX = 0;
      currentX = 0;
      startAutoplay();
    });

    // Keyboard navigation (Arrow keys when slider has focus)
    sliderWrap.setAttribute('tabindex', '0');
    sliderWrap.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    });

    // Start auto-play
    startAutoplay();
  }

  document.addEventListener('DOMContentLoaded', initTestimonialSlider);
})();
