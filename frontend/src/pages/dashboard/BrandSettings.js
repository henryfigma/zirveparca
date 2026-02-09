import React, { useState } from 'react';
import API from '../../api';

const BrandSettings = () => {
    const [newBrand, setNewBrand] = useState({ name: '', logo: '' });
    const [newPartBrand, setNewPartBrand] = useState({ name: '', logo: '' });

    const handleBrandSubmit = async () => { 
        if(!newBrand.name) return alert("İsim giriniz");
        try {
            await API.post('/brands', newBrand); 
            setNewBrand({name:'', logo:''}); 
            alert("✅ Araç Markası Eklendi!"); 
        } catch(err) { alert("Hata oluştu."); }
    };

    const handlePartBrandSubmit = async () => { 
        if(!newPartBrand.name) return alert("İsim giriniz");
        try {
            await API.post('/part-brands', newPartBrand); 
            setNewPartBrand({ name: '', logo: '' }); 
            alert("✅ Parça Üreticisi Eklendi!"); 
        } catch(err) { alert("Hata oluştu."); }
    };

    return (
        <div style={styles.grid2}>
            <div style={styles.formCard}>
                <div style={styles.header}>
                    <span style={{fontSize: '24px'}}>🚗</span>
                    <h3>Araç Markası Ekle</h3>
                </div>
                <p style={styles.info}>Sistemde araçları gruplandırmak için kullanılan ana markalar.</p>
                <input placeholder="Marka Adı (Örn: Audi)" value={newBrand.name} onChange={e => setNewBrand({...newBrand, name: e.target.value})} style={styles.input} />
                <input placeholder="Logo URL" value={newBrand.logo} onChange={e => setNewBrand({...newBrand, logo: e.target.value})} style={styles.input} />
                <button onClick={handleBrandSubmit} style={styles.submitBtn}>Markayı Kaydet</button>
            </div>

            <div style={styles.formCard}>
                <div style={styles.header}>
                    <span style={{fontSize: '24px'}}>📦</span>
                    <h3>Parça Üreticisi Ekle</h3>
                </div>
                <p style={styles.info}>Ürünlerin markası olarak seçilecek üreticiler (Yan Sanayi/Logolu).</p>
                <input placeholder="Üretici Adı (Örn: Bosch)" value={newPartBrand.name} onChange={e => setNewPartBrand({...newPartBrand, name: e.target.value})} style={styles.input} />
                <input placeholder="Logo URL" value={newPartBrand.logo} onChange={e => setNewPartBrand({...newPartBrand, logo: e.target.value})} style={styles.input} />
                <button onClick={handlePartBrandSubmit} style={{...styles.submitBtn, backgroundColor: '#34495e'}}>Üreticiyi Kaydet</button>
            </div>
        </div>
    );
};

const styles = {
    grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px' },
    formCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    header: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' },
    info: { fontSize: '13px', color: '#777', marginBottom: '20px' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
    submitBtn: { width: '100%', padding: '14px', backgroundColor: '#2e89ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default BrandSettings;