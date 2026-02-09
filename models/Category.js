const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    image: { 
        type: String, 
        default: null // Alt kategorilerde boş kalacak, ana kategorilerde URL olacak
    },
    parent: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        default: null // Boşsa bu bir ana kategoridir
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);