const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

// @desc    Sepeti getir
router.get('/', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.part');
        if (!cart) return res.json({ items: [] });
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

// @desc    Sepete ürün ekle / Miktar güncelle
router.post('/add', protect, async (req, res) => {
    const { partId, quantity, price } = req.body;
    try {
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        const itemIndex = cart.items.findIndex(p => p.part.toString() === partId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += Number(quantity);
            if (cart.items[itemIndex].quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            }
        } else {
            if (Number(quantity) > 0) {
                cart.items.push({
                    part: partId,
                    quantity: Number(quantity),
                    priceAtAdd: Number(price)
                });
            }
        }

        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate('items.part');
        res.status(200).json(updatedCart);
    } catch (err) {
        res.status(500).json({ message: "İşlem başarısız" });
    }
});

// @desc    Sepetten TEK ürün sil
router.delete('/:itemId', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ message: "Sepet bulunamadı" });

        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate('items.part');
        res.json(updatedCart || { items: [] });
    } catch (err) {
        res.status(500).json({ message: "Silinemedi" });
    }
});

// @desc    Sepeti TAMAMEN boşalt (Sipariş sonrası kullanım için)
// Frontend'den API.delete('/cart') isteği buraya düşer
router.delete('/', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.items = []; // Diziyi sıfırla
            await cart.save();
        }
        res.status(200).json({ message: "Sepet temizlendi", items: [] });
    } catch (err) {
        res.status(500).json({ message: "Sepet temizlenirken hata oluştu" });
    }
});

module.exports = router;