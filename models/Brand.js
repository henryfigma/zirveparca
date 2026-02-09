const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    logo: {
        type: String, // Görsel URL buraya gelecek
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model('Brand', BrandSchema);