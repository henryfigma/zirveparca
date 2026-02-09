const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json()); 

// Veritabanı Bağlantısı
const MONGO_URI = process.env.MONGO_URI; 
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Bağlantısı Başarılı"))
    .catch(err => console.error("❌ MongoDB Bağlantı Hatası:", err));

// --- Route Tanımlamaları ---
const authRoutes = require('./routes/auth');
const brandRoutes = require('./routes/brands');
const carRoutes = require('./routes/cars');
const partBrandRoutes = require('./routes/partbrands');
const partRoutes = require('./routes/parts');
const categoryRoutes = require('./routes/categories'); // DÜZELTİLDİ: models değil routes olmalı
const garageRoutes = require('./routes/garage');
const cartRoutes = require('./routes/cart'); 
const userRoutes = require('./routes/users'); 
const orderRoutes = require('./routes/orders'); // Sipariş rotası

// --- API Yolları ---
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/part-brands', partBrandRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/garage', garageRoutes);
app.use('/api/cart', cartRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
    res.send('Zirve Yedek Parça API Sunucusu Çalışıyor...');
});

// Sunucu Başlatma
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sunucu ${PORT} portunda yayında!`);
    console.log(`📡 Yerel Ağ IP: 192.168.1.118`);
});