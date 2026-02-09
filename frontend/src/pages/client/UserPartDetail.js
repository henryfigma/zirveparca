import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShareAlt, FaShoppingCart, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../../components/NavBar';
import API from '../../api';

const UserPartDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [allData, setAllData] = useState(null);
    const [activePart, setActivePart] = useState(null);

    useEffect(() => {
        API.get(`/parts/${id}`).then(res => {
            setAllData(res.data);
            setActivePart(res.data.part);
        }).catch(err => console.error("Hata:", err));
    }, [id]);

    const changeMarka = (newPart) => {
        setActivePart(newPart);
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    const addToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) return alert("Lütfen giriş yapın!");
        try {
            await API.post('/cart/add', { partId: activePart._id, quantity: 1, price: activePart.price });
            window.dispatchEvent(new Event('cartUpdated'));
            alert("Ürün sepete eklendi!");
        } catch (err) { alert("Hata!"); }
    };

    if (!activePart) return <div style={s.page}><Navbar /></div>;

    return (
        <div style={s.page}>
            <Navbar />
            <div style={s.container}>
                <div style={s.headerNav}>
                    <button onClick={() => navigate('/')} style={s.backBtn}><FaArrowLeft /> Anasayfaya Dön</button>
                    <button onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link kopyalandı!");
                    }} style={s.shareBtn}><FaShareAlt /> Paylaş</button>
                </div>

                <div style={s.mainGrid}>
                    <div style={s.imageBox}>
                        <img src={activePart.photo || 'https://via.placeholder.com/500'} style={s.mainImg} alt="" />
                    </div>

                    <div style={s.infoBox}>
                        <div style={s.brandBadge}>
                            <img src={activePart.brand?.logo} style={s.brandLogo} alt="" />
                            <span>{activePart.brand?.name}</span>
                        </div>
                        <h1 style={s.title}>{activePart.name}</h1>
                        <p style={s.oem}>OEM: <strong>{activePart.oem}</strong></p>
                        <div style={s.statusRow}>
                            <div style={s.fitBadge}><FaCheckCircle /> Uyumluluk Onaylandı</div>
                            <span style={{ color: activePart.stock > 0 ? '#27ae60' : '#e74c3c', fontWeight:'600' }}>
                                {activePart.stock > 0 ? `● Stokta ${activePart.stock} Adet` : '● Stokta Yok'}
                            </span>
                        </div>
                        <div style={s.priceArea}>
                            <div style={s.priceTag}>{activePart.price?.toLocaleString()} TL</div>
                            <small style={s.kdv}>KDV Dahil</small>
                        </div>
                        <button style={s.cartBtn} onClick={addToCart} disabled={activePart.stock <= 0}><FaShoppingCart /> SEPETE EKLE</button>
                        
                        {allData.alternatives?.length > 0 && (
                            <div style={s.altSection}>
                                <p style={s.altTitle}>Diğer Markalar</p>
                                <div style={s.altGrid}>
                                    <div style={{...s.altCircle, border: activePart._id === allData.part._id ? '2px solid #0984e3' : '1px solid #eee'}} onClick={() => changeMarka(allData.part)}>
                                        <img src={allData.part.brand?.logo} style={s.altLogo} alt="" />
                                    </div>
                                    {allData.alternatives.map(alt => (
                                        <div key={alt._id} style={{...s.altCircle, border: activePart._id === alt._id ? '2px solid #0984e3' : '1px solid #eee'}} onClick={() => changeMarka(alt)}>
                                            <img src={alt.brand?.logo} style={s.altLogo} alt="" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div style={s.description}><h3>Ürün Detayı</h3><p>{activePart.description || 'Bilgi yok.'}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const s = {
    page: { background: '#f5f6fa', minHeight: '100vh', fontFamily: 'sans-serif' },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '20px' },
    headerNav: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
    backBtn: { border: 'none', background: 'none', color: '#0984e3', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' },
    shareBtn: { border: '1px solid #ddd', background: '#fff', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    imageBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdfdfd', borderRadius: '15px', border: '1px solid #f1f1f1' },
    mainImg: { maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' },
    infoBox: { display: 'flex', flexDirection: 'column' },
    brandBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: '#f8f9fa', padding: '6px 14px', borderRadius: '30px', width: 'fit-content', marginBottom: '15px' },
    brandLogo: { width: '20px', height: '20px' },
    title: { fontSize: '24px', fontWeight: '800', marginBottom: '8px' },
    oem: { color: '#b2bec3', marginBottom: '20px', fontSize: '14px' },
    statusRow: { display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '25px' },
    fitBadge: { background: '#e1f5fe', color: '#0288d1', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' },
    priceArea: { marginBottom: '25px' },
    priceTag: { fontSize: '36px', fontWeight: '900', color: '#0984e3' },
    kdv: { fontSize: '12px', color: '#b2bec3' },
    cartBtn: { padding: '16px', background: '#d63031', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer' },
    altSection: { marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee' },
    altTitle: { fontSize: '13px', fontWeight: '700', marginBottom: '12px' },
    altGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    altCircle: { width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fff' },
    altLogo: { width: '65%', height: '65%', objectFit: 'contain' },
    description: { marginTop: '25px', fontSize: '13px', color: '#636e72', lineHeight: '1.5' }
};

export default UserPartDetail;