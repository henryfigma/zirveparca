const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            return next(); // Return ekledik ki aşağıya sızmasın
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Yetkilendirme başarısız, token geçersiz.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Token bulunamadı, giriş yapmalısınız.' });
    }
};

// EKSİK OLAN ADMIN FONKSİYONUNU EKLEDİK
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Yetkiniz yok, sadece adminler erişebilir.' });
    }
};

// HER İKİSİNİ DE EXPORT EDİYORUZ
module.exports = { protect, admin };