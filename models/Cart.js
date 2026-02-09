const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
            quantity: { type: Number, default: 1 },
            priceAtAdd: { type: Number, required: true } // Ürün eklendiğindeki fiyat (ileride fiyat değişirse takip için)
        }
    ],
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);