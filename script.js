/* Ivan Gojic Webdesign: kein Framework, drei kleine Dinge */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  /* Jahr */
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* Nav-Linie beim Scrollen */
  var nav = document.getElementById('nav');
  var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Einblenden beim Scrollen (Inhalt bleibt ohne JS sichtbar, siehe CSS .no-js) */
  var items = document.querySelectorAll('[data-reveal]');
  var noanim = /[?&]noanim/.test(location.search); /* fuer Screenshots und Tests */
  if ('IntersectionObserver' in window && !noanim) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Vorher/Nachher-Regler: Range-Input liegt unsichtbar ueber dem Bild, Tastatur und Maus funktionieren */
  var stage = document.getElementById('compare');
  var range = document.getElementById('compareRange');
  if (stage && range) {
    var set = function (v) {
      v = Math.max(0, Math.min(100, v));
      stage.style.setProperty('--pos', v + '%');
      stage.style.setProperty('--pos-n', String(Math.max(v, 0.1) / 100));
      range.value = String(v);
    };
    set(parseFloat(range.value));
    range.addEventListener('input', function () { set(parseFloat(range.value)); });

    /* Touch: Finger direkt folgen lassen (Range reagiert sonst erst beim Treffen des Knopfs) */
    var dragging = false;
    var fromEvent = function (ev) {
      var r = stage.getBoundingClientRect();
      var x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      set(x / r.width * 100);
    };
    stage.addEventListener('pointerdown', function (ev) { dragging = true; fromEvent(ev); });
    window.addEventListener('pointermove', function (ev) { if (dragging) fromEvent(ev); });
    window.addEventListener('pointerup', function () { dragging = false; });

    /* Kleine Einladung: einmal sanft hin und zurueck, wenn der Vergleich ins Bild kommt */
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && 'IntersectionObserver' in window) {
      var played = false;
      var io2 = new IntersectionObserver(function (entries) {
        if (played || !entries[0].isIntersecting) return;
        played = true; io2.disconnect();
        var start = null, from = 55, to = 30, dur = 1400;
        var tick = function (t) {
          if (dragging) return;
          if (!start) start = t;
          var p = Math.min(1, (t - start) / dur);
          var e = 0.5 - Math.cos(p * Math.PI * 2) / 2; /* hin und zurueck */
          set(from + (to - from) * e);
          if (p < 1) requestAnimationFrame(tick);
        };
        setTimeout(function () { requestAnimationFrame(tick); }, 500);
      }, { threshold: 0.5 });
      io2.observe(stage);
    }
  }
})();
