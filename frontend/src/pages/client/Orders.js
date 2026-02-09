import React, { useState, useEffect } from 'react';
import API from '../../api';
import NavBar from '../../components/NavBar';
import { FaBoxOpen, FaTruck, FaCheckCircle, FaChevronRight, FaChevronDown, FaBox, FaHistory, FaShoppingBag } from 'react-icons/fa';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    // Hangi sekmenin aktif olduğunu tutar: 'active' veya 'completed'
    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/orders', { headers: { Authorization: `Bearer ${token}` } });
            setOrders(res.data);
        } catch (err) {
            console.error("Siparişler yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    // Siparişleri statülerine göre filtreliyoruz
    const activeOrders = orders.filter(o => !['Teslim Edildi', 'İptal Edildi'].includes(o.status));
    const completedOrders = orders.filter(o => ['Teslim Edildi', 'İptal Edildi'].includes(o.status));

    const displayedOrders = activeTab === 'active' ? activeOrders : completedOrders;

    const toggleOrder = (id) => {
        setExpandedOrderId(expandedOrderId === id ? null : id);
    };

    const formatOrderCode = (date, index) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        const num = String(index + 1).padStart(4, '0');
        return `#ZO${day}${month}${year}${num}`;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Teslim Edildi': return { color: '#2ecc71', bg: '#eafaf1' };
            case 'Kargoya Verildi': return { color: '#0984e3', bg: '#e7f3ff' };
            case 'İptal Edildi': return { color: '#e74c3c', bg: '#fdeaea' };
            default: return { color: '#f39c12', bg: '#fef5e7' };
        }
    };

    if (loading) return <div style={{textAlign:'center', padding:'100px'}}>Yükleniyor...</div>;

    return (
        <div style={{ background: '#f8f9fc', minHeight: '100vh' }}>
            <NavBar />
            <div style={styles.container}>
                <h1 style={styles.title}>Siparişlerim</h1>

                {/* TAB (SEKME) MENÜSÜ */}
                <div style={styles.tabContainer}>
                    <button 
                        onClick={() => setActiveTab('active')}
                        style={{...styles.tabBtn, ...(activeTab === 'active' ? styles.activeTab : {})}}
                    >
                        <FaShoppingBag /> Aktif Siparişler ({activeOrders.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('completed')}
                        style={{...styles.tabBtn, ...(activeTab === 'completed' ? styles.activeTab : {})}}
                    >
                        <FaHistory /> Tamamlanmış Siparişler ({completedOrders.length})
                    </button>
                </div>

                {displayedOrders.length === 0 ? (
                    <div style={styles.emptyCard}>
                        <FaBoxOpen size={60} color="#dfe6e9" />
                        <p style={styles.emptyText}>
                            {activeTab === 'active' ? "Şu an aktif bir siparişiniz bulunmuyor." : "Henüz tamamlanmış bir siparişiniz yok."}
                        </p>
                        <button style={styles.shopBtn} onClick={() => window.location.href = '/'}>Ürünlere Göz At</button>
                    </div>
                ) : (
                    <div style={styles.orderList}>
                        {displayedOrders.map((order, index) => {
                            const isExpanded = expandedOrderId === order._id;
                            const statusStyle = getStatusStyle(order.status);
                            
                            return (
                                <div key={order._id} style={{...styles.orderCard, border: isExpanded ? '1px solid #4834d4' : '1px solid #f0f0f0'}}>
                                    <div style={styles.orderHeader}>
                                        <div>
                                            <span style={styles.orderLabel}>SİPARİŞ KODU</span>
                                            <div style={styles.orderId}>{formatOrderCode(order.createdAt, index)}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={styles.orderLabel}>TOPLAM</span>
                                            <div style={styles.orderPrice}>{order.totalAmount?.toLocaleString()} TL</div>
                                        </div>
                                    </div>

                                    {/* Sadece Aktif Siparişlerde Step Gösterelim */}
                                    {activeTab === 'active' && (
                                        <div style={styles.stepperWrapper}>
                                            {['Alındı', 'Onay', 'Hazırlık', 'Kargo'].map((s, idx) => (
                                                <div key={idx} style={{...styles.step, opacity: order.currentStep >= idx ? 1 : 0.3}}>
                                                    <div style={{...styles.stepCircle, background: order.currentStep >= idx ? '#4834d4' : '#ccc'}}>
                                                        {order.currentStep > idx ? <FaCheckCircle size={10}/> : idx + 1}
                                                    </div>
                                                    <span style={styles.stepText}>{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div style={styles.orderFooter}>
                                        <span style={{...styles.badge, color: statusStyle.color, background: statusStyle.bg}}>
                                            {order.status}
                                        </span>
                                        <button style={styles.detailBtn} onClick={() => toggleOrder(order._id)}>
                                            {isExpanded ? 'Kapat' : 'Detaylar'} 
                                            {isExpanded ? <FaChevronDown size={12}/> : <FaChevronRight size={12}/>}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div style={styles.detailsArea}>
                                            <hr style={styles.divider} />
                                            {order.trackingCode && (
                                                <div style={styles.cargoBox}>
                                                    <FaTruck /> <span>{order.cargoCompany}: <strong>{order.trackingCode}</strong></span>
                                                </div>
                                            )}
                                            <h4 style={styles.subTitle}>Ürün Detayları</h4>
                                            {order.items?.map((item, i) => (
                                                <div key={i} style={styles.productItem}>
                                                    <div style={styles.imgWrapper}>
                                                        {item.part?.image ? <img src={item.part.image} style={styles.img} alt=""/> : <FaBox color="#ccc"/>}
                                                    </div>
                                                    <div style={{flex: 1}}>
                                                        <div style={styles.prodName}>{item.part?.name}</div>
                                                        <div style={styles.prodMeta}>
                                                            <span style={styles.brandText}>{item.part?.brand?.name || 'Markasız'}</span>
                                                            <span> | OEM: {item.part?.oem}</span>
                                                        </div>
                                                    </div>
                                                    <div style={styles.prodPrice}>
                                                        <div>{item.quantity} Adet</div>
                                                        <div style={{fontWeight:'700', color:'#2d3436'}}>{item.priceAtAdd} TL</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};



const styles = {
    container: { maxWidth: '750px', margin: '30px auto', padding: '0 20px' },
    title: { fontWeight: '800', marginBottom: '25px', fontSize: '24px', color: '#1e293b' },
    
    // Tab Stilleri
    tabContainer: { display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' },
    tabBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', padding: '10px 15px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#64748b', transition: '0.3s' },
    activeTab: { color: '#4834d4', borderBottom: '2px solid #4834d4', marginBottom: '-12px' },

    orderList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    orderCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
    orderHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
    orderLabel: { fontSize: '9px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.5px' },
    orderId: { fontSize: '14px', fontWeight: '700' },
    orderPrice: { fontSize: '16px', fontWeight: '800', color: '#4834d4' },
    
    stepperWrapper: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', background: '#f1f5f9', padding: '12px', borderRadius: '8px' },
    step: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '4px' },
    stepCircle: { width: '18px', height: '18px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' },
    stepText: { fontSize: '8px', fontWeight: 'bold', color: '#475569' },
    
    orderFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' },
    detailBtn: { background: 'none', border: 'none', color: '#4834d4', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' },
    
    detailsArea: { marginTop: '15px' },
    divider: { border: 'none', borderTop: '1px solid #f1f5f9', margin: '15px 0' },
    subTitle: { fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#475569' },
    productItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f8fafc' },
    imgWrapper: { width: '40px', height: '40px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    prodName: { fontSize: '12px', fontWeight: '700', color: '#1e293b' },
    prodMeta: { fontSize: '10px', color: '#94a3b8', marginTop: '1px' },
    brandText: { color: '#4834d4', fontWeight: 'bold' },
    prodPrice: { textAlign: 'right', fontSize: '10px', color: '#64748b' },
    cargoBox: { background: '#f0f9ff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#0369a1', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e0f2fe' },
    
    emptyCard: { background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center' },
    emptyText: { color: '#64748b', fontSize: '15px', margin: '15px 0' },
    shopBtn: { background: '#4834d4', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }
};

export default Orders;