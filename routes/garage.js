const express = require('express');
const router = express.Router();
const User = require('../models/User');
// DÜZELTME: Süslü parantez içine alıp doğru ismi (protect) kullanıyoruz
const { protect } = require('../middleware/auth'); 

// @route   POST api/garage/add
// @desc    Garaja araç ekle
router.post('/add', protect, async (req, res) => {
    try {
        const { carId } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        // Aracın zaten garajda olup olmadığını kontrol et
        if (user.garage.includes(carId)) {
            return res.status(400).json({ message: "Bu araç zaten garajınızda." });
        }

        user.garage.push(carId);
        await user.save();
        
        // Güncel garajı döndür
        res.json({ message: "Araç garaja eklendi", garage: user.garage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

// @route   GET api/garage
// @desc    Kullanıcının garajındaki araçları listele
router.get('/', protect, async (req, res) => {
    try {
        // Populate zinciri: Önce araçları, sonra o araçların bağlı olduğu markayı getirir
        const user = await User.findById(req.user.id).populate({
            path: 'garage',
            populate: { path: 'brand' } 
        });

        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        
        res.json(user.garage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Garaj bilgileri getirilemedi" });
    }
});

// @route   DELETE api/garage/:id
// @desc    Garajdan araç kaldır
router.delete('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        // Aracı diziden çıkar
        user.garage = user.garage.filter(car => car.toString() !== req.params.id);
        
        await user.save();
        res.json({ message: "Araç garajdan kaldırıldı", garage: user.garage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Silme işlemi sırasında hata oluştu" });
    }
});

module.exports = router;