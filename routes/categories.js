const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// @route   POST /api/categories
router.post('/', async (req, res) => {
    try {
        const { name, image, parent } = req.body;

        if (parent && parent !== "") {
            const parentExists = await Category.findById(parent);
            if (!parentExists) return res.status(400).json({ message: "Seçilen ana kategori bulunamadı!" });
        }

        const newCat = new Category({ 
            name, 
            image: (parent && parent !== "") ? null : image, 
            parent: (parent && parent !== "") ? parent : null 
        });

        await newCat.save();
        res.status(201).json(newCat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Sunucu hatası oluştu." });
    }
});

// @route   GET /api/categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().populate('parent');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: "Kategoriler yüklenemedi." });
    }
});

// @route   PUT /api/categories/:id (YENİ EKLENDİ)
// @desc    Mevcut kategoriyi günceller
router.put('/:id', async (req, res) => {
    try {
        const { name, image, parent } = req.body;

        // Güncellenecek veriyi hazırla
        const updateData = {
            name,
            image: (parent && parent !== "") ? null : image,
            parent: (parent && parent !== "") ? parent : null
        };

        const updatedCat = await Category.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true } // Güncellenmiş halini döndür
        );

        if (!updatedCat) return res.status(404).json({ message: "Kategori bulunamadı." });

        res.json(updatedCat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Güncelleme sırasında sunucu hatası." });
    }
});

// @route   DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Kategori silindi." });
    } catch (err) {
        res.status(500).json({ message: "Silme işlemi başarısız." });
    }
});

module.exports = router;