/* Starion AI - Diwali banner + countdown, and glowing/shining service names. Loaded on every page. */
(function () {
  // ---------- 1) Diwali banner + countdown ----------
  // Diwali 2026 = Sunday 8 November. Countdown runs to the start of that day, India time (IST, UTC+5:30).
  var TARGET = new Date('2026-11-08T00:00:00+05:30').getTime();
  var DISCOUNT = 50; // percent. The prices on the pages are already reduced by this amount.

  function banner() {
    var b = document.createElement('div');
    b.id = 'dw-bar';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Diwali offer');
    b.innerHTML =
      '<span class="dw-lamp" aria-hidden="true">\uD83E\uDE94</span>' +
      '<span class="dw-txt"><b>Diwali Offer: ' + DISCOUNT + '% OFF every plan</b>' +
      '<span class="dw-sub"> \u00B7 Diwali: Sun 8 Nov 2026 \u00B7 Lakshmi Puja \u2248 5:54\u20137:50 PM IST (New Delhi)</span></span>' +
      '<span class="dw-clock" id="dw-clock" aria-live="off">' +
      '<span><b id="dw-d">--</b><i>days</i></span><span><b id="dw-h">--</b><i>hrs</i></span>' +
      '<span><b id="dw-m">--</b><i>min</i></span><span><b id="dw-s">--</b><i>sec</i></span></span>';
    document.body.insertBefore(b, document.body.firstChild);
    var d = b.querySelector('#dw-d'), h = b.querySelector('#dw-h'), m = b.querySelector('#dw-m'), s = b.querySelector('#dw-s');
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var ms = TARGET - Date.now();
      if (ms <= 0) {
        b.querySelector('.dw-txt').innerHTML = '<b>\uD83E\uDE94 Happy Diwali from Starion AI! \uD83E\uDE94</b>';
        b.querySelector('#dw-clock').style.display = 'none';
        clearInterval(t); return;
      }
      var sec = Math.floor(ms / 1000);
      d.textContent = Math.floor(sec / 86400);
      h.textContent = pad(Math.floor(sec % 86400 / 3600));
      m.textContent = pad(Math.floor(sec % 3600 / 60));
      s.textContent = pad(sec % 60);
    }
    var t = setInterval(tick, 1000); tick();
  }

  // ---------- 2) glowing / shining service names ----------
  var NAMES = /\b(StarBot|StarLead|StarBook|StarMail|StarFlow|StarAds)\b/g;
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|SELECT|TITLE|NOSCRIPT|CODE|PRE)$/;
  function glow() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || SKIP.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('.svc-name,#sbc-w,#sbc-b,#dw-bar,a[href^="mailto"]')) return NodeFilter.FILTER_REJECT;
        NAMES.lastIndex = 0;
        return NAMES.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment(), txt = node.nodeValue, last = 0, m;
      NAMES.lastIndex = 0;
      while ((m = NAMES.exec(txt))) {
        if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        var sp = document.createElement('span');
        sp.className = 'svc-name'; sp.textContent = m[0];
        frag.appendChild(sp); last = m.index + m[0].length;
      }
      if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function init() { banner(); glow(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
