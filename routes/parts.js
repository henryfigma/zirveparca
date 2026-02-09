const express = require('express');
const router = express.Router();
const Part = require('../models/Part');
const Brand = require('../models/Brand'); 
const PartBrand = require('../models/PartBrand');
const Car = require('../models/Car');
const Category = require('../models/Category');

// 1. TÜM PARÇALARI GETİR
router.get('/', async (req, res) => {
    try {
        const { search, carId } = req.query; 
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { oem: { $regex: search, $options: 'i' } }
            ];
        }
        if (carId) query.compatibleCars = carId;

        const parts = await Part.find(query)
            .populate({ path: 'brand', model: 'PartBrand' })
            .populate({
                path: 'compatibleCars',
                model: 'Car',
                populate: { path: 'brand', model: 'Brand' }
            })
            .populate('mainCategory')
            .populate('category')
            .lean(); // Hız için

        res.json(parts);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. ARACA UYUMLU PARÇALARI GETİR
router.get('/compatible/:carId', async (req, res) => {
    try {
        const parts = await Part.find({ compatibleCars: req.params.carId })
            .populate({ path: 'brand', model: 'PartBrand' })
            .populate('mainCategory')
            .populate('category')
            .lean();
        res.json(parts);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 🚀 3. TEKİL PARÇA (OPTIMIZE EDİLMİŞ HIZLI VERSİYON)
router.get('/:id', async (req, res) => {
    try {
        // Paralel sorgu: Ana parça ve alternatifler aynı anda aranır
        const mainPartQuery = Part.findById(req.params.id)
            .populate({ path: 'brand', model: 'PartBrand' })
            .populate({
                path: 'compatibleCars',
                model: 'Car',
                populate: { path: 'brand', model: 'Brand' }
            })
            .populate('mainCategory')
            .populate('category')
            .lean();

        const part = await mainPartQuery;
        if (!part) return res.status(404).json({ message: "Parça bulunamadı" });

        // Alternatifleri bul (Sadece gerekli alanları seçerek veri paketini hafifletiyoruz)
        const alternatives = await Part.find({ 
            oem: part.oem, 
            _id: { $ne: part._id } 
        })
        .select('name price photo stock brand oem')
        .populate({ path: 'brand', model: 'PartBrand' })
        .lean();

        res.json({ part, alternatives });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. YÖNETİM ROTALARI
router.post('/', async (req, res) => {
    try {
        const part = new Part(req.body);
        const savedPart = await part.save(); 
        res.status(201).json(savedPart); 
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedPart = await Part.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(updatedPart);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await Part.findByIdAndDelete(req.params.id);
        res.json({ message: "Silindi" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;