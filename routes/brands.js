const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');

// 1. Tüm Markaları Getir (GET)
router.get('/', async (req, res) => {
    try {
        // Markaları alfabetik sırayla getirmek için .sort({ name: 1 }) ekledim
        const brands = await Brand.find().sort({ name: 1 });
        res.json(brands);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Marka Ekleme (POST)
router.post('/', async (req, res) => {
    try {
        const { name, logo } = req.body;
        const newBrand = new Brand({ name, logo });
        await newBrand.save();
        res.status(201).json(newBrand);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. Marka Güncelleme (PUT) - YENİ EKLENDİ
router.put('/:id', async (req, res) => {
    try {
        const { name, logo } = req.body;
        const updatedBrand = await Brand.findByIdAndUpdate(
            req.params.id,
            { name, logo },
            { new: true } // Güncellenmiş veriyi döndürmesi için
        );
        
        if (!updatedBrand) {
            return res.status(404).json({ message: "Güncellenecek marka bulunamadı" });
        }
        
        res.json(updatedBrand);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. Marka Silme (DELETE) - YENİ EKLENDİ
router.delete('/:id', async (req, res) => {
    try {
        const deletedBrand = await Brand.findByIdAndDelete(req.params.id);
        
        if (!deletedBrand) {
            return res.status(404).json({ message: "Silinecek marka bulunamadı" });
        }
        
        res.json({ message: "Marka başarıyla silindi" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;