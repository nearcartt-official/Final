const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Order   = require('../models/Order');
const Product = require('../models/Product');

// Place order
router.post('/place', auth, async (req, res) => {
    try {
        const { items, total, deliveryAddress, paymentMethod } = req.body;
        const order = new Order({ orderId: 'NC'+Date.now(), customerId: req.user.id, items, total, deliveryAddress, paymentMethod: paymentMethod||'upi', paymentStatus: 'paid' });
        await order.save();
        res.json({ success: true, order });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// Customer orders
router.get('/my', auth, async (req, res) => {
    try { res.json(await Order.find({ customerId: req.user.id }).sort({ createdAt: -1 })); }
    catch(e) { res.status(500).json({ error: e.message }); }
});

// Seller orders
router.get('/seller', auth, async (req, res) => {
    try {
        const myProds = await Product.find({ sellerId: req.user.id });
        const ids = myProds.map(p => p._id);
        res.json(await Order.find({ 'items.productId': { $in: ids } }).sort({ createdAt: -1 }));
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// Update status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json({ success: true, order });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
