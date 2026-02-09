import React, { useState, useEffect } from 'react';
import API from '../../api';

const AddPart = () => {
    const [allBrands, setAllBrands] = useState([]);
    const [partBrands, setPartBrands] = useState([]);
    const [allCars, setAllCars] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    
    const [isLocked, setIsLocked] = useState(false);
    const [lastAddedBrandId, setLastAddedBrandId] = useState(null);

    const [partForm, setPartForm] = useState({ 
        brand: '', category: '', subCategory: '', name: '', price: '', photo: '', oem: '', description: '', stock: 0 
    });

    const [selectedCarId, setSelectedCarId] = useState('');
    const [compatibilityPool, setCompatibilityPool] = useState([]);
    const [tempModels, setTempModels] = useState([]);
    const [tempEngines, setTempEngines] = useState([]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [bRes, cRes, pbRes, catRes] = await Promise.all([
                API.get('/brands'), 
                API.get('/cars'), 
                API.get('/part-brands'),
                API.get('/categories')
            ]);
            setAllBrands(bRes.data);
            setAllCars(cRes.data);
            setPartBrands(pbRes.data);
            setDbCategories(catRes.data);
        } catch (err) { console.error("Veri yüklenemedi", err); }
    };

    const subCategories = dbCategories.filter(cat => cat.parent && (cat.parent._id === partForm.category || cat.parent === partForm.category));

    const handleBrandSelect = (brandName) => {
        const models = [...new Set(allCars.filter(c => {
            const bName = (c.brand && typeof c.brand === 'object') ? c.brand.name : c.brand;
            return bName === brandName;
        }).map(c => c.model))];
        
        setTempModels(models);
        setTempEngines([]);
        setSelectedCarId('');
    };

    const handleModelSelect = (modelName) => {
        const engines = allCars.filter(c => c.model === modelName);
        setTempEngines(engines);
        setSelectedCarId('');
    };

    const addToPool = () => {
        if (isLocked) return; 
        if (!selectedCarId) return alert("Lütfen bir motor tipi seçin!");
        const car = allCars.find(c => c._id === selectedCarId);
        if (car && !compatibilityPool.find(item => item._id === car._id)) {
            setCompatibilityPool([...compatibilityPool, car]);
        }
    };

    const removeFromPool = (id) => {
        if (isLocked) return; 
        setCompatibilityPool(compatibilityPool.filter(c => c._id !== id));
    };

    const toggleLock = () => {
        if (!isLocked && (compatibilityPool.length === 0 || !partForm.name || !partForm.oem || !partForm.category)) {
            return alert("Kilitlemek için önce havuz, ad, OEM ve Kategori bilgilerini doldurun!");
        }
        setIsLocked(!isLocked);
    };

    const resetPartForm = () => {
        setIsLocked(false);
        setLastAddedBrandId(null);
        setPartForm({ brand: '', category: '', subCategory: '', name: '', price: '', photo: '', oem: '', description: '', stock: 0 });
        setCompatibilityPool([]);
    };

    const handlePartSubmit = async (e) => {
        e.preventDefault();
        if (compatibilityPool.length === 0) return alert("Lütfen en az bir uyumlu araç ekleyin!");
        if (isLocked && partForm.brand === lastAddedBrandId) {
            return alert("Hata: Aynı markayı arka arkaya ekleyemezsiniz!");
        }

        const finalData = { 
            ...partForm, 
            mainCategory: partForm.category, 
            category: partForm.subCategory || partForm.category, 
            compatibleCars: compatibilityPool.map(c => c._id) 
        };

        try {
            await API.post('/parts', finalData);
            setLastAddedBrandId(partForm.brand);
            if (isLocked) {
                setPartForm(prev => ({ ...prev, brand: '', price: '', photo: '', stock: 0 }));
                alert("✅ Alternatif Marka OEM'e Eklendi!");
            } else {
                setPartForm({ brand: '', category: '', subCategory: '', name: '', price: '', photo: '', oem: '', description: '', stock: 0 });
                setCompatibilityPool([]);
                alert("✅ Parça Başarıyla Kaydedildi!");
            }
        } catch (err) { alert("❌ Kayıt hatası!"); }
    };

    return (
        <div style={styles.formCard}>
            <div style={styles.header}>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <span style={{fontSize:'24px'}}>⚙️</span>
                    <div>
                        <h2 style={styles.title}>Parça Ekle & Uyumluluk</h2>
                        <p style={styles.subtitle}>Yeni parça girişi ve araç eşleştirme paneli</p>
                    </div>
                </div>
                {isLocked && <button onClick={resetPartForm} style={styles.resetBtn}>🔓 Kilidi Aç & Sıfırla</button>}
            </div>

            {/* STEP 1: COMPATIBILITY POOL */}
            <div style={{...styles.sectionBox, borderColor: isLocked ? '#e2e8f0' : '#3b82f6', opacity: isLocked ? 0.7 : 1}}>
                <div style={styles.stepHeader}>
                    <span style={styles.stepBadge}>01</span>
                    <h4 style={styles.stepTitle}>Uyumlu Araçları Havuza Ekleyin</h4>
                </div>
                
                <div style={styles.filterRow}>
                    <div style={{flex:1}}>
                        <label style={styles.smallLabel}>Marka</label>
                        <select onChange={e => handleBrandSelect(e.target.value)} style={styles.input} disabled={isLocked}>
                            <option value="">Seçiniz</option>
                            {allBrands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>

                    <div style={{flex:1}}>
                        <label style={styles.smallLabel}>Model</label>
                        <select onChange={e => handleModelSelect(e.target.value)} style={styles.input} disabled={isLocked || tempModels.length === 0}>
                            <option value="">Seçiniz</option>
                            {tempModels.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div style={{flex:1.5}}>
                        <label style={styles.smallLabel}>Motor / Yıl / Kasa</label>
                        <select onChange={e => setSelectedCarId(e.target.value)} style={styles.input} disabled={isLocked || tempEngines.length === 0}>
                            <option value="">Seçiniz</option>
                            {tempEngines.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.engine} | {c.years} | {c.bodyStyle}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button type="button" onClick={addToPool} style={styles.poolAddBtn} disabled={isLocked}>EKLE</button>
                </div>

                <div style={styles.poolContainer}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                        <span style={styles.poolCount}>Uyumlu Araç Listesi ({compatibilityPool.length})</span>
                    </div>
                    {compatibilityPool.length === 0 ? (
                        <div style={styles.emptyPool}>Henüz araç seçilmedi. Yukarıdan seçim yapıp ekleyin.</div>
                    ) : (
                        <div style={styles.poolGrid}>
                            {compatibilityPool.map(car => {
                                const brandName = (car.brand && typeof car.brand === 'object') ? car.brand.name : car.brand;
                                return (
                                    <div key={car._id} style={styles.poolItem}>
                                        <div style={styles.poolText}>
                                            <div style={{fontWeight:'700', fontSize:'13px'}}>{brandName} {car.model}</div>
                                            <div style={{fontSize:'11px', color:'#64748b'}}>{car.engine} - {car.years}</div>
                                        </div>
                                        <button type="button" onClick={() => removeFromPool(car._id)} style={styles.removeBtn} disabled={isLocked}>✕</button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handlePartSubmit}>
                {/* STEP 2: PART INFO */}
                <div style={{...styles.sectionBox, borderColor: isLocked ? '#f59e0b' : '#10b981'}}>
                    <div style={styles.stepHeader}>
                        <span style={{...styles.stepBadge, background: isLocked ? '#f59e0b' : '#10b981'}}>02</span>
                        <h4 style={styles.stepTitle}>Genel Parça Bilgileri & Kilitleme</h4>
                    </div>
                    
                    <div style={styles.grid2}>
                        <div>
                            <label style={styles.label}>Parça Adı</label>
                            <input placeholder="Örn: Ön Fren Balatası" value={partForm.name} onChange={e => setPartForm({...partForm, name: e.target.value})} style={styles.input} required disabled={isLocked} />
                        </div>
                        <div>
                            <label style={styles.label}>OEM Numarası</label>
                            <input placeholder="Örn: 5Q0615123" value={partForm.oem} onChange={e => setPartForm({...partForm, oem: e.target.value})} style={styles.input} required disabled={isLocked} />
                        </div>
                    </div>

                    <div style={styles.grid2}>
                        <div>
                            <label style={styles.label}>Ana Kategori</label>
                            <select value={partForm.category} onChange={e => setPartForm({...partForm, category: e.target.value, subCategory: ''})} style={styles.input} required disabled={isLocked}>
                                <option value="">Seçiniz</option>
                                {dbCategories.filter(c => !c.parent).map(c => (
                                    <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Alt Kategori</label>
                            <select value={partForm.subCategory} onChange={e => setPartForm({...partForm, subCategory: e.target.value})} style={styles.input} disabled={isLocked || subCategories.length === 0}>
                                <option value="">Seçiniz</option>
                                {subCategories.map(sc => (
                                    <option key={sc._id} value={sc._id}>{sc.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="button" onClick={toggleLock} style={{...styles.lockBtn, backgroundColor: isLocked ? '#f59e0b' : '#334155'}}>
                        {isLocked ? "🔒 Bilgiler Sabitlendi (Düzenlemek için tıklayın)" : "🔓 Bilgileri Sabitle & Marka Girişine Geç"}
                    </button>

                    <div style={styles.divider}>
                        <span style={styles.dividerText}>Üretici ve Fiyat Girişi</span>
                    </div>

                    <div style={styles.grid2}>
                        <div>
                            <label style={styles.label}>Üretici Marka</label>
                            <select value={partForm.brand} onChange={e => setPartForm({...partForm, brand: e.target.value})} style={styles.input} required>
                                <option value="">Marka Seçiniz...</option>
                                {partBrands.map(pb => <option key={pb._id} value={pb._id}>{pb.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Fiyat (TL)</label>
                            <input placeholder="0.00" value={partForm.price} onChange={e => setPartForm({...partForm, price: e.target.value})} style={styles.input} required />
                        </div>
                    </div>

                    <div style={styles.grid2}>
                        <div>
                            <label style={styles.label}>Stok Adedi</label>
                            <input type="number" value={partForm.stock} onChange={e => setPartForm({...partForm, stock: e.target.value})} style={styles.input} required />
                        </div>
                        <div>
                            <label style={styles.label}>Görsel URL</label>
                            <input placeholder="https://..." value={partForm.photo} onChange={e => setPartForm({...partForm, photo: e.target.value})} style={styles.input} />
                        </div>
                    </div>

                    <label style={styles.label}>Parça Açıklaması</label>
                    <textarea placeholder="Örn: 2015 sonrası araçlar için uygundur..." value={partForm.description} onChange={e => setPartForm({...partForm, description: e.target.value})} style={{...styles.input, height:'80px', resize:'none'}} />

                    <button type="submit" style={{...styles.submitBtn, background: isLocked ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                        {isLocked ? "ALTERNATİF MARKAYI KAYDET" : "PARÇAYI SİSTEME EKLE"}
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    formCard: { background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '20px auto', border: '1px solid #f1f5f9' },
    header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'30px', borderBottom:'1px solid #f1f5f9', paddingBottom:'20px' },
    title: { margin: 0, color: '#1e293b', fontSize: '22px', fontWeight: '800' },
    subtitle: { margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' },
    sectionBox: { padding: '25px', border: '2px solid', borderRadius: '20px', marginBottom: '25px', backgroundColor: '#fff', transition: '0.3s' },
    stepHeader: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' },
    stepBadge: { background:'#3b82f6', color:'#fff', width:'28px', height:'28px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'bold' },
    stepTitle: { margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: '700' },
    filterRow: { display:'flex', gap:'15px', marginBottom:'20px', alignItems:'flex-end' },
    grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'10px' },
    input: { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', background:'#f8fafc', transition:'0.2s focus', ':focus': { borderColor: '#3b82f6' } },
    label: { fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block', textTransform:'uppercase', letterSpacing:'0.5px' },
    smallLabel: { fontSize:'11px', fontWeight:'bold', color:'#94a3b8', marginBottom:'5px', display:'block' },
    poolAddBtn: { height:'45px', padding: '0 25px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize:'13px' },
    poolContainer: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' },
    poolCount: { fontSize:'13px', fontWeight:'800', color:'#1e293b' },
    emptyPool: { textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' },
    poolGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'10px' },
    poolItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor:'#fff', borderRadius:'12px', border:'1px solid #e2e8f0', boxShadow:'0 2px 4px rgba(0,0,0,0.02)' },
    poolText: { display:'flex', flexDirection:'column' },
    removeBtn: { background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', width:'24px', height:'24px', borderRadius:'8px', fontSize: '10px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold' },
    lockBtn: { width: '100%', padding: '14px', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', marginTop:'10px', transition:'0.3s', fontSize:'13px' },
    submitBtn: { width: '100%', padding: '18px', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '800', fontSize: '15px', marginTop: '20px', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)', letterSpacing:'0.5px' },
    resetBtn: { padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight:'700', color: '#64748b', boxShadow:'0 2px 4px rgba(0,0,0,0.05)' },
    divider: { position: 'relative', textAlign: 'center', margin: '30px 0' },
    dividerText: { background: '#fff', padding: '0 15px', color: '#cbd5e1', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }
};

export default AddPart;