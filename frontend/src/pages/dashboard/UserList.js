import React, { useState, useEffect } from 'react';
import API from '../../api';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
        loadUsers(); 
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await API.get('/users');
            setUsers(res.data);
        } catch (err) { 
            console.error("Kullanıcı listesi yükleme hatası:", err); 
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={s.container}>
            {/* Üst Bar */}
            <div style={s.header}>
                <div>
                    <h2 style={s.title}>Müşteri Portföyü</h2>
                    <p style={s.subtitle}>
                        {loading ? 'Yükleniyor...' : `${users.length} kayıtlı kullanıcı bulundu`}
                    </p>
                </div>
                <div style={s.searchWrapper}>
                    <span style={s.searchIcon}>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Müşteri adı veya e-posta ile ara..." 
                        style={s.searchBar} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Ana Tablo */}
            <div style={s.tableCard}>
                <table style={s.table}>
                    <thead>
                        <tr style={s.thead}>
                            <th style={s.th}>MÜŞTERİ</th>
                            <th style={s.th}>İLETİŞİM BİLGİLERİ</th>
                            <th style={s.th}>YETKİ</th>
                            <th style={s.th}>DURUM</th>
                            <th style={{...s.th, textAlign:'right'}}>EYLEM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id} style={s.tr}>
                                <td style={s.td}>
                                    <div style={s.userBadge}>
                                        <div style={s.avatar}>{user.fullName?.[0] || '?'}</div>
                                        <strong>{user.fullName}</strong>
                                    </div>
                                </td>
                                <td style={s.td}>
                                    <div style={s.contactInfo}>
                                        <span>📧 {user.email}</span>
                                        <span>📞 {user.phone || 'Telefon yok'}</span>
                                    </div>
                                </td>
                                <td style={s.td}>
                                    <span style={{
                                        ...s.roleBadge, 
                                        background: user.role === 'admin' ? '#fee2e2' : '#e0f2fe',
                                        color: user.role === 'admin' ? '#991b1b' : '#075985'
                                    }}>
                                        {user.role?.toUpperCase()}
                                    </span>
                                </td>
                                <td style={s.td}>
                                    {user.cart?.items?.length > 0 ? 
                                        <span style={s.cartStatus}>🛒 {user.cart.items.length} Parça Ürün</span> : 
                                        <span style={s.emptyStatus}>Sepet Boş</span>
                                    }
                                </td>
                                <td style={{...s.td, textAlign:'right'}}>
                                    <button onClick={() => setSelectedUser(user)} style={s.btnView}>Detayları Gör</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Gelişmiş Detay Modalı */}
            {selectedUser && (
                <div style={s.overlay} onClick={() => setSelectedUser(null)}>
                    <div style={s.modal} onClick={e => e.stopPropagation()}>
                        <div style={s.modalHeader}>
                            <div style={s.modalTitleGroup}>
                                <div style={s.largeAvatar}>{selectedUser.fullName?.[0]}</div>
                                <div>
                                    <h3 style={{margin:0}}>{selectedUser.fullName}</h3>
                                    <span style={s.modalSubtitle}>Müşteri ID: {selectedUser._id}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} style={s.btnClose}>✕</button>
                        </div>
                        
                        <div style={s.modalBody}>
                            <div style={s.modalGrid}>
                                {/* Sol Kolon: Adresler */}
                                <div>
                                    <h4 style={s.innerTitle}>📍 Kayıtlı Adresler</h4>
                                    <div style={s.scrollContainer}>
                                        {selectedUser.addresses?.length > 0 ? selectedUser.addresses.map((addr, i) => (
                                            <div key={i} style={s.addressCard}>
                                                <div style={s.addrHeader}>
                                                    <span style={s.addrTitle}>{addr.title}</span>
                                                </div>
                                                <p style={s.addrText}>{addr.detail}</p>
                                                <small style={s.addrCity}>{addr.district} / {addr.city}</small>
                                            </div>
                                        )) : <div style={s.emptyState}>Adres bilgisi bulunamadı.</div>}
                                    </div>
                                </div>

                                {/* Sağ Kolon: Garaj ve Sepet */}
                                <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                                    <div style={s.sideSection}>
                                        <h4 style={s.innerTitle}>🚗 Garajdaki Araçlar</h4>
                                        {selectedUser.garage?.length > 0 ? selectedUser.garage.map((car, i) => (
                                            <div key={i} style={s.garageItem}>
                                                <span style={{fontSize:'18px'}}>🚘</span>
                                                <div>
                                                    <div style={{fontWeight:'600'}}>{car.brand?.name} {car.model}</div>
                                                    <small style={{color:'#64748b'}}>{car.year} • {car.engine}</small>
                                                </div>
                                            </div>
                                        )) : <div style={s.emptyState}>Garajda araç yok.</div>}
                                    </div>

                                    <div style={s.sideSection}>
                                        <h4 style={s.innerTitle}>🛒 Aktif Sepet Bilgisi</h4>
                                        {selectedUser.cart?.items?.length > 0 ? (
                                            <div style={s.cartList}>
                                                {selectedUser.cart.items.map((item, i) => (
                                                    <div key={i} style={s.cartItem}>
                                                        <div style={{display:'flex', flexDirection:'column', flex: 1}}>
                                                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                                                <span style={{fontWeight:'700', fontSize:'13px', color:'#1e293b'}}>
                                                                    {item.part?.name || "Bilinmeyen Parça"}
                                                                </span>
                                                                <span style={s.qty}>x{item.quantity}</span>
                                                            </div>
                                                            
                                                            <div style={{display:'flex', gap:'6px', marginTop:'6px'}}>
                                                                <span style={s.miniBadge}>🏷️ {item.part?.brand || 'Markasız'}</span>
                                                                <span style={s.miniBadge}># {item.part?.oem || 'OEM Yok'}</span>
                                                            </div>

                                                            <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px', alignItems:'center'}}>
                                                                <small style={{color:'#0f172a', fontWeight:'700'}}>
                                                                    {item.priceAtAdd?.toLocaleString()} TL
                                                                </small>
                                                                <span style={{ 
                                                                    fontSize: '11px', 
                                                                    fontWeight: '700', 
                                                                    color: item.part?.stock > 0 ? '#10b981' : '#ef4444' 
                                                                }}>
                                                                    {item.part?.stock > 0 ? `📦 Stok: ${item.part.stock}` : '❌ Stokta Yok'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div style={s.totalSummary}>
                                                    <span>Genel Toplam:</span>
                                                    <span>
                                                        {selectedUser.cart.items.reduce((acc, curr) => acc + (curr.priceAtAdd * curr.quantity), 0).toLocaleString()} TL
                                                    </span>
                                                </div>
                                            </div>
                                        ) : <div style={s.emptyState}>Sepet şu an boş.</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const s = {
    container: { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a' },
    subtitle: { margin: '5px 0 0', color: '#64748b', fontSize: '14px' },
    searchWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: '12px', fontSize: '14px' },
    searchBar: { padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '350px', outline: 'none', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    tableCard: { backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    th: { padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
    td: { padding: '16px 24px', fontSize: '14px', verticalAlign: 'middle' },
    userBadge: { display: 'flex', alignItems: 'center', gap: '12px' },
    avatar: { width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    contactInfo: { display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px', color: '#475569' },
    roleBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
    cartStatus: { color: '#d97706', fontWeight: '600', fontSize: '13px' },
    emptyStatus: { color: '#94a3b8', fontSize: '13px' },
    btnView: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#0f172a', transition: '0.2s' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#fff', width: '950px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' },
    modalHeader: { padding: '30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitleGroup: { display: 'flex', alignItems: 'center', gap: '20px' },
    largeAvatar: { width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#3b82f6', color: '#fff', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    modalSubtitle: { fontSize: '12px', color: '#94a3b8' },
    btnClose: { border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: '#64748b' },
    modalBody: { padding: '30px' },
    modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    innerTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
    scrollContainer: { maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' },
    addressCard: { padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px', background: '#f8fafc' },
    addrTitle: { fontWeight: '700', color: '#3b82f6', fontSize: '14px' },
    addrText: { margin: '8px 0', fontSize: '13px', lineHeight: '1.5', color: '#1e293b' },
    addrCity: { color: '#64748b', fontWeight: '500' },
    sideSection: { background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' },
    garageItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 0', borderBottom: '1px solid #e2e8f0' },
    cartList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    cartItem: { display: 'flex', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' },
    miniBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', border: '1px solid #e2e8f0' },
    qty: { background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
    totalSummary: { marginTop: '15px', paddingTop: '12px', borderTop: '2px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '15px', color: '#0f172a' },
    emptyState: { textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }
};

export default UserList;