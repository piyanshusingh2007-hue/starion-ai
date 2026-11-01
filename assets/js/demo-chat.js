/* Starion StarBot demo widget: floating chat on every page. Falls back to scripted answers if the server is unreachable. */
(function () {
  var hist = [], busy = false, fb = 0;
  var css = '#sbc-b{position:fixed;right:20px;bottom:20px;z-index:99;padding:14px 20px;border-radius:999px;border:0;cursor:pointer;color:#fff;font:600 15px Inter,sans-serif;background:linear-gradient(90deg,#00a1ff,#a46bf5);box-shadow:0 0 24px rgba(100,150,255,.45)}' +
  '#sbc-w{position:fixed;right:20px;bottom:80px;z-index:99;width:min(370px,calc(100vw - 40px));height:480px;max-height:calc(100vh - 110px);display:none;flex-direction:column;border-radius:18px;overflow:hidden;background:rgba(14,14,32,.92);backdrop-filter:blur(20px);border:1px solid rgba(100,150,255,.3);box-shadow:0 0 40px rgba(100,150,255,.25);font:15px Inter,sans-serif;color:#f8f8f8}' +
  '#sbc-w.o{display:flex}#sbc-h{padding:14px 16px;font-weight:700;background:linear-gradient(90deg,rgba(0,161,255,.25),rgba(164,107,245,.25))}#sbc-h small{display:block;font-weight:400;color:#a1a1b0;font-size:12px}' +
  '#sbc-l{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}.sbc-m{max-width:85%;padding:9px 13px;border-radius:14px;line-height:1.45;white-space:pre-wrap}' +
  '.sbc-u{align-self:flex-end;background:linear-gradient(90deg,#00a1ff,#a46bf5)}.sbc-a{align-self:flex-start;background:rgba(255,255,255,.08)}.sbc-n{align-self:center;font-size:12px;color:#7dd3fc}' +
  '#sbc-f{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(100,150,255,.2)}#sbc-i{flex:1;padding:10px 12px;border-radius:10px;border:1px solid rgba(100,150,255,.3);background:rgba(20,20,40,.8);color:#fff;font:inherit}' +
  '#sbc-s{padding:0 16px;border:0;border-radius:10px;cursor:pointer;color:#fff;font-weight:600;background:linear-gradient(90deg,#00a1ff,#a46bf5)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var b = document.createElement('button'); b.id = 'sbc-b'; b.textContent = '\uD83D\uDCAC Try the StarBot demo';
  var w = document.createElement('div'); w.id = 'sbc-w';
  w.innerHTML = '<div id="sbc-h">StarBot demo<small>Brightside Dental (sample practice)</small></div><div id="sbc-l"></div><form id="sbc-f"><input id="sbc-i" placeholder="Ask about prices, hours, booking..." autocomplete="off"><button id="sbc-s">Send</button></form>';
  document.body.appendChild(b); document.body.appendChild(w);
  var log = w.querySelector('#sbc-l'), inp = w.querySelector('#sbc-i');
  function add(c, t) { var d = document.createElement('div'); d.className = 'sbc-m sbc-' + c; d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function show(t) {
    var m = t.match(/\[\[BOOKED\|([^|]*)\|([^|]*)\|([^\]]*)\]\]/);
    t = t.replace(/\[\[(BOOKED[^\]]*|HANDOVER)\]\]/g, '').trim();
    if (t) add('a', t);
    if (m) add('n', '\u2713 Booked: ' + m[2] + ', ' + m[1] + ' for ' + m[3] + ' (demo)');
    if (/\[\[HANDOVER\]\]/.test(arguments[0])) add('n', '\u2192 Handed over to a human (demo)');
  }
  var script = [[/price|cost|how much|fee/i, 'Exam with X-rays is $65, hygienist clean $75, fillings from $120, and the Invisalign consultation is free.'],
    [/hour|open|close/i, 'We are open Mon-Thu 8:00-18:00, Fri 8:00-16:00 and Sat 9:00-13:00.'],
    [/book|appoint/i, 'Happy to help. I can do Tuesday 9:30, Tuesday 14:15 or Thursday 11:00. Which suits you?']];
  function offline(t) { for (var i = 0; i < script.length; i++) if (script[i][0].test(t)) return script[i][1]; return 'I am the demo receptionist for Brightside Dental. Ask me about prices, opening hours or booking an appointment.'; }
  async function ask(text) {
    if (busy || !text.trim()) return; busy = true; add('u', text); hist.push({ role: 'user', content: text });
    var t = add('a', '...'), out;
    try {
      var r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: hist }) });
      var raw = await r.text(), d = {}; try { d = JSON.parse(raw); } catch (e) {}
      if (!r.ok || !d.reply) throw new Error('bad');
      out = d.reply;
    } catch (e) { out = offline(text); if (!fb++) add('n', 'Live AI is offline, showing a basic scripted answer.'); }
    t.remove(); hist.push({ role: 'assistant', content: out }); show(out); busy = false;
  }
  b.onclick = function () { w.classList.toggle('o'); if (w.classList.contains('o')) { if (!log.children.length) add('a', "Hi, I'm the Brightside Dental receptionist (a StarBot demo). How can I help?"); inp.focus(); } };
  w.querySelector('#sbc-f').onsubmit = function (e) { e.preventDefault(); var v = inp.value; inp.value = ''; ask(v); };
})();
