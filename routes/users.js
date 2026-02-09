const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cart = require('../models/Cart');

// TÜM KULLANICILARI DETAYLI GETİR
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate({
                path: 'garage',
                model: 'Car',
                populate: {
                    path: 'brand',
                    model: 'Brand'
                }
            })
            .sort({ createdAt: -1 });

        const usersWithCart = await Promise.all(users.map(async (user) => {
            // Paylaştığın DB yapısında alan adı "user"
            const cart = await Cart.findOne({ user: user._id })
                .populate({
                    path: 'items.part', // Paylaştığın DB yapısında alan adı "part"
                    model: 'Part',
                    select: 'name sku price photo brand oem stock' 
                });
            
            return {
                ...user.toObject(),
                cart: cart || { items: [] }
            };
        }));

        res.json(usersWithCart);
    } catch (err) {
        console.error("User List Hatası:", err);
        res.status(500).json({ message: "Kullanıcılar getirilemedi." });
    }
});

// KULLANICI SİL
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        await Cart.findOneAndDelete({ user: req.params.id });
        res.json({ message: "Silindi." });
    } catch (err) { res.status(500).json({ message: "Hata." }); }
});

// KULLANICI GÜNCELLE
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(updatedUser);
    } catch (err) { res.status(400).json({ message: "Hata." }); }
});

module.exports = router;