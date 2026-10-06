// Email + password login for the admin dashboard: /api/auth/login
// Checks credentials against the ADMIN_USERS env var (JSON:
// [{"email":"...","password":"..."}, ...]) and returns the content token
// (GITHUB_CONTENT_TOKEN) that the CMS stores in the browser.
import crypto from 'crypto';

// Best-effort in-memory throttle: 10 failed attempts per IP per 10 minutes.
const attempts = new Map();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 10 * 60 * 1000;

function tooManyAttempts(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
    return;
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (tooManyAttempts(ip)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' }));
    return;
  }

  const token = process.env.GITHUB_CONTENT_TOKEN;
  let users = [];
  try {
    users = JSON.parse(process.env.ADMIN_USERS || '[]');
  } catch (e) {
    users = [];
  }

  if (!token || !Array.isArray(users) || users.length === 0) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: 'Login is not configured. Set ADMIN_USERS and GITHUB_CONTENT_TOKEN in the Vercel project settings (see ADMIN.md).' }));
    return;
  }

  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  const match = users.find(u => u && String(u.email || '').trim().toLowerCase() === email && safeEqual(u.password, password));
  if (!match) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: 'Wrong email or password.' }));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ ok: true, token }));
}
