import React, { useState, useEffect } from 'react';
import API from '../../api';

const CategoryForm = () => {
    const [mainCategories, setMainCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', image: '', parent: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadMainCategories();
    }, []);

    const loadMainCategories = async () => {
        try {
            const res = await API.get('/categories');
            // Sadece ana kategorileri filtrele
            setMainCategories(res.data.filter(c => !c.parent));
        } catch (err) {
            console.error("Kategoriler yüklenemedi", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- KONTROL MEKANİZMALARI ---
        
        // 1. İsim Kontrolü
        if (formData.name.trim().length < 2) {
            alert("❌ Kategori adı en az 2 karakter olmalıdır.");
            return;
        }

        // 2. Ana Kategori ise Görsel Kontrolü (Zorunlu tutmak isterseniz)
        if (!formData.parent && !formData.image) {
            alert("❌ Ana kategoriler için bir görsel URL'si eklemelisiniz.");
            return;
        }

        setLoading(true);
        try {
            // Backend'e gönderilecek veriyi temizleyelim
            const payload = {
                name: formData.name.trim(),
                parent: formData.parent || null, // Boş string yerine null gönderiyoruz
                image: formData.parent ? "" : formData.image // Alt kategori ise görseli sil
            };

            await API.post('/categories', payload);
            
            alert("✅ Kategori başarıyla eklendi!");
            
            // Formu sıfırla
            setFormData({ name: '', image: '', parent: '' });
            
            // Listeyi tazele (Yeni eklenen ana kategori dropdown'a gelsin)
            loadMainCategories();
            
        } catch (err) {
            console.error(err);
            alert("❌ Ekleme hatası: " + (err.response?.data?.message || "Sunucuya ulaşılamadı"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.formCard}>
            <div style={styles.header}>
                <h2 style={styles.title}>
                    {formData.parent ? '📂 Alt Kategori Ekle' : '📁 Ana Kategori Ekle'}
                </h2>
                <p style={styles.subtitle}>Sistem hiyerarşisine yeni bir sınıf ekleyin.</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Hiyerarşi Seviyesi</label>
                <select 
                    value={formData.parent} 
                    onChange={e => setFormData({...formData, parent: e.target.value, image: ''})}
                    style={styles.input}
                >
                    <option value="">-- Yeni Ana Kategori Olarak Belirle --</option>
                    {mainCategories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>

                <label style={styles.label}>Kategori Adı</label>
                <input 
                    placeholder="Örn: Aydınlatma Grubu" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    style={styles.input}
                    required
                />

                {/* Sadece ana kategori seçiliyse görsel inputunu göster */}
                {!formData.parent && (
                    <>
                        <label style={styles.label}>Kategori İkon/Görsel URL</label>
                        <input 
                            placeholder="https://site.com/gorsel.png" 
                            value={formData.image}
                            onChange={e => setFormData({...formData, image: e.target.value})}
                            style={styles.input}
                        />
                        {formData.image && (
                            <div style={styles.previewContainer}>
                                <img src={formData.image} alt="Önizleme" style={styles.preview} onError={(e) => e.target.style.display='none'} />
                                <span style={{fontSize:'10px', color:'#999'}}>Görsel Önizlemesi</span>
                            </div>
                        )}
                    </>
                )}

                <button 
                    type="submit" 
                    style={{...styles.saveBtn, opacity: loading ? 0.7 : 1}}
                    disabled={loading}
                >
                    {loading ? 'KAYDEDİLİYOR...' : 'KATEGORİYİ SİSTEME EKLE'}
                </button>
            </form>
        </div>
    );
};

const styles = {
    formCard: { background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', maxWidth: '450px', margin: '40px auto', border: '1px solid #f1f5f9' },
    header: { textAlign: 'center', marginBottom: '30px' },
    title: { margin: '0 0 10px 0', color: '#1e293b', fontSize: '22px', fontWeight: '800' },
    subtitle: { color: '#64748b', fontSize: '14px', margin: 0 },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    label: { fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', transition: 'border 0.2s', background: '#f8fafc' },
    saveBtn: { padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)', marginTop: '10px' },
    previewContainer: { textAlign: 'center', background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px dashed #cbd5e1' },
    preview: { width: '60px', height: '60px', objectFit: 'contain', marginBottom: '5px' }
};

export default CategoryForm;