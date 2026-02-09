const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
    // DEĞİŞİKLİK BURADA: String yerine ObjectId ve ref kullanıyoruz
    brand: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Brand', 
        required: true 
    },
    model: { type: String, required: true },
    years: { type: String, required: true },
    modelPhoto: { type: String, default: "" }, 
    engine: { type: String, required: true },
    bodyStyle: { 
        type: String, 
        required: true,
        enum: ["Sedan", "Hatchback", "SUV", "Station Wagon"]
    },
    hp: { type: String },
    kw: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Car', CarSchema);