const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Reel    = require('../models/Reel');

// All reels
router.get('/', async (req, res) => {
    try { res.json(await Reel.find({ isActive: true }).sort({ createdAt: -1 })); }
    catch(e) { res.status(500).json({ error: e.message }); }
});

// Seller reels
router.get('/my', auth, async (req, res) => {
    try { res.json(await Reel.find({ sellerId: req.user.id }).sort({ createdAt: -1 })); }
    catch(e) { res.status(500).json({ error: e.message }); }
});

// Add reel
router.post('/add', auth, async (req, res) => {
    try {
        const { emoji, title, desc, taggedProductId } = req.body;
        const reel = new Reel({ sellerId: req.user.id, sellerName: req.user.name, emoji, title, desc, taggedProductId: taggedProductId||null });
        await reel.save();
        res.json({ success: true, reel });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// Like
router.put('/:id/like', async (req, res) => {
    try {
        const reel = await Reel.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
        res.json({ success: true, likes: reel.likes });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// View
router.put('/:id/view', async (req, res) => {
    try {
        await Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
    try {
        await Reel.findOneAndDelete({ _id: req.params.id, sellerId: req.user.id });
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
