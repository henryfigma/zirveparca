const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @desc    Merkezi Populate Ayarı
// Önemli: Senin model ismin 'PartBrand', populate ederken bu ismi tam kullanmalıyız.
const fullOrderPopulate = [
    { path: 'user', select: 'name email' },
    { 
        path: 'items.part', 
        model: 'Part',
        populate: {
            path: 'brand', 
            model: 'PartBrand' // <--- BURASI DÜZELTİLDİ: Senin model isminle eşleşti.
        }
    }
];

// @desc    Tüm Siparişleri Getir
router.get('/', protect, async (req, res) => {
    try {
        let orders;
        const query = req.user.role === 'admin' ? {} : { user: req.user.id };

        orders = await Order.find(query)
            .populate(fullOrderPopulate)
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Siparişler getirilemedi", error: err.message });
    }
});

// @desc    Yeni Sipariş Oluştur
router.post('/', protect, async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            user: req.user.id
        });
        const savedOrder = await newOrder.save();
        
        // Kaydedilen siparişi hemen tüm detaylarıyla (marka dahil) çek
        const populatedOrder = await Order.findById(savedOrder._id).populate(fullOrderPopulate);
        
        res.status(201).json(populatedOrder);
    } catch (err) {
        res.status(500).json({ message: "Sipariş kaydedilemedi", error: err.message });
    }
});

// @desc    Sipariş Güncelle (ADMIN)
router.put('/:id', protect, async (req, res) => {
    try {
        const { status, currentStep, trackingCode, cargoCompany } = req.body;
        
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status, currentStep, trackingCode, cargoCompany },
            { new: true }
        ).populate(fullOrderPopulate);

        if (!updatedOrder) return res.status(404).json({ message: "Sipariş bulunamadı" });
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: "Güncelleme hatası", error: err.message });
    }
});

// @desc    Siparişi Sil (ADMIN)
router.delete('/:id', protect, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Sipariş silindi" });
    } catch (err) {
        res.status(500).json({ message: "Silme hatası" });
    }
});

module.exports = router;