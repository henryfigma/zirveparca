import React, { useState, useEffect } from 'react';
import API from '../../api';
import NavBar from '../../components/NavBar';
import { useNavigate } from 'react-router-dom';

const Garage = () => {
    const navigate = useNavigate();
    const [myCars, setMyCars] = useState([]);
    const [brands, setBrands] = useState([]);
    const [allCarsOfBrand, setAllCarsOfBrand] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isBrandOpen, setIsBrandOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    
    const [selection, setSelection] = useState({ 
        brandId: '', 
        brandName: '', 
        model: '', 
        year: '', 
        carId: '', 
        photo: '', 
        engine: '', 
        hp: '', 
        kw: '', 
        bodyType: '' 
    });

    const getAuthHeader = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => { 
        fetchGarage(); 
        fetchBrands(); 
    }, []);

    const fetchGarage = async () => {
        try { 
            const res = await API.get('/garage', getAuthHeader()); 
            setMyCars(res.data); 
        } catch (err) { console.error("Garaj yüklenirken hata:", err); }
    };

    const fetchBrands = async () => {
        try { 
            const res = await API.get('/brands'); 
            setBrands(res.data); 
        } catch (err) { console.error(err); }
    };

    // 🚀 MODEL İSMİ OLUŞTURMA MANTIĞI
    const getModelDisplayName = (car) => {
        if (selection.brandName.toLowerCase() === 'opel') {
            return `${car.model} ${car.bodyStyle || ''}`.trim();
        }
        return car.model;
    };

    const handleBrandSelect = async (brand) => {
        setSelection({ 
            brandId: brand._id, 
            brandName: brand.name, 
            model: '', carId: '', photo: '', year: '', engine: '', hp: '', kw: '', bodyType: '' 
        });
        setIsBrandOpen(false);
        try {
            const res = await API.get(`/cars/brand/${brand._id}`);
            setAllCarsOfBrand(res.data);
        } catch (err) { console.error(err); }
    };

    const handleModelSelect = (displayName) => {
        // Modeli ilk seçtiğinde o modele ait bulabildiği ilk fotoğrafı getirir
        const firstVariant = allCarsOfBrand.find(c => getModelDisplayName(c) === displayName);
        setSelection(prev => ({ 
            ...prev, 
            model: displayName, 
            photo: firstVariant ? firstVariant.modelPhoto : '',
            year: '', carId: '', engine: '', hp: '', kw: '', bodyType: '' 
        }));
        setIsModelOpen(false);
    };

    // 🚀 YIL SEÇİLDİĞİNDE GÖRSELİ GÜNCELLEME
    const handleYearChange = (year) => {
        // Seçilen model ve yıla ait spesifik görseli bulur
        const yearMatch = allCarsOfBrand.find(c => 
            getModelDisplayName(c) === selection.model && c.years === year
        );

        setSelection(prev => ({ 
            ...prev, 
            year: year, 
            carId: '', 
            photo: yearMatch ? yearMatch.modelPhoto : prev.photo 
        }));
    };

    const handleFinalSelect = (carId) => {
        const selected = allCarsOfBrand.find(c => c._id === carId);
        if (selected) {
            setSelection(prev => ({ 
                ...prev, 
                carId: selected._id, 
                year: selected.years, 
                engine: selected.engine,
                hp: selected.hp, 
                kw: selected.kw, 
                bodyType: selected.bodyStyle,
                photo: selected.modelPhoto // Motor/Kasa değişiminde de görseli doğrular
            }));
        }
    };

    const handleAdd = async () => {
        try {
            await API.post('/garage/add', { carId: selection.carId }, getAuthHeader());
            alert("🚀 Araç garaja eklendi!");
            fetchGarage();
            setShowAddForm(false);
            setSelection({ brandId: '', brandName: '', model: '', year: '', carId: '', photo: '' });
        } catch (err) { alert(err.response?.data?.message || "Hata oluştu."); }
    };

    const handleRemove = async (id) => {
        if (window.confirm("Bu aracı garajınızdan kaldırmak istiyor musunuz?")) {
            try {
                await API.delete(`/garage/${id}`, getAuthHeader());
                fetchGarage();
            } catch (err) { console.error("Silme hatası:", err); }
        }
    };

    const handleSearchParts = (car) => {
        const targetId = car.carId?._id || car.carId || car._id;
        navigate('/', { state: { autoSearchCarId: targetId } });
    };

    // --- FİLTRELEME MANTIĞI ---
    const uniqueModelsData = allCarsOfBrand.reduce((acc, current) => {
        const name = getModelDisplayName(current);
        if (!acc.find(item => item.name === name)) {
            acc.push({ name: name, photo: current.modelPhoto });
        }
        return acc;
    }, []).sort((a, b) => a.name.localeCompare(b.name));

    const uniqueYears = [...new Set(
        allCarsOfBrand
            .filter(c => getModelDisplayName(c) === selection.model)
            .map(c => c.years)
    )].sort();

    const availableVariants = allCarsOfBrand.filter(c => 
        getModelDisplayName(c) === selection.model && c.years === selection.year
    );

    return (
        <div style={{minHeight: '100vh', background: '#f9f9f9'}}>
            <NavBar/>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.mainTitle}>GARAJIM</h1>
                    <button onClick={() => setShowAddForm(!showAddForm)} style={showAddForm ? styles.cancelBtn : styles.addTriggerBtn}>
                        {showAddForm ? '✕ Vazgeç' : '+ Araç Ekle'}
                    </button>
                </div>

                {/* GARAJ LİSTESİ */}
                <div style={styles.garageGrid}>
                    {myCars.map(item => (
                        <div key={item._id} style={styles.garageCard}>
                            <img src={item.carId?.modelPhoto || item.modelPhoto} style={styles.garageImg} alt="car" />
                            <div style={styles.garageDetails}>
                                <h3 style={{margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold'}}>
                                    {item.brand?.name} {item.carId?.model || item.model}
                                </h3>
                                <p style={{color: '#666', fontSize: '13px', marginBottom: '15px'}}>
                                    {item.carId?.engine || item.engine} L | {item.carId?.years || item.years} | {item.carId?.hp || item.hp} HP
                                </p>
                                <div style={styles.cardActions}>
                                    <button onClick={() => handleSearchParts(item)} style={styles.actionBtn}>🔍 Parça Ara</button>
                                    <button onClick={() => handleRemove(item._id)} style={styles.deleteBtn}>Sil</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ARAÇ EKLEME FORMU */}
                {showAddForm && (
                    <div style={styles.formSection}>
                        <div style={styles.selectionLayout}>
                            <div style={styles.controls}>
                                {/* 1. MARKA */}
                                <div style={styles.field}>
                                    <label style={styles.label}>1. MARKA</label>
                                    <div style={styles.customTrigger} onClick={() => { setIsBrandOpen(!isBrandOpen); setIsModelOpen(false); }}>
                                        {selection.brandName || "Marka Seçiniz"} <span>▼</span>
                                    </div>
                                    {isBrandOpen && (
                                        <div style={styles.brandGridPopup}>
                                            {brands.map(b => (
                                                <div key={b._id} style={styles.gridItem} onClick={() => handleBrandSelect(b)}>
                                                    <img src={b.logo} alt={b.name} style={styles.brandLogo} />
                                                    <span style={{fontSize: '11px'}}>{b.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 2. MODEL */}
                                <div style={styles.field}>
                                    <label style={styles.label}>2. MODEL</label>
                                    <div 
                                        style={{...styles.customTrigger, opacity: !selection.brandId ? 0.5 : 1}} 
                                        onClick={() => selection.brandId && setIsModelOpen(!isModelOpen)}
                                    >
                                        {selection.model || "Model Seçiniz"} <span>▼</span>
                                    </div>
                                    {isModelOpen && (
                                        <div style={styles.modelGridPopup}>
                                            {uniqueModelsData.map(m => (
                                                <div key={m.name} style={styles.gridItem} onClick={() => handleModelSelect(m.name)}>
                                                    <img src={m.photo} alt={m.name} style={styles.modelSmallImg} />
                                                    <span style={{fontSize: '11px', fontWeight: 'bold'}}>{m.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 3. YIL */}
                                <div style={styles.field}>
                                    <label style={styles.label}>3. MODEL YILI</label>
                                    <select 
                                        disabled={!selection.model} 
                                        value={selection.year} 
                                        onChange={(e) => handleYearChange(e.target.value)} 
                                        style={styles.classicSelect}
                                    >
                                        <option value="">Seçiniz...</option>
                                        {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>

                                {/* 4. MOTOR / FINAL */}
                                <div style={styles.field}>
                                    <label style={styles.label}>4. MOTOR VE GÜÇ</label>
                                    <select 
                                        disabled={!selection.year} 
                                        value={selection.carId} 
                                        onChange={(e) => handleFinalSelect(e.target.value)} 
                                        style={styles.classicSelect}
                                    >
                                        <option value="">Seçiniz...</option>
                                        {availableVariants.map(v => (
                                            <option key={v._id} value={v._id}>
                                                {v.engine} L - {v.hp} HP ({v.bodyStyle || 'Standart'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button onClick={handleAdd} disabled={!selection.carId} style={selection.carId ? styles.submitBtn : styles.disabledBtn}>GARAJA KAYDET</button>
                            </div>

                            {/* PREVIEW */}
                            <div style={styles.previewContainer}>
                                {selection.photo ? (
                                    <div style={styles.bmwPreview}>
                                        <div style={styles.previewTop}>
                                            <span style={styles.brandTag}>{selection.brandName}</span>
                                            <div style={{display: 'flex', alignItems: 'center'}}>
                                                <h2 style={styles.previewModelName}>{selection.model}</h2>
                                                {selection.year && <span style={styles.yearBadge}>{selection.year}</span>}
                                            </div>
                                        </div>
                                        <img src={selection.photo} style={styles.previewMainImg} alt="Preview" key={selection.photo} />
                                        
                                        {selection.carId && (
                                            <div style={styles.techSpecs}>
                                                <div style={styles.specItem}>
                                                    <strong style={styles.specLabel}>MOTOR</strong>
                                                    <span style={styles.specVal}>{selection.engine} L</span>
                                                </div>
                                                <div style={styles.specItem}>
                                                    <strong style={styles.specLabel}>GÜÇ</strong>
                                                    <span style={styles.specVal}>{selection.hp} HP</span>
                                                </div>
                                                <div style={styles.specItem}>
                                                    <strong style={styles.specLabel}>KASA</strong>
                                                    <span style={styles.specVal}>{selection.bodyType}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={styles.emptyPreview}>Lütfen seçim yapınız</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1300px', margin: '0 auto', padding: '40px 20px', position: 'relative', fontFamily: 'Inter, system-ui, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    mainTitle: { fontSize: '40px', fontWeight: '900', margin: 0, letterSpacing: '-1px', color: '#1a1a1a' },
    addTriggerBtn: { background: '#000', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
    cancelBtn: { background: '#eee', color: '#000', border: 'none', padding: '15px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    formSection: { background: '#fff', borderRadius: '16px', padding: '40px', border: '1px solid #e0e0e0', marginTop: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' },
    selectionLayout: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '50px' },
    controls: { display: 'flex', flexDirection: 'column', gap: '20px' },
    field: { position: 'relative', display: 'flex', flexDirection: 'column' },
    label: { fontSize: '11px', fontWeight: '800', color: '#999', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' },
    customTrigger: { padding: '15px', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#333' },
    brandGridPopup: { position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', zIndex: 1000, boxShadow: '0 15px 45px rgba(0,0,0,0.15)', width: '300px', marginTop: '8px' },
    modelGridPopup: { position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', zIndex: 1000, boxShadow: '0 15px 45px rgba(0,0,0,0.15)', width: '380px', marginTop: '8px' },
    gridItem: { textAlign: 'center', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: '0.2s hover', ':hover': { background: '#f8f9fa' } },
    brandLogo: { width: '35px', height: '35px', objectFit: 'contain', marginBottom: '8px' },
    modelSmallImg: { width: '100%', height: '60px', objectFit: 'contain', marginBottom: '8px' },
    classicSelect: { padding: '15px', borderRadius: '8px', border: '1px solid #eee', background: '#f8f9fa', fontWeight: '600', outline: 'none', appearance: 'none', cursor: 'pointer' },
    submitBtn: { padding: '18px', background: '#0984e3', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '10px', transition: '0.3s' },
    disabledBtn: { padding: '18px', background: '#f0f0f0', color: '#bbb', borderRadius: '10px', border: 'none', marginTop: '10px', cursor: 'not-allowed' },
    previewContainer: { background: '#fafafa', borderRadius: '16px', border: '1px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '480px', overflow: 'hidden' },
    bmwPreview: { width: '100%', padding: '30px' },
    previewTop: { borderLeft: '6px solid #0984e3', paddingLeft: '20px', marginBottom: '20px' },
    brandTag: { fontSize: '12px', color: '#aaa', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' },
    previewModelName: { fontSize: '36px', fontWeight: '900', margin: '5px 0', color: '#1a1a1a' },
    yearBadge: { background: '#0984e3', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginLeft: '15px' },
    previewMainImg: { width: '100%', height: '260px', objectFit: 'contain', margin: '10px 0', transition: '0.5s ease-in-out' },
    techSpecs: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', borderTop: '1px solid #eee', paddingTop: '25px', marginTop: '10px' },
    specItem: { display: 'flex', flexDirection: 'column' },
    specLabel: { fontSize: '10px', color: '#aaa', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '4px' },
    specVal: { fontSize: '15px', fontWeight: '700', color: '#333' },
    emptyPreview: { color: '#bbb', fontStyle: 'italic', fontSize: '15px' },
    garageGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '40px' },
    garageCard: { border: '1px solid #eee', borderRadius: '16px', padding: '24px', background: '#fff', transition: '0.3s', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
    garageImg: { width: '100%', height: '180px', objectFit: 'contain', marginBottom: '20px' },
    cardActions: { display: 'flex', gap: '12px', marginTop: '10px' },
    actionBtn: { flex: 2, padding: '12px', background: '#f1f2f6', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
    deleteBtn: { flex: 1, padding: '12px', background: '#fff0f0', color: '#ff7675', border: '1px solid #ffebeb', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Garage;