const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name_en:        { type: String, required: true },
    name_hi:        { type: String, default: '' },
    price:          { type: Number, required: true },
    stock:          { type: Number, default: 10 },
    icon:           { type: String, default: '🛍️' },
    photoUrl:       { type: String, default: null },
    description_en: { type: String, default: '' },
    description_hi: { type: String, default: '' },
    category:       { type: String, default: 'Other' },
    sellerId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller_en:      { type: String },
    distance:       { type: String, default: 'Nearby' },
    isActive:       { type: Boolean, default: true },
    createdAt:      { type: Date, default: Date.now }
});
module.exports = mongoose.model('Product', productSchema);
