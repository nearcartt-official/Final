const mongoose = require('mongoose');
const reelSchema = new mongoose.Schema({
    sellerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerName:      { type: String },
    emoji:           { type: String, default: '🎬' },
    title:           { type: String, required: true },
    desc:            { type: String, default: '' },
    taggedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    likes:           { type: Number, default: 0 },
    views:           { type: Number, default: 0 },
    comments:        { type: Number, default: 0 },
    isActive:        { type: Boolean, default: true },
    createdAt:       { type: Date, default: Date.now }
});
module.exports = mongoose.model('Reel', reelSchema);
