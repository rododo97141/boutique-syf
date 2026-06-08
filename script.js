/* =============================================
   SYFIR — Le Cocktail Libre
   script.js — Interactions & Animations
   ============================================= */

'use strict';

/* ===== NAVBAR SCROLL ===== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ===== BURGER / MOBILE NAV ===== */
(function initMobileNav() {
  const burgerBtn  = document.getElementById('burgerBtn');
  const mobileNav  = document.getElementById('mobileNav');
  const closeBtn   = document.getElementById('closeNav');
  if (!burgerBtn || !mobileNav) return;

  function open()  {
    mobileNav.classList.add('open');
    burgerBtn.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    mobileNav.classList.remove('open');
    burgerBtn.classList.remove('active');
    document.body.style.overflow = '';
  }

  burgerBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  window.closeMobileNav = close;
})();

/* ===== REVEAL ON SCROLL ===== */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => io.observe(el));
})();

/* ===== COUNTER ANIMATION ===== */
(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2200;
    const suffix   = el.dataset.suffix || '';
    const start    = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(eased * target);
      el.textContent = target >= 1000
        ? value.toLocaleString('fr-FR') + '+' + suffix
        : value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
})();

/* ===== SMOOTH SCROLL for nav links ===== */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = document.querySelector('.navbar')?.offsetHeight || 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ===== CART LOGIC ===== */
(function initCart() {
  const cartFab    = document.getElementById('cartFab');
  const cartCount  = document.getElementById('cartCount');
  const cartToast  = document.getElementById('cartToast');
  const cartMsg    = document.getElementById('cartToastMsg');

  let count   = 0;
  let toastTimer = null;

  function showToast(name) {
    if (cartMsg) cartMsg.textContent = `"${name}" ajouté au panier`;
    if (cartToast) {
      cartToast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => cartToast.classList.remove('show'), 3200);
    }
  }

  function updateCartFab() {
    if (!cartFab || !cartCount) return;
    cartFab.style.display = count > 0 ? 'flex' : 'none';
    cartCount.textContent  = count;
  }

  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', function () {
      const name  = this.dataset.name  || 'Produit';

      count++;
      updateCartFab();
      showToast(name);

      this.classList.add('added');
      const icon = this.querySelector('i');
      if (icon) icon.className = 'fas fa-check';
      const originalText = this.innerHTML;

      setTimeout(() => {
        this.classList.remove('added');
        if (icon) icon.className = 'fas fa-shopping-bag';
      }, 2000);
    });
  });

  if (cartFab) {
    cartFab.addEventListener('click', () => {
      document.querySelector('#boutique')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
})();

/* ===== TESTIMONIALS SLIDER ===== */
(function initSlider() {
  const track = document.getElementById('testimonialsTrack');
  const dots  = document.querySelectorAll('.dot');
  const prev  = document.getElementById('prevBtn');
  const next  = document.getElementById('nextBtn');
  if (!track) return;

  const cards      = track.querySelectorAll('.tcard');
  const total      = cards.length;
  let   current    = 0;
  let   autoTimer  = null;
  let   isDesktop  = window.innerWidth > 860;

  function getVisibleCount() {
    return window.innerWidth > 860 ? 3 : 1;
  }

  function goTo(index) {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, total - visible);
    current = Math.max(0, Math.min(index, maxIndex));

    if (visible === 1) {
      const cardWidth = cards[0]?.offsetWidth || 0;
      const gap = 28;
      track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
    } else {
      track.style.transform = 'translateX(0)';
    }

    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  function nextSlide() { goTo(current + 1 >= total ? 0 : current + 1); }
  function prevSlide() { goTo(current - 1 < 0 ? total - 1 : current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(nextSlide, 4800);
  }
  function stopAuto() { clearInterval(autoTimer); }

  if (prev) prev.addEventListener('click', () => { prevSlide(); startAuto(); });
  if (next) next.addEventListener('click', () => { nextSlide(); startAuto(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index, 10));
      startAuto();
    });
  });

  /* Touch / swipe */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? nextSlide() : prevSlide();
    startAuto();
  });

  /* Pause on hover */
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  window.addEventListener('resize', () => {
    isDesktop = window.innerWidth > 860;
    goTo(current);
  });

  startAuto();
  goTo(0);
})();

