/* Starion AI - ROI calculators + Pay-for-Performance pop-up. Illustrative maths only, not a promise of results. */
(function () {
  function m(n) { return (n < 0 ? '-$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US'); }
  var CFG = {
    starbot: { head: 'The Math of Missed Calls', sub: 'Every enquiry nobody answers is a customer who books somewhere else.', fee: 1200,
      inputs: [['calls', 'Missed calls or enquiries per week', 5], ['val', 'Lifetime value of one patient or customer ($)', 1500], ['won', 'Customers StarBot could win back per month', 2]],
      calc: function (v) { var wk = v.calls * v.val; return { formula: v.calls + ' missed calls/week × ' + m(v.val) + ' = ' + m(wk) + ' lost/week = ' + m(wk * 52) + ' lost/year', loss: wk * 52, lossLabel: 'Lost to missed enquiries per year', gain: v.won * 12 * v.val, gainLabel: 'Value of customers won back per year' }; } },
    starlead: { head: 'Replace a $60,000 sales rep', sub: 'Consistent outreach is a full-time job. StarLead does it every day.', fee: 6000,
      inputs: [['rep', 'Cost of one sales rep per year ($)', 60000], ['calls', 'Qualified calls booked per month (your target)', 10]],
      calc: function (v) { return { formula: 'A sales rep costs ' + m(v.rep) + '/year and makes about 50 calls a day. StarLead runs your outreach at a fraction of the cost, with a target of ' + v.calls + ' qualified calls a month.', loss: v.rep, lossLabel: 'A full-time sales rep costs per year', gain: v.rep, gainLabel: 'Cost you avoid per year' }; } },
    starbook: { head: 'The Cost of an Empty Slot', sub: 'Every no-show is paid-for time with nobody in the chair.', fee: 1200,
      inputs: [['n', 'No-shows per month', 10], ['slot', 'Value of one empty slot ($)', 200], ['cut', 'No-show reduction (%)', 60]],
      calc: function (v) { var mo = v.n * v.slot; return { formula: v.n + ' no-shows/month × ' + m(v.slot) + ' = ' + m(mo) + ' lost/month = ' + m(mo * 12) + ' lost/year', loss: mo * 12, lossLabel: 'Lost to no-shows per year', gain: mo * 12 * v.cut / 100, gainLabel: 'Saved by cutting no-shows by ' + v.cut + '%' }; } },
    starmail: { head: 'Revenue Sitting in Your Email List', sub: 'Email lists decay by about 25% every year. Old leads and abandoned carts go cold.', fee: 3600,
      inputs: [['rev', 'Revenue recovered per year ($), try 5,000 to 30,000', 15000]],
      calc: function (v) { return { formula: 'Abandoned-cart and re-engagement emails turn forgotten contacts back into customers. Your result depends on your list size and offer.', gain: v.rev, gainLabel: 'Revenue recovered per year' }; } },
    starflow: { head: 'The Price of Manual Data Entry', sub: 'Copy and paste is expensive. Automation does it for free, forever.', fee: 3600,
      inputs: [['h', 'Hours of manual work per week', 20], ['r', 'Cost per hour ($)', 25]],
      calc: function (v) { var wk = v.h * v.r; return { formula: v.h + ' hours/week × ' + m(v.r) + '/hour = ' + m(wk) + '/week = ' + m(wk * 52) + '/year', loss: wk * 52, lossLabel: 'Labour spent on manual work per year', gain: wk * 52, gainLabel: 'Labour cost you can save per year' }; } },
    starads: { head: 'Same Leads, Less Spend', sub: 'Ad budgets leak when creative and targeting are not tested.', fee: 6000, feeExtra: function (v) { return v.spend * 12 * 0.1; },
      inputs: [['spend', 'Monthly ad spend ($)', 5000], ['cr', 'Current conversion rate (%)', 3], ['ncr', 'Conversion rate after optimising (%)', 5]],
      calc: function (v) { var s = v.ncr > 0 ? v.spend * (1 - v.cr / v.ncr) : 0; return { formula: m(v.spend) + '/month at a ' + v.cr + '% conversion rate. At ' + v.ncr + '% you get the same leads for ' + Math.round(100 * (1 - v.cr / v.ncr)) + '% less spend. Fee includes 10% of ad spend.', loss: v.spend * 12, lossLabel: 'Ad budget per year', gain: s * 12, gainLabel: 'Ad spend saved per year for the same leads' }; } }
  };
  function compute(key, v) {
    var c = CFG[key], o = c.calc(v), fee = c.fee + (c.feeExtra ? c.feeExtra(v) : 0);
    o.fee = fee; o.net = o.gain - fee; o.roi = fee ? Math.round((o.gain - fee) / fee * 100) : 0; return o;
  }
  if (typeof module !== 'undefined') module.exports = { CFG: CFG, compute: compute };
  var ALL_INPUTS = [['h', 'Hours of manual work per week', 20], ['r', 'Cost per hour ($)', 25], ['lw', 'Leads lost per week', 3], ['val', 'Value of one customer ($)', 1500], ['won', 'Extra customers won per month', 3], ['ns', 'No-shows per month', 10], ['slot', 'Value of one empty slot ($)', 200], ['cut', 'No-show reduction (%)', 60]];
  function computeAll(v) {
    var hoursYear = v.h * 52, labour = hoursYear * v.r, lost = v.lw * v.val * 52,
        leads = v.won * 12 * v.val, noshow = v.ns * v.slot * 12 * v.cut / 100;
    return { hoursWeek: v.h, hoursYear: hoursYear, labour: labour, lost: lost, leads: leads, noshow: noshow, revenue: leads + noshow };
  }
  if (typeof module !== 'undefined') module.exports.computeAll = computeAll;
  if (typeof document === 'undefined') return;

  function renderCalc(el) {
    var key = el.getAttribute('data-service'), c = CFG[key]; if (!c) return;
    var ins = c.inputs.map(function (i) { return '<label class="roi-input"><span>' + i[1] + '</span><input type="number" min="0" step="any" data-k="' + i[0] + '" value="' + i[2] + '"></label>'; }).join('');
    el.innerHTML = '<div class="roi-wrap"><span class="roi-eyebrow">The cost of inaction</span><h2>' + c.head + '</h2><p class="roi-sub">' + c.sub + '</p>' +
      '<div class="roi-grid"><div class="roi-inputs">' + ins + '</div><div class="roi-out"><p class="roi-formula"></p><div class="roi-cards"></div></div></div>' +
      '<p class="roi-note">Illustrative maths using the numbers above, which you can change. It is an example, not a promise of results. Annual fee = 12 × the monthly fee, before the one-off setup fee.</p></div>';
    function upd() {
      var v = {}; el.querySelectorAll('input').forEach(function (i) { v[i.getAttribute('data-k')] = parseFloat(i.value) || 0; });
      var o = compute(key, v), cards = [];
      if (o.loss != null) cards.push(['loss', o.lossLabel, m(o.loss)]);
      cards.push(['fee', 'Starion annual fee', m(o.fee)], ['gain', o.gainLabel, m(o.gain)], ['roi', 'Illustrative ROI', (o.roi < 0 ? '-' : '') + Math.abs(o.roi).toLocaleString('en-US') + '%']);
      el.querySelector('.roi-formula').textContent = o.formula;
      el.querySelector('.roi-cards').innerHTML = cards.map(function (x) { return '<div class="roi-card roi-' + x[0] + '"><b>' + x[2] + '</b><span>' + x[1] + '</span></div>'; }).join('');
    }
    el.addEventListener('input', upd); upd();
  }

  var PFP = {
    starbot: ['StarBot', '$100 setup + $100/month', '$99/month base + $30 per booked appointment'],
    starlead: ['StarLead', '$1,000 setup + $500/month', '$199/month base + $50 per qualified booked call'],
    starbook: ['StarBook', '$300 setup + $100/month', '$50/month base + $5 per confirmed appointment (no-shows excluded)'],
    starmail: ['StarMail', '$500 setup + $300/month', 'A lower base fee + a share of the revenue your email flows recover, agreed in your written quote'],
    starflow: ['StarFlow', '$1,500 setup + $300/month', 'A lower base fee + a share of measured savings after a workflow audit, agreed in your written quote'],
    starads: ['StarAds', '$500/month + 10% of ad spend', '$500/month base + 10% of ad spend, or an agreed share of ROAS above a target'],
    dental: ['AI Receptionist', '$249/month + $299 setup (pilot $199)', '$99/month base + $30 per booked appointment, confirmed in your written quote']
  };
  function modal(key) {
    var p = PFP[key] || PFP.starbot, old = document.getElementById('pfp-modal'); if (old) old.remove();
    var d = document.createElement('div'); d.id = 'pfp-modal'; d.className = 'pfp-modal'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="pfp-box"><button class="pfp-x" aria-label="Close">&times;</button><span class="roi-eyebrow">Pay-for-Performance</span><h2>Stop Buying Software. Start Buying Outcomes.</h2>' +
      '<p>You pay a small base fee to cover the tech. The rest of our fee is tied to the results we generate for you. If we don\u2019t perform, we don\u2019t earn the performance fee.</p>' +
      '<div class="pfp-plans"><div><small>Plan A &middot; Standard (fixed)</small><b>' + p[1] + '</b><span>Best for predictable budgeting.</span></div><div class="pfp-hot"><small>Plan B &middot; Performance (' + p[0] + ')</small><b>' + p[2] + '</b><span>Best if you want to pay for results.</span></div></div>' +
      '<p class="pfp-guar"><b>Our Guarantee: We only win when you win.</b> If we don\u2019t hit the agreed target in your 14-day pilot, you get a full refund of the pilot fee. Terms apply.</p>' +
      '<div class="pfp-actions"><a class="btn-gold px-6 py-3 rounded-xl" href="pay-for-performance.html">See how it works</a><a class="btn-outline px-6 py-3 rounded-xl" target="_blank" rel="noopener noreferrer" href="https://calendly.com/piyanshusingh2007/new-meeting">Book a free ROI audit</a></div></div>';
    document.body.appendChild(d);
    function close() { d.remove(); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') close(); }
    d.addEventListener('click', function (e) { if (e.target === d || e.target.className === 'pfp-x') close(); });
    document.addEventListener('keydown', esc); d.querySelector('.pfp-x').focus();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-pfp]');
    if (t) { e.preventDefault(); e.stopPropagation(); modal(t.getAttribute('data-pfp')); }
  }, true);
  document.addEventListener('keydown', function (e) {
    var t = e.target; if ((e.key === 'Enter' || e.key === ' ') && t.getAttribute && t.getAttribute('data-pfp')) { e.preventDefault(); modal(t.getAttribute('data-pfp')); }
  });

  /* Combined "cost of doing nothing" calculator for the home page (all six systems) */
  function renderAll(el) {
    var ins = ALL_INPUTS.map(function (i) { return '<label class="roi-input"><span>' + i[1] + '</span><input type="number" min="0" step="any" data-k="' + i[0] + '" value="' + i[2] + '"></label>'; }).join('');
    el.innerHTML = '<div class="roi-wrap"><span class="roi-eyebrow">All six systems combined</span><h3 class="text-2xl font-extrabold" style="color:#f8f8f8">Your total hours saved and revenue captured</h3>' +
      '<div class="roi-grid"><div class="roi-inputs">' + ins + '</div><div class="roi-out"><p class="roi-formula"></p><div class="roi-cards roi-cards-all"></div></div></div>' +
      '<p class="roi-note">Illustrative maths using the numbers above, which you can change. It is an example, not a promise of results.</p></div>';
    function upd() {
      var v = {}; el.querySelectorAll('input').forEach(function (i) { v[i.getAttribute('data-k')] = parseFloat(i.value) || 0; });
      var o = computeAll(v);
      el.querySelector('.roi-formula').textContent = v.h + ' hours/week × 52 = ' + Math.round(o.hoursYear).toLocaleString('en-US') + ' hours back every year. ' + v.won + ' extra customers/month × ' + m(v.val) + ' × 12 = ' + m(o.leads) + ', plus ' + m(o.noshow) + ' from fewer no-shows.';
      var cards = [['hours', 'Total hours saved per year (' + Math.round(o.hoursWeek).toLocaleString('en-US') + ' every week)', Math.round(o.hoursYear).toLocaleString('en-US') + ' hrs'], ['gain', 'Total revenue captured per year', m(o.revenue)], ['gain', 'Labour cost saved per year', m(o.labour)], ['loss', 'Lost per year if nothing changes', m(o.lost)]];
      el.querySelector('.roi-cards').innerHTML = cards.map(function (x) { return '<div class="roi-card roi-' + x[0] + '"><b>' + x[2] + '</b><span>' + x[1] + '</span></div>'; }).join('');
    }
    el.addEventListener('input', upd); upd();
  }

  /* Standard / Pay-for-Performance pricing toggle */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pfp-tab]'); if (!b) return;
    var wrap = b.closest('.pfp-pricing'); if (!wrap) return;
    var which = b.getAttribute('data-pfp-tab');
    wrap.querySelectorAll('[data-pfp-tab]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    wrap.querySelectorAll('[data-pfp-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-pfp-panel') !== which; });
  });
  function init() { document.querySelectorAll('.roi-calc').forEach(function (el) { if (el.getAttribute('data-service') === 'all') renderAll(el); else renderCalc(el); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
