(function () {
  'use strict';

  /* =======================================================
     1. DARK / LIGHT MODE
     ======================================================= */
  var root        = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var STORAGE_KEY = 'portfolio-theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'
    );
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  var prefersDark = window.matchMedia &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches;

  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  themeToggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  });

  /* =======================================================
     2. MOBILE MENU
     ======================================================= */
  var nav        = document.getElementById('nav');
  var menuToggle = document.getElementById('menuToggle');
  var navLinks   = document.getElementById('navLinks');

  function closeMenu() {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka menu');
  }

  menuToggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) {
      closeMenu();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) closeMenu();
  });

  /* =======================================================
     3. SCROLL REVEAL (IntersectionObserver)
        → rootMargin lebih longgar agar animasi mulai lebih awal,
          dan elemen baru muncul setelah benar-benar terlihat.
     ======================================================= */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -60px 0px'
    });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* =======================================================
     4. ACTIVE NAV LINK (Scroll Spy)
     ======================================================= */
  var sections = document.querySelectorAll('main section[id]');
  var linkMap  = {};

  navLinks.querySelectorAll('a').forEach(function (link) {
    var id = link.getAttribute('href').replace('#', '');
    linkMap[id] = link;
  });

  function setActive(id) {
    navLinks.querySelectorAll('a').forEach(function (l) {
      l.classList.remove('is-active');
    });
    if (linkMap[id]) linkMap[id].classList.add('is-active');
  }

  if ('IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, {
      rootMargin: '-45% 0px -50% 0px',
      threshold: 0
    });

    sections.forEach(function (s) { spyObserver.observe(s); });
  }

  /* =======================================================
     5. PROGRESS BAR + BACK TO TOP
     ======================================================= */
  var progressBar = document.getElementById('progressBar');
  var toTop       = document.getElementById('toTop');
  var ticking     = false;

  function onScroll() {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var scrolled  = window.scrollY || window.pageYOffset;

    progressBar.style.width =
      (docHeight > 0 ? (scrolled / docHeight) * 100 : 0) + '%';

    toTop.classList.toggle('is-visible', scrolled > 400);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* =======================================================
     6. FORM VALIDATION
     ======================================================= */
  var form       = document.getElementById('contactForm');
  var successBox = document.getElementById('formSuccess');
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var rules = {
    nama: {
      test: function (v) { return v.trim().length >= 3; },
      msg:  'Nama minimal 3 karakter.'
    },
    email: {
      test: function (v) { return emailRegex.test(v.trim()); },
      msg:  'Masukkan alamat email yang valid.'
    },
    subjek: {
      test: function (v) { return v.trim().length >= 3; },
      msg:  'Subjek minimal 3 karakter.'
    },
    pesan: {
      test: function (v) { return v.trim().length >= 10; },
      msg:  'Pesan minimal 10 karakter.'
    }
  };

  function validateField(input) {
    var rule = rules[input.name];
    if (!rule) return true;

    var field = input.closest('[data-field]');
    var error = field.querySelector('.error');
    var valid = rule.test(input.value);

    field.classList.toggle('is-invalid', !valid);
    error.textContent = valid ? '' : rule.msg;
    return valid;
  }

  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    if (!input) return;

    input.addEventListener('blur', function () { validateField(input); });

    input.addEventListener('input', function () {
      if (input.closest('[data-field]').classList.contains('is-invalid')) {
        validateField(input);
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var isValid  = true;
    var firstBad = null;

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      if (!validateField(input)) {
        isValid = false;
        if (!firstBad) firstBad = input;
      }
    });

    if (!isValid) {
      successBox.classList.remove('is-visible');
      if (firstBad) firstBad.focus();
      return;
    }

    /* ---------------------------------------------------
       Integrasi backend: ganti blok ini dengan fetch()
       ke Formspree / EmailJS / endpoint milikmu.

       Contoh:
       fetch('https://formspree.io/f/XXXX', {
         method: 'POST',
         headers: { 'Accept': 'application/json' },
         body: new FormData(form)
       });
       --------------------------------------------------- */

    successBox.classList.add('is-visible');
    form.reset();

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      var field = input.closest('[data-field]');
      field.classList.remove('is-invalid');
      field.querySelector('.error').textContent = '';
    });

    setTimeout(function () {
      successBox.classList.remove('is-visible');
    }, 6000);
  });

  /* =======================================================
     7. TAHUN OTOMATIS DI FOOTER
     ======================================================= */
  document.getElementById('year').textContent = new Date().getFullYear();

})();