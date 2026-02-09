const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Middleware klasöründeki dosya adın auth.js olduğu için yolu böyle düzelttim:
const { protect } = require('../middleware/auth'); 

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, phone, password, membershipAgreed, kvkkAgreed } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });

        user = new User({
            fullName, email, phone, password,
            agreements: { membership: membershipAgreed, kvkk: kvkkAgreed }
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.status(201).json({ message: "Kayıt başarılı." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Kullanıcı bulunamadı' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Şifre yanlış' });

        const token = jwt.sign(
            { id: user._id, role: user.role, fullName: user.fullName },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ 
            token, 
            role: user.role, 
            user: { fullName: user.fullName, email: user.email } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Profil bilgileri alınamadı.' });
    }
});

// @route   PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mevcut şifreniz hatalı.' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Şifreniz başarıyla güncellendi.' });
    } catch (err) {
        res.status(500).json({ message: 'Şifre güncellenemedi.' });
    }
});

// @route   POST /api/auth/address
router.post('/address', protect, async (req, res) => {
    try {
        const { title, detail } = req.body;
        const user = await User.findById(req.user.id);
        user.addresses.push({ title, detail });
        await user.save();
        res.status(201).json({ message: 'Adres eklendi.', addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ message: 'Adres eklenemedi.' });
    }
});

// @route   DELETE /api/auth/address/:addressId
router.delete('/address/:addressId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
        await user.save();
        res.json({ message: 'Adres silindi.', addresses: user.addresses });
    } catch (err) {
        res.status(500).json({ message: 'Adres silinemedi.' });
    }
});

module.exports = router;