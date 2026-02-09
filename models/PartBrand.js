const mongoose = require('mongoose');

const PartBrandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    logo: { type: String, default: "" }
});

module.exports = mongoose.model('PartBrand', PartBrandSchema);