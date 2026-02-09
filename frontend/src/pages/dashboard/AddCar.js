import React, { useState, useEffect } from 'react';
import API from '../../api';

const AddCar = () => {
    const [allBrands, setAllBrands] = useState([]);
    const [allCars, setAllCars] = useState([]);
    const [tempModels, setTempModels] = useState([]);
    const [tempEngines, setTempEngines] = useState([]);
    const [subTab, setSubTab] = useState('newEngine');

    const [newCarForm, setNewCarForm] = useState({ brand: '', model: '', years: '', engine: '', hp: '', kw: '', bodyStyle: '', modelPhoto: '' });
    const [variantForm, setVariantForm] = useState({ brand: '', model: '', years: '', engine: '', hp: '', kw: '', bodyStyle: '', modelPhoto: '' });

    const bodyStyles = ["Sedan", "Hatchback", "SUV", "Station Wagon"];

    useEffect(() => { loadInitialData(); }, []);

    const loadInitialData = async () => {
        try {
            const [bRes, cRes] = await Promise.all([API.get('/brands'), API.get('/cars')]);
            setAllBrands(bRes.data);
            setAllCars(cRes.data);
        } catch (err) { console.error("Veri yükleme hatası:", err); }
    };

    // Marka Değiştiğinde Modelleri Getir
    const handleBrandChange = (brandId) => {
        const models = [...new Set(allCars.filter(c => {
            // Brand ID veya Obje olabilir, her iki durumda da kontrol et
            const carBrandId = (c.brand && typeof c.brand === 'object') ? c.brand._id : c.brand;
            return carBrandId === brandId;
        }).map(c => c.model))];
        
        setTempModels(models);
        setVariantForm({ ...variantForm, brand: brandId, model: '', engine: '', hp: '', kw: '', years: '', modelPhoto: '' });
    };

    // Model Değiştiğinde Motorları Getir
    const handleModelChange = (modelName) => {
        const engines = allCars.filter(c => {
            const carBrandId = (c.brand && typeof c.brand === 'object') ? c.brand._id : c.brand;
            return carBrandId === variantForm.brand && c.model === modelName;
        });
        setTempEngines(engines);
        setVariantForm({ ...variantForm, model: modelName, engine: '', hp: '', kw: '', years: '', modelPhoto: '' });
    };

    const handleEngineSelect = (e) => {
        const selectedId = e.target.value;
        const selectedCar = allCars.find(c => c._id === selectedId);
        if (selectedCar) {
            setVariantForm({ 
                ...variantForm, 
                engine: selectedCar.engine, 
                hp: selectedCar.hp || '', 
                kw: selectedCar.kw || '',
                years: selectedCar.years || '',
                modelPhoto: selectedCar.modelPhoto || ''
            });
        }
    };

    const handleSubmit = async (e, formData, isNewSeri = false) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            hp: formData.hp ? String(formData.hp) : "0",
            kw: formData.kw ? String(formData.kw) : "0"
        };

        try {
            await API.post('/cars', dataToSend);
            alert("✅ Başarıyla Kaydedildi!");
            
            if(isNewSeri) {
                setNewCarForm({ brand: '', model: '', years: '', engine: '', hp: '', kw: '', bodyStyle: '', modelPhoto: '' });
            } else {
                setVariantForm({ ...variantForm, engine: '', hp: '', kw: '', bodyStyle: '', years: '', modelPhoto: '' });
            }
            loadInitialData(); // Verileri tazele
        } catch (err) {
            alert(`❌ Hata: ${err.response?.data?.message || "Hata oluştu!"}`);
        }
    };

    return (
        <div style={styles.container}>
            {/* SOL TARAF: SIFIRDAN YENİ MODEL */}
            <div style={styles.card}>
                <div style={styles.header}><h3>🆕 Sıfırdan Model Tanımla</h3></div>
                <form onSubmit={(e) => handleSubmit(e, newCarForm, true)}>
                    <label style={styles.label}>Marka</label>
                    <select value={newCarForm.brand} onChange={e => setNewCarForm({...newCarForm, brand: e.target.value})} style={styles.input} required>
                        <option value="">Marka Seç...</option>
                        {allBrands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                    <input placeholder="Model Adı (Örn: Golf)" value={newCarForm.model} onChange={e => setNewCarForm({...newCarForm, model: e.target.value})} style={styles.input} required />
                    <input placeholder="Motor Tipi (Örn: 1.6 TDI)" value={newCarForm.engine} onChange={e => setNewCarForm({...newCarForm, engine: e.target.value})} style={styles.input} required />
                    
                    <div style={styles.row}>
                        <input placeholder="HP" value={newCarForm.hp} onChange={e => setNewCarForm({...newCarForm, hp: e.target.value})} style={styles.input} />
                        <input placeholder="KW" value={newCarForm.kw} onChange={e => setNewCarForm({...newCarForm, kw: e.target.value})} style={styles.input} />
                    </div>

                    <select value={newCarForm.bodyStyle} onChange={e => setNewCarForm({...newCarForm, bodyStyle: e.target.value})} style={styles.input} required>
                        <option value="">Kasa Tipi Seç...</option>
                        {bodyStyles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <input placeholder="Üretim Yılları (Örn: 2012-2018)" value={newCarForm.years} onChange={e => setNewCarForm({...newCarForm, years: e.target.value})} style={styles.input} required />
                    <input placeholder="Model Görsel URL" value={newCarForm.modelPhoto} onChange={e => setNewCarForm({...newCarForm, modelPhoto: e.target.value})} style={styles.input} />

                    <button type="submit" style={styles.submitBtn}>Yeni Modeli Kaydet</button>
                </form>
            </div>

            {/* SAĞ TARAF: VARYANT YÖNETİMİ */}
            <div style={{...styles.card, borderLeft: '4px solid #2e89ff'}}>
                <div style={styles.header}><h3>⚙️ Varyant / Kasa Ekle</h3></div>
                
                <div style={styles.tabGroup}>
                    <button type="button" onClick={() => setSubTab('newEngine')} style={subTab === 'newEngine' ? styles.activeTab : styles.passiveTab}>➕ Yeni Motor</button>
                    <button type="button" onClick={() => setSubTab('newBody')} style={subTab === 'newBody' ? styles.activeTab : styles.passiveTab}>🚗 Mevcut Motora Kasa</button>
                </div>

                <form onSubmit={(e) => handleSubmit(e, variantForm)}>
                    <label style={styles.label}>Araç Seçimi</label>
                    <div style={styles.row}>
                        <select value={variantForm.brand} onChange={e => handleBrandChange(e.target.value)} style={styles.input} required>
                            <option value="">Marka...</option>
                            {allBrands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                        <select value={variantForm.model} onChange={e => handleModelChange(e.target.value)} style={styles.input} required disabled={!variantForm.brand}>
                            <option value="">Model...</option>
                            {tempModels.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    {subTab === 'newEngine' ? (
                        <div style={styles.subBox}>
                            <label style={styles.label}>Yeni Motor Bilgileri</label>
                            <input placeholder="Motor Tipi" value={variantForm.engine} onChange={e => setVariantForm({...variantForm, engine: e.target.value})} style={styles.input} required />
                            <div style={styles.row}>
                                <input placeholder="HP" value={variantForm.hp} onChange={e => setVariantForm({...variantForm, hp: e.target.value})} style={styles.input} />
                                <input placeholder="KW" value={variantForm.kw} onChange={e => setVariantForm({...variantForm, kw: e.target.value})} style={styles.input} />
                            </div>
                        </div>
                    ) : (
                        <div style={styles.subBox}>
                            <label style={styles.label}>Sistemdeki Motoru Seç</label>
                            <select onChange={handleEngineSelect} style={styles.input} required disabled={!variantForm.model}>
                                <option value="">Motor Tipi Seçin...</option>
                                {tempEngines.map(c => <option key={c._id} value={c._id}>{c.engine} ({c.hp} HP)</option>)}
                            </select>
                        </div>
                    )}

                    <select value={variantForm.bodyStyle} onChange={e => setVariantForm({...variantForm, bodyStyle: e.target.value})} style={styles.input} required>
                        <option value="">Kasa Tipi...</option>
                        {bodyStyles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input placeholder="Üretim Yılları" value={variantForm.years} onChange={e => setVariantForm({...variantForm, years: e.target.value})} style={styles.input} required />
                    <input placeholder="Görsel URL (Opsiyonel)" value={variantForm.modelPhoto} onChange={e => setVariantForm({...variantForm, modelPhoto: e.target.value})} style={styles.input} />

                    <button type="submit" style={{...styles.submitBtn, backgroundColor: '#28a745'}}>Varyantı Kaydet</button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '20px' },
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    header: { marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    tabGroup: { display: 'flex', gap: '5px', marginBottom: '20px', backgroundColor: '#f1f2f6', padding: '5px', borderRadius: '10px' },
    activeTab: { flex: 1, padding: '10px', border: 'none', backgroundColor: '#fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' },
    passiveTab: { flex: 1, padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px', color: '#666' },
    label: { fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '8px', display: 'block' },
    input: { width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
    row: { display: 'flex', gap: '10px' },
    subBox: { padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '10px', marginBottom: '15px', border: '1px solid #e9ecef' },
    submitBtn: { width: '100%', padding: '14px', backgroundColor: '#2e89ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default AddCar;