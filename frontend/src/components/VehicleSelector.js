import React, { useState, useEffect, useRef } from 'react';
import API from '../api';

const VehicleSelector = ({ onSearch, selectedCarId }) => {
    const [brands, setBrands] = useState([]);
    const [allCarsOfBrand, setAllCarsOfBrand] = useState([]);
    // years alanını state'ten kaldırdık çünkü artık model ile birleşik
    const [selection, setSelection] = useState({ brandId: '', brandName: '', model: '', carId: '' });
    const [loading, setLoading] = useState(false);
    const lastProcessedId = useRef(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await API.get('/brands');
                setBrands(res.data);
            } catch (err) { console.error("Markalar yüklenemedi", err); }
        };
        fetchBrands();
    }, []);

    useEffect(() => {
        const autoFill = async () => {
            if (!selectedCarId || selectedCarId === lastProcessedId.current || brands.length === 0) return;
            
            try {
                setLoading(true);
                lastProcessedId.current = selectedCarId;
                const resCar = await API.get(`/cars/${selectedCarId}`);
                const car = resCar.data;

                if (car) {
                    let bId = car.brand?._id || car.brand;
                    if (!bId || bId === "undefined") return;

                    const resAll = await API.get(`/cars/brand/${bId}`);
                    setAllCarsOfBrand(resAll.data);

                    const currentBrand = brands.find(b => b._id === bId);
                    
                    setSelection({
                        brandId: bId,
                        brandName: currentBrand ? currentBrand.name.toLowerCase() : '',
                        // Otomatik doldurmada modeli yıl ile birleştirerek set ediyoruz
                        model: `${car.model} (${car.years})`,
                        carId: car._id
                    });
                }
            } catch (err) {
                console.error("AutoFill Error:", err);
            } finally {
                setLoading(false);
            }
        };
        autoFill();
    }, [selectedCarId, brands]);

    const handleBrandChange = async (e) => {
        const bId = e.target.value;
        const brandObj = brands.find(b => b._id === bId);
        setSelection({ brandId: bId, brandName: brandObj?.name.toLowerCase() || '', model: '', carId: '' });
        
        if (!bId) { setAllCarsOfBrand([]); return; }
        try {
            const res = await API.get(`/cars/brand/${bId}`);
            setAllCarsOfBrand(res.data);
        } catch (err) { console.error(err); }
    };

    // --- YENİ MANTIK: Modelleri Yılları ile Birleştir ---
    const uniqueModelsWithYears = [...new Set(allCarsOfBrand.map(c => `${c.model} (${c.years})`))].sort();
    
    // Motorları seçilen birleşik model/yıl stringine göre filtrele
    const availableEngines = allCarsOfBrand.filter(c => 
        `${c.model} (${c.years})` === selection.model
    );

    return (
        <div style={styles.container}>
            <div style={styles.wrapper}>
                {/* 1. MARKA */}
                <div style={styles.selectGroup}>
                    <label style={styles.label}>1. MARKA</label>
                    <select style={styles.select} value={selection.brandId} onChange={handleBrandChange}>
                        <option value="">Seçiniz</option>
                        {brands.map(b => <option key={b._id} value={b._id}>{b.name.toUpperCase()}</option>)}
                    </select>
                </div>

                {/* 2. MODEL (Yıl ile Birleşik) */}
                <div style={styles.selectGroup}>
                    <label style={styles.label}>2. MODEL VE YIL</label>
                    <select 
                        style={styles.select} 
                        value={selection.model} 
                        disabled={!selection.brandId}
                        onChange={(e) => setSelection({...selection, model: e.target.value, carId: ''})}
                    >
                        <option value="">Seçiniz</option>
                        {uniqueModelsWithYears.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {/* 3. MOTOR */}
                <div style={styles.selectGroup}>
                    <label style={styles.label}>3. MOTOR</label>
                    <select 
                        style={styles.select} 
                        value={selection.carId} 
                        disabled={!selection.model}
                        onChange={(e) => setSelection({...selection, carId: e.target.value})}
                    >
                        <option value="">Seçiniz</option>
                        {availableEngines.map(v => (
                            <option key={v._id} value={v._id}>{v.engine} - {v.hp} HP</option>
                        ))}
                    </select>
                </div>

                {/* BUTON */}
                <div style={styles.btnGroup}>
                    <button 
                        style={{...styles.btn, backgroundColor: !selection.carId ? '#b2bec3' : '#0984e3'}} 
                        disabled={!selection.carId}
                        onClick={() => onSearch(selection.carId)} 
                    >
                        PARÇALARI GÖSTER
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '10px' },
    wrapper: { display: 'flex', gap: '15px', background: '#ffffff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 25px rgba(0,0,0,0.1)', alignItems: 'flex-end' },
    selectGroup: { flex: 4, display: 'flex', flexDirection: 'column', gap: '8px' }, // Flex değerlerini dengeledim
    label: { fontSize: '11px', fontWeight: '800', color: '#0984e3', textAlign: 'center' },
    select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #dfe6e9', fontSize: '14px', outline: 'none', color: '#2d3436', background: '#f9f9f9' },
    btnGroup: { flex: 2, minWidth: '180px' },
    btn: { width: '100%', height: '45px', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }
};

export default VehicleSelector;