const express = require('express');
const router = express.Router();
const PartBrand = require('../models/PartBrand');

// 1. Tüm parça markalarını getir
router.get('/', async (req, res) => {
    try {
        const brands = await PartBrand.find().sort({ name: 1 });
        res.json(brands);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Yeni parça markası ekle
router.post('/', async (req, res) => {
    const brand = new PartBrand({
        name: req.body.name,
        logo: req.body.logo
    });
    try {
        const savedBrand = await brand.save();
        res.status(201).json(savedBrand);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. Parça markası güncelle (YENİ)
router.put('/:id', async (req, res) => {
    try {
        const updated = await PartBrand.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name, logo: req.body.logo },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. Parça markası sil (YENİ)
router.delete('/:id', async (req, res) => {
    try {
        await PartBrand.findByIdAndDelete(req.params.id);
        res.json({ message: "Parça markası silindi" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;