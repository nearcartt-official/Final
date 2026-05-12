const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User     = require('../models/User');
const auth     = require('../middleware/auth');

const otpStore = {};

const mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// SEND OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = { otp, expiry: Date.now() + 5 * 60000 };
        await mailer.sendMail({
            from: `"NearCart 🛍️" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your NearCart OTP Code',
            html: `<div style="font-family:sans-serif;max-width:420px;margin:auto;padding:24px;background:#f5f5f7;border-radius:16px;">
                <h2 style="color:#6366f1;margin-bottom:4px;">🛍️ NearCart</h2>
                <p>Hello <strong>${name||'there'}</strong>! Your OTP is:</p>
                <div style="background:#6366f1;color:white;font-size:2rem;font-weight:800;letter-spacing:10px;padding:16px;border-radius:12px;text-align:center;margin:16px 0;">${otp}</div>
                <p style="color:#666;font-size:0.85rem;">Valid for 5 minutes. Do not share with anyone.</p>
            </div>`
        });
        res.json({ success: true });
    } catch(e) {
        console.error('OTP Error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

// SIGNUP
router.post('/signup', async (req, res) => {
    try {
        const { name, email, mobile, password, role, address, otp } = req.body;
        const stored = otpStore[email];
        if (!stored)              return res.status(400).json({ error: 'OTP not found. Request again.' });
        if (Date.now() > stored.expiry) return res.status(400).json({ error: 'OTP expired.' });
        if (stored.otp !== otp)   return res.status(400).json({ error: 'Invalid OTP' });
        if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already registered' });
        const user = new User({ name, email, mobile, password: await bcrypt.hash(password, 10), role, address });
        await user.save();
        delete otpStore[email];
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });
        if (user.role !== role) return res.status(400).json({ error: `You are registered as ${user.role}` });
        if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ error: 'Invalid email or password' });
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, address: user.address, addresses: user.addresses } });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// SAVE ADDRESS
router.post('/address', auth, async (req, res) => {
    try {
        const { type, street, city, pincode } = req.body;
        const user = await User.findById(req.user.id);
        user.addresses.push({ type, street, city, pincode, isDefault: user.addresses.length === 0 });
        await user.save();
        res.json({ success: true, addresses: user.addresses });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
