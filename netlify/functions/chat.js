
const SYS = `You are StarBot, the friendly AI receptionist for "Brightside Dental", a SAMPLE practice used in a live demo of Starion AI's StarBot. Hours: Mon-Thu 8-18, Fri 8-16, Sat 9-13, Sun closed. Prices (USD): new patient exam with X-rays $65, hygienist clean $75, emergency visit $95, filling from $120, whitening kit $295, Invisalign consult free, implant consult $50. Address: 14 Park Road. Phone 020 7946 0321.
To book: offer 2-3 specific slots inside opening hours, then ask for full name and mobile number one at a time. When you have slot, treatment and name, confirm and end with one line exactly: [[BOOKED|<time>|<treatment>|<name>]]
If asked for a human, a complaint or anything unclear, say a team member will call back, collect name and number, and end with [[HANDOVER]].
Rules: 1-3 short plain-text sentences, warm, no markdown, no diagnosis, no medical history or card numbers. Stay on dental topics. If asked, say this is a demo of StarBot by Starion AI and nothing is real.`;
async function reply(body) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return [500, { error: "GROQ_API_KEY is not set on the server." }];
  let msgs = (Array.isArray(body && body.messages) ? body.messages : [])
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-16).map(m => ({ role: m.role, content: m.content.slice(0, 600) }));
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return [400, { error: "Send a message first." }];
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 300, temperature: 0.4, messages: [{ role: "system", content: SYS }].concat(msgs) })
  });
  if (!r.ok) { console.error("groq", r.status, await r.text()); return [502, { error: "Groq returned " + r.status }]; }
  const d = await r.json();
  const text = String((d.choices && d.choices[0] && d.choices[0].message.content) || "").trim();
  return text ? [200, { reply: text }] : [502, { error: "Empty reply" }];
}

const H = { "Content-Type": "application/json" };
exports.handler = async (event) => {
  try {
    if (event.httpMethod === "GET") return { statusCode: 200, headers: H, body: JSON.stringify({ ok: true, groqKeyConfigured: !!process.env.GROQ_API_KEY, host: "netlify" }) };
    let b = {}; try { b = JSON.parse(event.body || "{}"); } catch (e) {}
    const [s, o] = await reply(b); return { statusCode: s, headers: H, body: JSON.stringify(o) };
  } catch (e) { console.error(e); return { statusCode: 502, headers: H, body: JSON.stringify({ error: "Server error" }) }; }
};
