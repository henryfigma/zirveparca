const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    
    // --- YENİ EKLENEN: ADRES DEFTERİ ---
    // Her adresin otomatik bir _id'si olacak, bu sayede tek tek silebileceğiz.
    addresses: [
        {
            title: { type: String, required: true }, // Örn: Evim, İş Yerim, Ankara Ofis
            detail: { type: String, required: true } // Tam açık adres
        }
    ],
    
    // Garaj: Kullanıcının eklediği arabaların referansları (Car modeline bağlı)
    garage: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
    
    // Yasal Onaylar
    agreements: {
        membership: { type: Boolean, default: false },
        kvkk: { type: Boolean, default: false }
    },
    
    createdAt: { type: Date, default: Date.now }
});

// Şifre değiştirme işlemlerinde veya profil güncellemelerinde 
// karmaşıklığı önlemek için timestamps eklemek iyi bir fikirdir (Opsiyonel)
// UserSchema.set('timestamps', true); 

module.exports = mongoose.model('User', UserSchema);