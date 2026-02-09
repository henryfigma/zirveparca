require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('✅ MongoDB Atlas bağlandı');

        // Önce temizlik: Eğer silinmediyse buradan silelim
        await User.deleteOne({ username: 'admin' });

        const admin = new User({
            username: 'admin',
            password: 'admin123', // Modelindeki 'pre-save' bunu otomatik hash'leyecek
            role: 'admin'
        });

        await admin.save();
        console.log('🚀 Admin başarıyla oluşturuldu!');
        console.log('Kullanıcı: admin | Şifre: admin123');

        process.exit(0);
    } catch (err) {
        console.error('Hata:', err);
        process.exit(1);
    }
}

createAdmin();