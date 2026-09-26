// Contact form endpoint — sends the enquiry to the admin and a confirmation to the sender.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.waltscharityef.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const { name, email, phone, topic, message } = body;

  // Honeypot — silently accept so bots move on.
  if (body.company_website) {
    res.status(200).json({ ok: true });
    return;
  }

  const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || ''));
  if (!name || !message || !validEmail) {
    res.status(400).json({ error: 'Please provide your name, a valid email and a message.' });
    return;
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    res.status(500).json({ error: 'Email service is not configured.' });
    return;
  }

  const FROM = 'Walts Charity & Empowerment Foundation <contact@waltscharityef.com>';
  const ADMIN_TO = 'admin@waltscharityef.com';
  const clean = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeName = clean(name);
  const safeTopic = clean(topic || 'General enquiry');
  const safeMessage = clean(message).replace(/\n/g, '<br>');
  const safeEmail = clean(email);
  const safePhone = clean(phone || '—');
  const sentDate = new Date().toUTCString();

  const shell = (title, inner) =>
    '<!doctype html><html><body style="margin:0;padding:0;background:#fdfbf7;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf7;padding:28px 12px;"><tr><td align="center">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">' +
    '<tr><td style="background:#0f3026;padding:24px 32px;">' +
    '<p style="margin:0;color:#e0993d;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;font-weight:bold;">Walts Charity &amp; Empowerment Foundation</p>' +
    '<h1 style="margin:8px 0 0;color:#fdfbf7;font-size:22px;font-weight:bold;">' + title + '</h1>' +
    '</td></tr>' +
    '<tr><td style="padding:30px 32px;font-size:15px;line-height:1.65;color:#22332c;">' + inner + '</td></tr>' +
    '<tr><td style="background:#f3ead8;padding:18px 32px;font-size:12px;line-height:1.7;color:#5a6b62;">' +
    '<strong style="color:#194f3b;">Walts Charity &amp; Empowerment Foundation</strong><br>' +
    '<a href="https://www.waltscharityef.com" style="color:#194f3b;">www.waltscharityef.com</a> · WhatsApp: 0811 327 3077' +
    '</td></tr></table></td></tr></table></body></html>';

  const fieldRow = (label, value) =>
    '<tr>' +
    '<td style="padding:8px 0;color:#5a6b62;font-size:13px;width:110px;vertical-align:top;">' + label + '</td>' +
    '<td style="padding:8px 0;font-weight:bold;color:#15211d;font-size:14px;">' + value + '</td>' +
    '</tr>';

  const adminInner =
    '<p style="margin:0 0 18px;">You have a new enquiry from the website contact form.</p>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fdfbf7;border:1px solid #e8dfc9;border-radius:12px;padding:6px 18px;">' +
    fieldRow('Name', safeName) +
    fieldRow('Email', '<a href="mailto:' + safeEmail + '" style="color:#194f3b;">' + safeEmail + '</a>') +
    fieldRow('Phone', safePhone) +
    fieldRow('Topic', safeTopic) +
    '</table>' +
    '<p style="margin:20px 0 8px;font-weight:bold;color:#15211d;">Message</p>' +
    '<div style="background:#fdfbf7;border:1px solid #e8dfc9;border-radius:12px;padding:16px 18px;line-height:1.7;">' + safeMessage + '</div>' +
    '<p style="margin:20px 0 0;font-size:13px;color:#5a6b62;">Reply directly to this email to respond to ' + safeName + '. Sent ' + sentDate + '.</p>';

  const confirmInner =
    '<p style="margin:0 0 16px;">Dear ' + safeName + ',</p>' +
    '<p style="margin:0 0 16px;">Thank you for reaching out to Walts Charity &amp; Empowerment Foundation. We have received your message, and a member of our team will get back to you within <strong>48 hours</strong>.</p>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fdfbf7;border:1px solid #e8dfc9;border-radius:12px;padding:6px 18px;">' +
    fieldRow('Topic', safeTopic) +
    fieldRow('Your message', safeMessage) +
    '</table>' +
    '<p style="margin:20px 0 0;">For urgent matters, you can also reach us on WhatsApp at <strong>0811 327 3077</strong>.</p>' +
    '<p style="margin:16px 0 0;">Warm regards,<br><strong style="color:#194f3b;">Walts Charity &amp; Empowerment Foundation</strong><br><span style="font-size:13px;color:#5a6b62;">Restoring dignity, safety and opportunity in rural Nigeria.</span></p>';

  const send = payload =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

  try {
    const [adminRes, confirmRes] = await Promise.all([
      send({
        from: FROM,
        to: [ADMIN_TO],
        reply_to: email,
        subject: 'Website enquiry — ' + safeTopic + ' — ' + safeName,
        html: shell('New website enquiry', adminInner)
      }),
      send({
        from: FROM,
        to: [email],
        subject: 'We received your message — Walts Charity & Empowerment Foundation',
        html: shell('Thank you for reaching out', confirmInner)
      })
    ]);

    if (!adminRes.ok || !confirmRes.ok) {
      const detail = adminRes.ok ? await confirmRes.text() : await adminRes.text();
      console.error('Resend delivery failed:', detail);
      res.status(502).json({ error: 'Email delivery failed. Please try again or reach us on WhatsApp.' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    res.status(502).json({ error: 'Email delivery failed. Please try again or reach us on WhatsApp.' });
  }
}
