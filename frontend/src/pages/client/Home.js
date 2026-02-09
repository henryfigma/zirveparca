import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 🚀 useNavigate eklendi
import Navbar from '../../components/NavBar';
import VehicleSelector from '../../components/VehicleSelector';
import API from '../../api';

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate(); // 🚀 Rotalar arası geçiş için tanımladık
    const [categories, setCategories] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [garageCarId, setGarageCarId] = useState(null);

    // 🚀 ARAMA FONKSİYONU
    const handleSearch = useCallback(async (carId = null, searchTerm = null) => {
        setLoading(true);
        setSearchPerformed(true);
        try {
            let res;
            if (carId) {
                res = await API.get(`/parts/compatible/${carId}`);
            } else if (searchTerm) {
                res = await API.get(`/parts?search=${searchTerm}`);
            }
            
            setParts(res?.data || []);
            
            if (res?.data?.length > 0) {
                setTimeout(() => window.scrollTo({ top: 600, behavior: 'smooth' }), 300);
            }
        } catch (err) { 
            console.error("Arama hatası:", err); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await API.get('/categories');
                const rootCategories = res.data.filter(cat => !cat.parent && !cat.parentId && !cat.parentCategory);
                setCategories(rootCategories);
            } catch (err) { console.error("Kategoriler yüklenemedi:", err); }
        };
        fetchCategories();

        const params = new URLSearchParams(location.search);
        const urlSearchTerm = params.get('search');

        if (urlSearchTerm) {
            handleSearch(null, urlSearchTerm);
        } else if (location.state && location.state.autoSearchCarId) {
            const id = location.state.autoSearchCarId;
            setGarageCarId(id);
            handleSearch(id);
            window.history.replaceState({}, document.title);
        }
    }, [location, handleSearch]);

    const addToCart = async (part) => {
        const token = localStorage.getItem('token');
        if (!token) { alert("Lütfen önce giriş yapınız."); return; }
        try {
            const payload = { partId: part._id, quantity: 1, price: part.price };
            const res = await API.post('/cart/add', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 201 || res.status === 200) {
                window.dispatchEvent(new Event('cartUpdated')); 
                alert(`✅ ${part.name} sepete eklendi!`);
            }
        } catch (err) { alert(err.response?.data?.message || "Sepete eklenemedi."); }
    };

    return (
        <div style={s.page}>
            <Navbar />
            <div style={s.hero}>
                <div style={s.container}>
                    <h1 style={s.heroTitle}>ARACINIZA UYGUN PARÇAYI BULUN</h1>
                    <p style={s.heroSubtitle}>Doğru parçayı seçin, yolda kalmayın.</p>
                    
                    <VehicleSelector 
                        onSearch={(id) => handleSearch(id, null)} 
                        selectedCarId={garageCarId} 
                    />
                </div>
            </div>

            <div style={s.container}>
                {loading && <div style={s.statusText}><div className="loader"></div></div>}
                
                {!loading && searchPerformed && (
                    <div style={{ marginBottom: '60px' }}>
                        <h2 style={s.secTitle}>
                            {new URLSearchParams(location.search).get('search') 
                                ? `"${new URLSearchParams(location.search).get('search')}" için arama sonuçları` 
                                : 'Uygun Parçalar'} ({parts.length})
                        </h2>
                        
                        {parts.length > 0 ? (
                            <div style={s.grid}>
                                {parts.map(part => (
                                    <div 
                                        key={part._id} 
                                        style={{...s.card, cursor: 'pointer'}} // 🚀 Tıklanabilir yaptık
                                        onClick={() => navigate(`/part/${part._id}`)} // 🚀 Detay sayfasına yönlendirme
                                    >
                                        <div style={s.imgWrapper}>
                                            <img src={part.photo || 'https://via.placeholder.com/200'} alt={part.name} style={s.img} />
                                        </div>
                                        <div style={s.cardBody}>
                                            <h4 style={s.partName}>{part.name}</h4>
                                            <span style={s.oem}>OEM: {part.oem}</span>
                                            <div style={s.priceRow}>
                                                <span style={s.priceText}>{part.price?.toLocaleString()} TL</span>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 🚀 KRİTİK: Karta gitme, sadece sepete ekle
                                                    addToCart(part);
                                                }} 
                                                style={s.addBtn}
                                            >
                                                SEPETE EKLE
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={s.noResult}>Parça bulunamadı.</div>
                        )}
                    </div>
                )}

                <h2 style={s.secTitle}>Kategoriler</h2>
                <div style={s.grid}>
                    {categories.map(cat => (
                        <div 
                            key={cat._id} 
                            style={{...s.catCard, cursor: 'pointer'}} // 🚀 Kategoriler de tıklanabilir
                            onClick={() => handleSearch(null, cat.name)} // 🚀 Kategori ismine göre arama tetikler
                        >
                            <img src={cat.image || 'https://via.placeholder.com/64'} alt={cat.name} style={s.catImg} />
                            <span style={s.catName}>{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`.loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: auto; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const s = {
    page: { background: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' },
    hero: { background: '#1c1e21', padding: '60px 0', color: '#fff', textAlign: 'center' },
    heroTitle: { fontSize: '32px', fontWeight: '900' },
    heroSubtitle: { color: '#90949c', marginBottom: '30px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
    secTitle: { margin: '40px 0 20px', fontSize: '20px', fontWeight: '800', borderLeft: '4px solid #3498db', paddingLeft: '15px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
    card: { background: '#fff', borderRadius: '16px', border: '1px solid #e4e6eb', overflow: 'hidden', transition: 'transform 0.2s' },
    imgWrapper: { height: '180px', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    img: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
    cardBody: { padding: '15px' },
    partName: { fontSize: '15px', fontWeight: '700', height: '42px', overflow: 'hidden' },
    oem: { fontSize: '12px', color: '#65676b', display: 'block', marginBottom: '10px' },
    priceText: { fontSize: '22px', fontWeight: '900', color: '#3498db' },
    addBtn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    catCard: { background: '#fff', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e4e6eb' },
    catImg: { width: '64px', height: '64px', marginBottom: '10px' },
    catName: { fontWeight: '700', fontSize: '14px' },
    statusText: { textAlign: 'center', padding: '50px' },
    noResult: { textAlign: 'center', padding: '50px' }
};

export default Home;