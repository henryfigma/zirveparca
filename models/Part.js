const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
    name: { type: String, required: true },
    oem: { type: String, required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'PartBrand', required: true },
    // KRİTİK ALANLAR:
    mainCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Üst grup
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },     // Alt grup (veya aynısı)
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    photo: { type: String },
    description: { type: String },
    compatibleCars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }]
}, { timestamps: true });

module.exports = mongoose.model('Part', PartSchema);