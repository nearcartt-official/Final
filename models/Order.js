const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    orderId:   { type: String, unique: true },
    customerId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name_en:   String,
        name_hi:   String,
        icon:      String,
        price:     Number,
        quantity:  Number
    }],
    total:           { type: Number, required: true },
    status:          { type: String, enum: ['pending','processing','delivered','cancelled'], default: 'pending' },
    deliveryAddress: { type: Object },
    paymentMethod:   { type: String, default: 'upi' },
    paymentStatus:   { type: String, enum: ['pending','paid'], default: 'paid' },
    createdAt:       { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', orderSchema);