/* ===== CONTACT FORM VALIDATION ===== */
(function initForm() {
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  const rules = {
    firstName:   { required: true, minLen: 2,  label: 'Le prénom' },
    lastName:    { required: true, minLen: 2,  label: 'Le nom' },
    email:       { required: true, email: true, label: 'L\'email' },
    phone:       { required: false, phone: true, label: 'Le téléphone' },
    requestType: { required: true, label: 'Le type de demande' },
    message:     { required: true, minLen: 15, label: 'Le message' },
  };

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }
  function validatePhone(v) {
    if (!v.trim()) return true;
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(v.replace(/\s/g,''));
  }

  function getError(field, value) {
    const rule = rules[field];
    if (!rule) return '';
    const v = value.trim();

    if (rule.required && !v) return `${rule.label} est requis.`;
    if (v && rule.minLen && v.length < rule.minLen)
      return `${rule.label} doit contenir au moins ${rule.minLen} caractères.`;
    if (v && rule.email && !validateEmail(v))
      return 'Veuillez saisir un email valide.';
    if (v && rule.phone && !validatePhone(v))
      return 'Veuillez saisir un numéro de téléphone valide.';
    return '';
  }

  function showFieldError(fieldName, msg) {
    const input = form.querySelector(`[name="${fieldName}"]`);
    const errEl = document.getElementById(`${fieldName}Error`);
    if (!input || !errEl) return;
    errEl.textContent = msg;
    input.classList.toggle('error', !!msg);
  }

  function validateAll() {
    let valid = true;
    Object.keys(rules).forEach(field => {
      const input = form.querySelector(`[name="${field}"]`);
      if (!input) return;
      const msg = getError(field, input.value);
      showFieldError(field, msg);
      if (msg) valid = false;
    });
    return valid;
  }

  /* Live validation on blur */
  Object.keys(rules).forEach(field => {
    const input = form.querySelector(`[name="${field}"]`);
    if (!input) return;
    input.addEventListener('blur', () => {
      showFieldError(field, getError(field, input.value));
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('error'))
        showFieldError(field, getError(field, input.value));
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateAll()) return;

    /* Simulate async send */
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    submitBtn.disabled = true;
    if (btnText)    btnText.style.display    = 'none';
    if (btnLoading) btnLoading.style.display = 'flex';

    setTimeout(() => {
      submitBtn.disabled = false;
      if (btnText)    btnText.style.display    = '';
      if (btnLoading) btnLoading.style.display = 'none';

      if (successMsg) {
        successMsg.style.display = 'flex';
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      form.reset();
    }, 1800);
  });
})();

/* ===== HERO PARALLAX ===== */
(function initParallax() {
  const sun  = document.querySelector('.sun-wrap');
  const hero = document.querySelector('.hero');
  if (!sun || !hero) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      const heroH = hero.offsetHeight;
      if (sy < heroH) {
        sun.style.transform = `translate(-50%, calc(-50% + ${sy * 0.06}px))`;
      }
      ticking = false;
    });
  }, { passive: true });
})();

/* ===== GALLERY ITEMS — staggered entrance ===== */
(function initGallery() {
  const items = document.querySelectorAll('.g-item');
  items.forEach((item, i) => {
    item.style.transitionDelay = `${(i % 4) * 0.08}s`;
  });
})();

/* ===== ACTIVE NAV LINK on scroll ===== */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-links a');
  if (!sections.length || !navLinks.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.style.opacity = href === `#${entry.target.id}` ? '1' : '';
        });
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(s => io.observe(s));
})();
