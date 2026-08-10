/* ==========================================================================
   NorthernGeek — Shared front-end behaviour
   Vanilla JS. Navbar toggle, FAQ accordion, reusable carousel, form helpers.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-question');
    if (!q) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(function (f) {
        f.classList.remove('open');
        var bq = f.querySelector('.faq-question');
        if (bq) bq.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Reusable carousel ----------
     data-carousel wrapper: .carousel-track, .carousel-prev,
     .carousel-next, .carousel-dots. Keyboard + touch swipe supported.
  ---------- */
  function initCarousel(wrap) {
    var track = wrap.querySelector('.carousel-track');
    var prevBtn = wrap.querySelector('.carousel-prev');
    var nextBtn = wrap.querySelector('.carousel-next');
    var dotsWrap = wrap.querySelector('.carousel-dots');
    if (!track) return;

    var slides = track.children;
    var total = slides.length;
    if (total <= 1) {
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
      return;
    }
    var index = 0;

    function go(i) {
      index = (i + total) % total;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      var dots = dotsWrap ? dotsWrap.querySelectorAll('.carousel-dot') : [];
      dots.forEach(function (d, j) { d.classList.toggle('active', j === index); });
      wrap.setAttribute('data-current', index);
    }

    if (dotsWrap) {
      for (var i = 0; i < total; i++) {
        (function (idx) {
          var d = document.createElement('button');
          d.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
          d.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
          d.addEventListener('click', function () { go(idx); });
          dotsWrap.appendChild(d);
        })(i);
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { go(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(index + 1); });

    wrap.setAttribute('tabindex', '0');
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    });

    var startX = null;
    wrap.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].clientX;
    }, { passive: true });
    wrap.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); }
      startX = null;
    }, { passive: true });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (wrap) {
    initCarousel(wrap);
  });

  /* ---------- Fade-in on scroll ---------- */
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && fadeEls.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.1 });
    fadeEls.forEach(function (el) { obs.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Simple form validation ----------
     Forms submit natively to the form backend (FormSubmit).
     This JS only adds friendlier inline validation; it never builds mailto.
  ---------- */
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isValidPhone(v) {
    var d = v.replace(/[\s\-+()]/g, '');
    return d.length >= 7 && d.length <= 15 && /^\d+$/.test(d);
  }

  function validateField(field) {
    var ok = true;
    var group = field.closest('.form-group');
    if (field.hasAttribute('required') && !field.value.trim()) ok = false;
    else if (field.type === 'email' && field.value.trim() && !isValidEmail(field.value.trim())) ok = false;
    else if (field.name === 'phone' && field.value.trim() && !isValidPhone(field.value.trim())) ok = false;
    else if ((field.type === 'textarea' || field.tagName === 'TEXTAREA') && field.hasAttribute('maxlength') && field.value.length > Number(field.getAttribute('maxlength'))) ok = false;
    if (group) group.classList.toggle('field-error', !ok);
    return ok;
  }

  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { validateField(f); });
      f.addEventListener('input', function () {
        var g = f.closest('.form-group');
        if (g && g.classList.contains('field-error')) validateField(f);
      });
    });
    form.addEventListener('submit', function (e) {
      var allOk = true;
      fields.forEach(function (f) {
        // Re-validate but ignore the honeypot
        if (f.name !== '_honey' && !validateField(f)) allOk = false;
      });
      if (!allOk) e.preventDefault();
      // Otherwise let the browser perform the native POST to FormSubmit.
    });
  });

  /* ---------- Accessible modal ----------
     data-modal attribute on a trigger opens the modal whose id it targets.
     Close: .modal-close button, Escape key, click on backdrop. Focus moves
     into the modal and is trapped while open, then restored.
  ---------- */
  function openModal(modal) {
    var lastFocus = document.activeElement;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');
    var first = modal.querySelector('input, select, textarea, button, [href]');
    if (first) first.focus();
    modal._lastFocus = lastFocus;
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    modal.setAttribute('aria-hidden', 'true');
    if (modal._lastFocus && modal._lastFocus.focus) modal._lastFocus.focus();
  }

  document.querySelectorAll('[data-modal-open]').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var id = trigger.getAttribute('data-modal-open');
      var modal = document.getElementById(id);
      if (modal) openModal(modal);
    });
  });

  document.querySelectorAll('.modal').forEach(function (modal) {
    modal.setAttribute('aria-hidden', 'true');
    var closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', function () { closeModal(modal); });
    modal.querySelectorAll('[data-modal-close]').forEach(function (c) {
      c.addEventListener('click', function () { closeModal(modal); });
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal(modal);
    });
    // Focus trap
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModal(modal); return; }
      if (e.key !== 'Tab' || !modal.classList.contains('active')) return;
      var focusables = modal.querySelectorAll('input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

