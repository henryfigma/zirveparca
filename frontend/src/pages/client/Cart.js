import React, { useState, useEffect } from 'react';
import API from '../../api';
import NavBar from '../../components/NavBar';
import { FaTrash, FaShoppingBag, FaArrowLeft, FaPlus, FaMinus, FaCarSide } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; // 🚀 useNavigate eklendi

const Cart = () => {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // 🚀 Yönlendirme için hook

    const fetchCart = async () => {
        try {
            const res = await API.get('/cart');
            setCart(res.data || { items: [] });
        } catch (err) { 
            console.error("Sepet çekilemedi:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchCart(); }, []);

    const updateQuantity = async (partId, change) => {
        const targetItem = cart.items.find(i => i.part?._id === partId);
        if (!targetItem) return;
        if (targetItem.quantity === 1 && change === -1) return;

        const previousCart = { ...cart };
        const updatedItems = cart.items.map(item => 
            item.part?._id === partId ? { ...item, quantity: item.quantity + change } : item
        );
        setCart({ ...cart, items: updatedItems });

        try {
            await API.post('/cart/add', { partId, quantity: change, price: targetItem.priceAtAdd });
            window.dispatchEvent(new Event('cartUpdated')); 
        } catch (err) { 
            setCart(previousCart); 
        }
    };

    const removeItem = async (itemId) => {
        if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        try {
            const res = await API.delete(`/cart/${itemId}`);
            setCart(res.data || { items: [] });
            window.dispatchEvent(new Event('cartUpdated')); 
        } catch (err) { alert("Ürün silinemedi"); }
    };

    const calculateTotal = () => cart?.items?.reduce((acc, item) => acc + (item.priceAtAdd * item.quantity), 0) || 0;

    // 🚀 Ödeme sayfasına gitmeden önceki kontrol fonksiyonu
    const handleCheckoutRedirect = () => {
        if (!cart.items || cart.items.length === 0) {
            alert("Sepetiniz boş olduğu için ödeme adımına geçemezsiniz.");
            return;
        }
        navigate('/checkout'); // 🚀 Ayrı oluşturduğumuz checkout sayfasına gidiyor
    };

    const groupedItems = cart.items.reduce((acc, item) => {
        let carName = "GENEL PARÇALAR";
        if (item.part && item.part.car) {
            const brand = item.part.car.brand?.name || "";
            const model = item.part.car.model || "";
            if (brand || model) carName = `${brand} ${model}`.toUpperCase();
        }
        if (!acc[carName]) acc[carName] = [];
        acc[carName].push(item);
        return acc;
    }, {});

    if (loading) return <div style={s.loading}>Yükleniyor...</div>;

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <NavBar />
            <div style={s.container}>
                <div style={s.headerRow}>
                    <h1 style={s.title}><FaShoppingBag color="#0984e3" /> Sepetim ({cart?.items?.length || 0})</h1>
                    <Link to="/" style={s.backLink}><FaArrowLeft /> Alışverişe Devam Et</Link>
                </div>

                {cart?.items?.length > 0 ? (
                    <div style={s.layout}>
                        <div style={s.itemList}>
                            {Object.keys(groupedItems).map((carGroup, index) => (
                                <div key={carGroup}>
                                    <div style={s.carHeader}>
                                        <FaCarSide /> <span>{carGroup}</span>
                                    </div>
                                    {groupedItems[carGroup].map((item) => (
                                        <div key={item._id} style={s.itemCard}>
                                            <img src={item.part?.photo || 'https://via.placeholder.com/80'} style={s.itemImg} alt="part" />
                                            <div style={s.itemDetail}>
                                                <h4 style={s.partTitle}>{item.part?.name}</h4>
                                                <small style={{ color: '#999' }}>OEM: {item.part?.oem}</small>
                                                <div style={s.unitPrice}>{item.priceAtAdd?.toLocaleString()} TL</div>
                                            </div>
                                            <div style={s.qtyBox}>
                                                <button style={s.qtyBtn} onClick={() => updateQuantity(item.part?._id, -1)} disabled={item.quantity <= 1}><FaMinus size={10} /></button>
                                                <span style={s.qtyNum}>{item.quantity}</span>
                                                <button style={s.qtyBtn} onClick={() => updateQuantity(item.part?._id, 1)}><FaPlus size={10} /></button>
                                            </div>
                                            <div style={s.priceBox}><strong>{(item.priceAtAdd * item.quantity).toLocaleString()} TL</strong></div>
                                            <button onClick={() => removeItem(item._id)} style={s.deleteBtn}><FaTrash /></button>
                                        </div>
                                    ))}
                                    {index < Object.keys(groupedItems).length - 1 && <hr style={s.carDivider} />}
                                </div>
                            ))}
                        </div>

                        {/* ÖZET KARTI */}
                        <div style={s.summaryCard}>
                            <h3 style={s.summaryTitle}>Sipariş Özeti</h3>
                            <div style={s.summaryRow}><span>Ara Toplam</span><span>{calculateTotal().toLocaleString()} TL</span></div>
                            <div style={s.summaryRow}><span>Kargo</span><span style={{ color: '#2ecc71', fontWeight: 'bold' }}>Ücretsiz</span></div>
                            <hr style={s.hr} />
                            <div style={s.totalRow}><span>Toplam</span><span>{calculateTotal().toLocaleString()} TL</span></div>
                            
                            {/* 🚀 BUTON GÜNCELLENDİ */}
                            <button 
                                onClick={handleCheckoutRedirect} 
                                style={s.checkoutBtn}
                            >
                                ÖDEME ADIMINA GEÇ
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={s.empty}><FaShoppingBag size={60} color="#dfe6e9" /><h2>Sepetiniz boş.</h2><Link to="/" style={s.goBtn}>Ürünlere Göz At</Link></div>
                )}
            </div>
        </div>
    );
};

// ... (Stiller aynı kalıyor)
const s = {
    // Önceki kodundaki stillerin aynısını buraya yapıştırabilirsin. 
    // checkoutBtn stilini korumayı unutma.
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '26px', fontWeight: '800', color: '#2d3436' },
    backLink: { textDecoration: 'none', color: '#0984e3', fontWeight: '600', fontSize: '14px' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' },
    itemList: { display: 'flex', flexDirection: 'column', gap: '5px' },
    carHeader: { display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 5px 5px 5px', fontSize: '12px', fontWeight: '800', color: '#0984e3', textTransform: 'uppercase' },
    carDivider: { border: 'none', borderTop: '2px solid #eee', margin: '20px 0 10px 0' },
    itemCard: { background: '#fff', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', marginBottom: '10px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
    itemImg: { width: '80px', height: '80px', objectFit: 'contain', borderRadius: '10px' },
    itemDetail: { flex: 2, paddingLeft: '20px' },
    partTitle: { margin: '0 0 5px 0', fontSize: '15px', color: '#2d3436', fontWeight: '700' },
    unitPrice: { color: '#636e72', fontWeight: '600', fontSize: '13px', marginTop: '5px' },
    qtyBox: { display: 'flex', alignItems: 'center', gap: '12px', background: '#f8f9fa', padding: '6px 10px', borderRadius: '10px', border: '1px solid #eee' },
    qtyBtn: { border: 'none', background: '#fff', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    qtyNum: { fontWeight: 'bold', fontSize: '14px', minWidth: '20px', textAlign: 'center' },
    priceBox: { flex: 1, textAlign: 'right', paddingRight: '20px', fontSize: '18px' },
    deleteBtn: { background: '#fff', border: 'none', color: '#fab1a0', padding: '12px', borderRadius: '12px', cursor: 'pointer' },
    summaryCard: { background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', position: 'sticky', top: '20px' },
    summaryTitle: { margin: '0 0 20px 0', fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#636e72' },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: '900', color: '#0984e3', margin: '15px 0' },
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '15px 0' },
    checkoutBtn: { width: '100%', padding: '18px', background: '#0984e3', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '16px' },
    loading: { textAlign: 'center', padding: '100px', fontSize: '20px' },
    empty: { textAlign: 'center', padding: '100px', background: '#fff', borderRadius: '20px' },
    goBtn: { display: 'inline-block', marginTop: '20px', padding: '12px 30px', background: '#0984e3', color: '#fff', textDecoration: 'none', borderRadius: '10px', fontWeight: 'bold' }
};

export default Cart;