const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // items alanını düz Array yerine referanslı dizi yaptık
    items: [
        {
            part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
            quantity: { type: Number, default: 1 },
            priceAtAdd: { type: Number, required: true }
        }
    ],
    totalAmount: Number,
    address: Object,
    deliveryMethod: String,
    paymentMethod: String, 
    status: { type: String, default: 'Sipariş Alındı' },
    currentStep: { type: Number, default: 0 },
    cargoCompany: { type: String, default: '' },
    trackingCode: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);