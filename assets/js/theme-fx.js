/* Starion AI - background particle network + scroll reveal. Safe to remove; the site works without it. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) scroll reveal
  function reveal() {
    var sel = 'main section h1, main section h2, main section [class*="grid"] > *, main section [class*="max-w"] > p, main section [class*="rounded"][class*="border"]';
    var els = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('sb-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) {
      var kids = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(kids, 5) * 80 + 'ms';
      el.classList.add('sb-reveal');
      io.observe(el);
    });
  }

  // 2) particle network background
  function network() {
    var c = document.createElement('canvas');
    c.id = 'sb-net';
    document.body.appendChild(c);
    var ctx = c.getContext('2d'), w, h, pts = [], running = true;
    var count = window.innerWidth < 768 ? 55 : 110, mx = -999, my = -999, stars = [];
    for (var s = 0; s < 90; s++) stars.push({ x: Math.random(), y: Math.random(), t: Math.random() * 6.28, sp: .01 + Math.random() * .03 });
    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
    function size() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
    size(); window.addEventListener('resize', size);
    for (var i = 0; i < count; i++) {
      pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * 1.1, vy: (Math.random() - .5) * 1.1, r: Math.random() * 2 + 1 });
    }
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var k = 0; k < stars.length; k++) { var st = stars[k]; st.t += st.sp; ctx.fillStyle = 'rgba(200,220,255,' + (.25 + .5 * Math.abs(Math.sin(st.t))) + ')'; ctx.fillRect(st.x * w, st.y * h, 1.5, 1.5); }
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(100,170,255,.9)'; ctx.fillStyle = 'rgba(130,180,255,.9)'; ctx.fill(); ctx.shadowBlur = 0;
        var mdx = p.x - mx, mdy = p.y - my, md = mdx * mdx + mdy * mdy; if (md < 40000) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my); ctx.strokeStyle = 'rgba(167,139,250,' + (.35 * (1 - Math.sqrt(md) / 200)) + ')'; ctx.stroke(); }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 22500) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(100,150,255,' + (0.28 * (1 - Math.sqrt(d) / 150)) + ')';
            ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden; if (running) draw();
    });
    draw();
  }

  function init() { reveal(); network(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
