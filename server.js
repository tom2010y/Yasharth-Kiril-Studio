import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '32kb' }));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const recentRequests = new Map();
function clean(v, max = 2000) { return String(v ?? '').trim().slice(0, max); }
function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function rateLimited(ip) {
  const now = Date.now();
  const previous = recentRequests.get(ip) || 0;
  if (now - previous < 30000) return true;
  recentRequests.set(ip, now);
  return false;
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'kiril-studio-booking-api' }));

app.post('/api/bookings', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    if (rateLimited(ip)) return res.status(429).json({ ok: false, error: 'Please wait 30 seconds before sending another booking request.' });

    const { service, packageName, price, date, time, name, email, business, message } = req.body || {};
    if (!service || !packageName || !date || !time || !name || !email || !message)
      return res.status(400).json({ ok: false, error: 'Please complete all required fields.' });
    if (!validEmail(email)) return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });

    const bookingId = `KS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const subject = `New Kiril Studio booking — ${clean(packageName, 150)} — ${bookingId}`;
    const text = [
      'NEW KIRIL STUDIO BOOKING', '', `Booking ID: ${bookingId}`, '',
      'CLIENT', `Name: ${clean(name, 120)}`, `Email: ${clean(email, 200)}`,
      `Business / Channel: ${clean(business, 200) || 'Not provided'}`, '',
      'SERVICE', `Service: ${clean(service, 100)}`, `Package: ${clean(packageName, 150)}`,
      `Starting price: €${clean(price, 30)}`, '', 'BOOKING',
      `Preferred date: ${clean(date, 30)}`, `Preferred time: ${clean(time, 30)}`, '',
      'PROJECT DETAILS', clean(message, 4000), '',
      'This is a booking request, not an automatic confirmation.'
    ].join('\n');

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.BOOKING_EMAIL,
      replyTo: email,
      subject,
      text
    });

    res.status(201).json({ ok: true, bookingId, message: 'Booking request received.' });
  } catch (error) {
    console.error('Booking submission failed:', error);
    res.status(500).json({ ok: false, error: 'The booking could not be submitted. Please try again.' });
  }
});

app.listen(PORT, () => console.log(`Kiril Studio booking API listening on port ${PORT}`));
