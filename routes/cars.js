const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const mongoose = require('mongoose');

// 1. TÜM ARAÇLARI GETİR
router.get('/', async (req, res) => {
    try {
        const cars = await Car.find().populate('brand').sort({ model: 1 });
        res.json(cars);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// 2. MARKAYA GÖRE FİLTRELE
router.get('/brand/:brandId', async (req, res) => {
    try {
        const { brandId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(brandId)) return res.status(400).json([]);

        const cars = await Car.find({ brand: brandId }).populate('brand');
        res.json(cars);
    } catch (err) { 
        res.status(500).json([]); 
    }
});

// 3. TEK BİR ARACI ID İLE GETİR
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Geçersiz araç ID" });
        }

        const car = await Car.findById(id).populate('brand');
        if (!car) {
            return res.status(404).json({ message: "Araç bulunamadı" });
        }
        res.json(car);
    } catch (err) {
        console.error("Araç getirme hatası:", err);
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

// 4. ARAÇ EKLE
router.post('/', async (req, res) => {
    try {
        const newCar = new Car(req.body);
        const savedCar = await newCar.save();
        const populatedCar = await Car.findById(savedCar._id).populate('brand');
        res.status(201).json(populatedCar);
    } catch (err) { 
        res.status(400).json({ message: err.message }); 
    }
});

// 🚀 5. ARAÇ GÜNCELLEME (YENİ EKLENDİ)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Geçersiz araç ID formatı" });
        }

        // Body içinden güncellenmemesi gereken sistem alanlarını çıkartıyoruz
        const { _id, createdAt, updatedAt, __v, ...updateData } = req.body;

        const updatedCar = await Car.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true } // runValidators: Şemadaki enum/required kontrollerini yapar
        ).populate('brand');

        if (!updatedCar) {
            return res.status(404).json({ message: "Güncellenecek araç bulunamadı" });
        }

        res.json(updatedCar);
    } catch (err) {
        console.error("Güncelleme hatası:", err);
        res.status(400).json({ message: err.message });
    }
});

// 6. ARAÇ SİL
router.delete('/:id', async (req, res) => {
    try {
        const deletedCar = await Car.findByIdAndDelete(req.params.id);
        if (!deletedCar) {
            return res.status(404).json({ message: "Silinecek araç bulunamadı" });
        }
        res.json({ message: "Araç başarıyla silindi" });
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

module.exports = router;