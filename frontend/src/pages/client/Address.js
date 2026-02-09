import React, { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import { FaMapMarkerAlt, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import API from '../../api';

const Addresses = () => {
    const [showModal, setShowModal] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState({ title: '', detail: '' });

    useEffect(() => {
        fetchAddresses();
    }, []);

    // 1. Adresleri Çekme (Token Ekli)
    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await API.get('/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(res.data.addresses || []);
        } catch (err) {
            console.error("Adresler yüklenemedi:", err.response?.data);
        }
    };

    // 2. Adres Ekleme (Token Ekli)
    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await API.post('/auth/address', newAddress, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Backend'den dönen güncel adres listesini state'e atıyoruz
            setAddresses(res.data.addresses); 
            setShowModal(false);
            setNewAddress({ title: '', detail: '' });
        } catch (err) {
            console.error("Hata detayı:", err.response?.data);
            alert(err.response?.data?.message || "Adres eklenemedi.");
        }
    };

    // 3. Adres Silme (Token Ekli)
    const handleDeleteAddress = async (addressId) => {
        if (window.confirm("Bu adresi silmek istediğinize emin misiniz?")) {
            try {
                const token = localStorage.getItem('token');
                const res = await API.delete(`/auth/address/${addressId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAddresses(res.data.addresses);
            } catch (err) {
                console.error("Silme hatası:", err.response?.data);
                alert("Adres silinemedi.");
            }
        }
    };

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <NavBar />
            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Adreslerim</h1>
                        <p style={{color: '#636e72', margin: '5px 0 0 0'}}>
                            Kayıtlı {addresses.length} adresiniz bulunuyor.
                        </p>
                    </div>
                    <button style={styles.addBtn} onClick={() => setShowModal(true)}>
                        <FaPlus /> Yeni Adres Ekle
                    </button>
                </div>
                
                {addresses.length > 0 ? (
                    <div style={styles.addressGrid}>
                        {addresses.map((addr) => (
                            <div key={addr._id} style={styles.addressCard}>
                                <div style={styles.cardTop}>
                                    <div style={styles.titleWrapper}>
                                        <FaMapMarkerAlt color="#0984e3" />
                                        <strong style={{fontSize: '16px'}}>{addr.title}</strong>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteAddress(addr._id)}
                                        style={styles.deleteBtn}
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                                <p style={styles.detailText}>{addr.detail}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.emptyCard}>
                        <FaMapMarkerAlt size={60} color="#dfe6e9" />
                        <p style={styles.emptyText}>Henüz kayıtlı bir adresiniz bulunmamaktadır.</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={{margin:0}}>Yeni Adres Ekle</h3>
                            <FaTimes onClick={() => setShowModal(false)} style={{cursor:'pointer'}} />
                        </div>
                        <form onSubmit={handleAddAddress}>
                            <label style={styles.label}>ADRES BAŞLIĞI</label>
                            <input 
                                type="text" 
                                placeholder="Örn: Ev, İş, Ankara Ofis" 
                                style={styles.input}
                                required
                                value={newAddress.title}
                                onChange={(e) => setNewAddress({...newAddress, title: e.target.value})}
                            />
                            <label style={styles.label}>ADRES DETAYI</label>
                            <textarea 
                                placeholder="Mahalle, sokak, numara ve daire bilgilerini yazınız..." 
                                style={{...styles.input, height: '100px', resize: 'none'}}
                                required
                                value={newAddress.detail}
                                onChange={(e) => setNewAddress({...newAddress, detail: e.target.value})}
                            ></textarea>
                            <button type="submit" style={styles.submitBtn}>ADRESİ KAYDET</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles aynı kalabilir...
const styles = {
    container: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontWeight: '900', margin: 0, fontSize: '28px', color: '#2d3436' },
    addBtn: { background: '#00b894', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.3s' },
    addressGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    addressCard: { background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', position: 'relative' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f1f2f6', paddingBottom: '10px' },
    titleWrapper: { display: 'flex', alignItems: 'center', gap: '10px' },
    deleteBtn: { background: 'none', border: 'none', color: '#ff7675', cursor: 'pointer', padding: '5px' },
    detailText: { fontSize: '14px', color: '#636e72', lineHeight: '1.6' },
    emptyCard: { background: '#fff', padding: '50px', borderRadius: '15px', textAlign: 'center', border: '1px solid #eee' },
    emptyText: { color: '#636e72', fontSize: '16px', marginTop: '15px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(3px)' },
    modal: { background: '#fff', padding: '30px', borderRadius: '15px', width: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    label: { fontSize: '11px', fontWeight: 'bold', color: '#b2bec3', display: 'block', marginBottom: '5px' },
    input: { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #dfe6e9', outline: 'none', fontSize: '14px' },
    submitBtn: { width: '100%', padding: '15px', background: '#0984e3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }
};

export default Addresses;