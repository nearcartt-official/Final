const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const auth    = require('../middleware/auth');
const Product = require('../models/Product');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/products';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, 'prod_' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5*1024*1024 }, fileFilter: (req,file,cb) => {
    /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase()) ? cb(null,true) : cb(new Error('Images only'));
}});

// All products (customer)
router.get('/', async (req, res) => {
    try { res.json(await Product.find({ isActive: true }).sort({ createdAt: -1 })); }
    catch(e) { res.status(500).json({ error: e.message }); }
});

// Seller's own products
router.get('/my', auth, async (req, res) => {
    try { res.json(await Product.find({ sellerId: req.user.id }).sort({ createdAt: -1 })); }
    catch(e) { res.status(500).json({ error: e.message }); }
});

// Add product
router.post('/add', auth, upload.single('photo'), async (req, res) => {
    try {
        const { name_en, name_hi, price, stock, icon, description_en, description_hi, category } = req.body;
        if (!name_en || !price) return res.status(400).json({ error: 'Name and price required' });
        const product = new Product({
            name_en, name_hi, price, stock, icon, description_en, description_hi, category,
            sellerId: req.user.id,
            seller_en: req.user.name,
            photoUrl: req.file ? `/uploads/products/${req.file.filename}` : null
        });
        await product.save();
        res.json({ success: true, product });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
    try {
        await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.user.id });
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// Update product
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
    try {
        const updates = { ...req.body };
        if (req.file) updates.photoUrl = `/uploads/products/${req.file.filename}`;
        const product = await Product.findOneAndUpdate({ _id: req.params.id, sellerId: req.user.id }, updates, { new: true });
        res.json({ success: true, product });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
