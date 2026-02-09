import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const PartDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        API.get(`/parts/${id}`).then(res => setData(res.data)).catch(err => console.log(err));
    }, [id]);

    if (!data) return <div style={{padding:'50px', textAlign:'center'}}>Yükleniyor...</div>;

    const { part, alternatives } = data;

    return (
        <div style={detStyle.page}>
            <div style={detStyle.container}>
                <div style={detStyle.imageSection}>
                    <img src={part.photo || 'https://via.placeholder.com/400'} style={detStyle.mainPhoto} alt="" />
                </div>

                <div style={detStyle.infoSection}>
                    <button onClick={() => navigate(-1)} style={detStyle.backBtn}>← Geri Dön</button>
                    <h1 style={detStyle.title}>{part.name}</h1>
                    <p style={detStyle.oemText}>OEM: {part.oem}</p>
                    
                    <div style={detStyle.stockBadge}>
                        Stok Durumu: {part.stock > 0 ? `✅ ${part.stock} Adet` : '❌ Stokta Yok'}
                    </div>

                    <div style={detStyle.priceBox}>{part.price} TL</div>

                    <div style={detStyle.brandCard}>
                        <img src={part.brand.logo} style={detStyle.brandLogo} alt="" />
                        <div>
                            <span style={{display:'block', fontSize:'12px', color:'#666'}}>Üretici Marka</span>
                            <strong>{part.brand.name}</strong>
                        </div>
                    </div>

                    {/* DİNAMİK MARKA SEÇİCİ (Aynı OEM'li Ürünler) */}
                    {alternatives.length > 0 && (
                        <div style={detStyle.altBox}>
                            <p style={{fontSize:'14px', marginBottom:'10px', fontWeight:'bold'}}>Diğer Marka Seçenekleri:</p>
                            <div style={{display:'flex', gap:'10px'}}>
                                {/* Şu anki marka */}
                                <div style={{...detStyle.altCircle, border:'2px solid #2e89ff'}}>
                                    <img src={part.brand.logo} style={detStyle.altMiniLogo} />
                                </div>
                                {/* Diğer alternatifler */}
                                {alternatives.map(alt => (
                                    <div 
                                        key={alt._id} 
                                        style={detStyle.altCircle} 
                                        onClick={() => navigate(`/part/${alt._id}`)}
                                    >
                                        <img src={alt.brand.logo} style={detStyle.altMiniLogo} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const detStyle = {
    page: { backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px' },
    container: { maxWidth: '1000px', margin: '0 auto', display: 'flex', backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
    imageSection: { flex: 1, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    mainPhoto: { width: '100%', maxHeight: '400px', objectFit: 'contain' },
    infoSection: { flex: 1, padding: '40px', borderLeft: '1px solid #eee' },
    backBtn: { border:'none', background:'none', color:'#2e89ff', cursor:'pointer', marginBottom:'20px' },
    title: { fontSize: '28px', marginBottom: '10px' },
    oemText: { color: '#888', marginBottom: '20px' },
    stockBadge: { padding: '8px 15px', backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'inline-block', marginBottom: '20px' },
    priceBox: { fontSize: '36px', fontWeight: 'bold', color: '#2ecc71', marginBottom: '30px' },
    brandCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px', marginBottom: '30px' },
    brandLogo: { width: '50px', height: '50px', objectFit: 'contain' },
    altBox: { borderTop: '1px solid #eee', paddingTop: '20px' },
    altCircle: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #ddd', overflow: 'hidden' },
    altMiniLogo: { width: '80%', height: '80%', objectFit: 'contain' }
};

export default PartDetail;