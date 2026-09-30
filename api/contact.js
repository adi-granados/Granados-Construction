// Vercel serverless function: sends contact form submissions by email via Resend (https://resend.com).
//
// Environment variables (set in Vercel > Project > Settings > Environment Variables):
//   RESEND_API_KEY      required, your Resend API key
//   CONTACT_TO_EMAIL    where messages are delivered (change this when you switch to your business email)
//   CONTACT_FROM_EMAIL  sender address; must be on a domain verified in Resend,
//                       e.g. "Granados Website <website@granadoscontractor.com>"

const DEFAULT_TO = 'agranados112@gmail.com';
const DEFAULT_FROM = 'Granados Website <onboarding@resend.dev>';

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function clean(v, max) {
  return String(v || '').trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  // Honeypot: real visitors never fill this hidden field
  if (body.company) return res.status(200).json({ ok: true });

  const name = clean(body.name, 100);
  const email = clean(body.email, 150);
  const phone = clean(body.phone, 30);
  const service = clean(body.service, 50);
  const location = clean(body.location, 100);
  const message = clean(body.message, 5000);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Name, valid email and message are required.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Email is not configured.' });
  }

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone || 'Not provided'],
    ['Service', service || 'Not specified'],
    ['Location', location || 'Not provided'],
  ];

  const html = `
    <h2 style="font-family:Arial,sans-serif">New estimate request from granadoscontractor.com</h2>
    <table style="font-family:Arial,sans-serif;border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;font-weight:bold">${k}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`).join('')}
    </table>
    <h3 style="font-family:Arial,sans-serif">Project Details</h3>
    <p style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeHtml(message)}</p>`;

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nProject Details:\n${message}`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
        to: [process.env.CONTACT_TO_EMAIL || DEFAULT_TO],
        reply_to: email,
        subject: `New estimate request: ${service || 'General'} - ${name}`,
        html,
        text,
      }),
    });
    if (!r.ok) {
      console.error('Resend error', r.status, await r.text());
      return res.status(502).json({ error: 'Could not send message.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not send message.' });
  }
};
