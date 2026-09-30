(function () {
  // Header background on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  // Reveal on scroll
  var revealTargets = document.querySelectorAll('.section-head, .service-card, .process li, .about-media, .about-copy, .g-item, .contact-info, .contact-form, .cta-inner');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  // Gallery filters
  var items = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  document.querySelectorAll('.filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      items.forEach(function (it) { it.classList.toggle('hidden', f !== 'all' && it.dataset.cat !== f); });
    });
  });

  // Lightbox
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var current = 0;
  function visible() { return items.filter(function (it) { return !it.classList.contains('hidden'); }); }
  function show(i) {
    var list = visible();
    current = (i + list.length) % list.length;
    var img = list[current].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
  }
  function openLb(item) {
    show(visible().indexOf(item));
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
  }
  function closeLb() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); }
  items.forEach(function (it) { it.addEventListener('click', function () { openLb(it); }); });
  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Contact form
  var form = document.getElementById('contact-form');
  var status = form.querySelector('.form-status');
  var submitBtn = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    var ok = true;
    ['name', 'email', 'message'].forEach(function (n) {
      var el = form.elements[n];
      var bad = !el.value.trim() || (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) {
      status.classList.add('err');
      status.textContent = 'Please fill in your name, a valid email and project details.';
      return;
    }

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { ok: r.ok, body: b }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.body.error || 'Request failed');
        form.reset();
        status.classList.add('ok');
        status.textContent = 'Thank you. Your message has been sent and we will be in touch soon.';
      })
      .catch(function () {
        status.classList.add('err');
        status.textContent = 'Sorry, your message could not be sent right now. Please try again in a moment.';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
