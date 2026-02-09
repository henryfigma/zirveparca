import React, { useState, useEffect } from 'react';
import API from '../../api';
import { 
    FaTruck, FaTrash, FaEye, FaBox, FaCreditCard, 
    FaUniversity, FaTimes, FaCheckCircle, FaShoppingBag, FaEnvelope,
    FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cargoInfo, setCargoInfo] = useState({ company: '', code: '' });
    const [loading, setLoading] = useState(true);

    // --- SAYFALAMA STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/orders', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setOrders(res.data);
        } catch (err) { 
            console.error("Siparişler çekilemedi:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleUpdate = async (id, status, step) => {
        try {
            const token = localStorage.getItem('token');
            await API.put(`/orders/${id}`, { 
                status, 
                currentStep: step,
                trackingCode: cargoInfo.code,
                cargoCompany: cargoInfo.company 
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            alert("Sipariş Durumu Güncellendi!");
            fetchOrders();
            setSelectedOrder(null);
            setCargoInfo({ company: '', code: '' });
        } catch (err) { 
            alert("Güncelleme başarısız."); 
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bu siparişi kalıcı olarak silmek istiyor musunuz?")) {
            try {
                const token = localStorage.getItem('token');
                await API.delete(`/orders/${id}`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                fetchOrders();
            } catch (err) {
                alert("Silme işlemi başarısız.");
            }
        }
    };

    // --- SAYFALAMA HESAPLAMALARI ---
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div style={s.loader}>Veriler Yükleniyor...</div>;

    return (
        <div style={s.container}>
            <div style={s.header}>
                <div>
                    <h2 style={s.title}>Sipariş Yönetimi</h2>
                    <p style={s.subtitle}>Müşteri siparişlerini ve kargo süreçlerini yönetin.</p>
                </div>
                <div style={s.statsCard}>
                    <FaShoppingBag color="#6366f1" /> <strong>{orders.length} Toplam Sipariş</strong>
                </div>
            </div>

            <div style={s.tableCard}>
                <table style={s.table}>
                    <thead>
                        <tr style={s.thead}>
                            <th style={s.th}>MÜŞTERİ BİLGİSİ</th>
                            <th style={s.th}>TUTAR</th>
                            <th style={s.th}>ÖDEME</th>
                            <th style={s.th}>DURUM</th>
                            <th style={s.th}>İŞLEMLER</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentOrders.map(order => (
                            <tr key={order._id} style={s.tr}>
                                <td style={s.td}>
                                    <div style={s.customerCell}>
                                        <div style={s.avatar}><FaEnvelope size={10}/></div>
                                        <div>
                                            <div style={{fontWeight:'700', color:'#1e293b'}}>{order.user?.email || 'Bilinmeyen Kullanıcı'}</div>
                                            <div style={{fontSize:'11px', color:'#64748b'}}>{order.address?.title}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{...s.td, color:'#4f46e5', fontWeight:'700'}}>{order.totalAmount} TL</td>
                                <td style={s.td}>
                                    {order.paymentMethod === 'card' ? 
                                        <span style={s.payBadge}><FaCreditCard size={12}/> Kart</span> : 
                                        <span style={s.payBadge}><FaUniversity size={12}/> Havale</span>
                                    }
                                </td>
                                <td style={s.td}>
                                    <span style={{...s.statusBadge, 
                                        backgroundColor: order.currentStep === 4 ? '#dcfce7' : '#f3f4f6', 
                                        color: order.currentStep === 4 ? '#15803d' : '#374151'}}>
                                        {order.status}
                                    </span>
                                </td>
                                <td style={s.td}>
                                    <button onClick={() => setSelectedOrder(order)} style={s.viewBtn}><FaEye /></button>
                                    <button onClick={() => handleDelete(order._id)} style={s.delBtn}><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* --- SAYFALAMA --- */}
                {totalPages > 1 && (
                    <div style={s.paginationContainer}>
                        <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} style={s.pageBtn}>
                            <FaChevronLeft />
                        </button>
                        {[...Array(totalPages)].map((_, idx) => (
                            <button 
                                key={idx + 1} 
                                onClick={() => paginate(idx + 1)} 
                                style={{
                                    ...s.pageNumber,
                                    background: currentPage === idx + 1 ? '#6366f1' : 'transparent',
                                    color: currentPage === idx + 1 ? '#fff' : '#64748b',
                                    borderColor: currentPage === idx + 1 ? '#6366f1' : '#e2e8f0'
                                }}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        <button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} style={s.pageBtn}>
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>

            {/* --- DETAY MODALI --- */}
            {selectedOrder && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <div style={s.modalHeader}>
                            <h3 style={{margin:0}}>Sipariş Detayı</h3>
                            <div onClick={() => setSelectedOrder(null)} style={s.closeCircle}><FaTimes /></div>
                        </div>
                        
                        <div style={s.modalBody}>
                            <div style={s.infoSection}>
                                <label style={s.label}>Sipariş İçeriği</label>
                                <div style={s.itemList}>
                                    {selectedOrder.items?.map((item, i) => (
                                        <div key={i} style={s.productRow}>
                                            <div style={s.productImageWrapper}>
                                                {/* Görsel değişkeni kontrolü */}
                                                {(item.part?.photo || item.part?.image) ? (
                                                    <img src={item.part.photo || item.part.image} alt="" style={s.productImg} />
                                                ) : (
                                                    <FaBox color="#94a3b8" size={18} />
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>
                                                    {item.part?.name || "Ürün Bilgisi Yok"}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                                    <span style={s.brandBadge}>{item.part?.brand?.name || "Genel"}</span>
                                                    <span style={{ fontSize: '12px', color: '#64748b' }}>| OEM: {item.part?.oem || '---'}</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '800', color: '#4f46e5' }}>{item.priceAtAdd || item.price} TL</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>x {item.quantity} Adet</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={s.infoSection}>
                                <label style={s.label}>Teslimat Adresi</label>
                                <div style={s.addressBox}>
                                    <strong>{selectedOrder.address?.title}</strong><br/>
                                    {selectedOrder.address?.detail}
                                </div>
                            </div>

                            <div style={s.cargoSection}>
                                <h4 style={s.sectionTitle}><FaTruck /> Kargo Bilgileri</h4>
                                <div style={s.inputGroup}>
                                    <input placeholder="Kargo Firması" value={cargoInfo.company || selectedOrder.cargoCompany || ''} 
                                           onChange={e => setCargoInfo({...cargoInfo, company: e.target.value})} style={s.input}/>
                                    <input placeholder="Takip Kodu" value={cargoInfo.code || selectedOrder.trackingCode || ''} 
                                           onChange={e => setCargoInfo({...cargoInfo, code: e.target.value})} style={s.input}/>
                                </div>
                            </div>

                            <div style={s.actionGrid}>
                                <button disabled={selectedOrder.currentStep >= 1} onClick={() => handleUpdate(selectedOrder._id, 'Ödeme Onaylandı', 1)} 
                                        style={{...s.actionBtn, opacity: selectedOrder.currentStep >= 1 ? 0.5 : 1}}>
                                    <FaCheckCircle color={selectedOrder.currentStep >= 1 ? '#94a3b8' : '#8b5cf6'}/> Onayla
                                </button>
                                <button disabled={selectedOrder.currentStep >= 2} onClick={() => handleUpdate(selectedOrder._id, 'Hazırlanıyor', 2)} 
                                        style={{...s.actionBtn, opacity: selectedOrder.currentStep >= 2 ? 0.5 : 1}}>
                                    <FaBox color={selectedOrder.currentStep >= 2 ? '#94a3b8' : '#f59e0b'}/> Hazırla
                                </button>
                                <button disabled={selectedOrder.currentStep >= 3} onClick={() => handleUpdate(selectedOrder._id, 'Kargoya Verildi', 3)} 
                                        style={{...s.actionBtn, opacity: selectedOrder.currentStep >= 3 ? 0.5 : 1}}>
                                    <FaTruck color={selectedOrder.currentStep >= 3 ? '#94a3b8' : '#3b82f6'}/> Kargola
                                </button>
                                <button disabled={selectedOrder.currentStep === 4} onClick={() => handleUpdate(selectedOrder._id, 'Teslim Edildi', 4)} 
                                        style={{...s.actionBtn, opacity: selectedOrder.currentStep === 4 ? 0.5 : 1}}>
                                    <FaCheckCircle color={selectedOrder.currentStep === 4 ? '#94a3b8' : '#22c55e'}/> Teslim Et
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const s = {
    container: { padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 },
    subtitle: { color: '#64748b', fontSize: '14px', marginTop: '5px' },
    statsCard: { background: '#fff', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px' },
    tableCard: { background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: '#f1f5f9', textAlign: 'left' },
    th: { padding: '15px 20px', fontSize: '11px', fontWeight: '700', color: '#64748b', letterSpacing: '1px' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '18px 20px', fontSize: '14px', color: '#334155' },
    customerCell: { display: 'flex', alignItems: 'center', gap: '12px' },
    avatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
    statusBadge: { padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' },
    payBadge: { display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: '500' },
    viewBtn: { background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px', borderRadius: '8px', marginRight: '8px', cursor: 'pointer' },
    delBtn: { background: '#fff1f2', color: '#e11d48', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modal: { background: '#fff', width: '550px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
    modalHeader: { padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeCircle: { width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    modalBody: { padding: '25px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' },
    infoSection: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' },
    itemList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    productRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', border: '1px solid #f1f5f9', borderRadius: '12px' },
    productImageWrapper: { width: '50px', height: '50px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    productImg: { width: '100%', height: '100%', objectFit: 'contain' },
    brandBadge: { padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },
    addressBox: { padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' },
    cargoSection: { background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '1px solid #e2e8f0' },
    sectionTitle: { margin: '0 0 12px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
    inputGroup: { display: 'flex', gap: '10px' },
    input: { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' },
    actionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    actionBtn: { padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' },
    loader: { padding: '100px', textAlign: 'center', color: '#6366f1', fontWeight: '700' },
    paginationContainer: { display: 'flex', justifyContent: 'center', padding: '20px', gap: '8px', borderTop: '1px solid #f1f5f9' },
    pageBtn: { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer' },
    pageNumber: { width: '35px', height: '35px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }
};

export default AdminOrders;