import React, { useState, useEffect } from 'react';
import API from '../../api';

const BrandTable = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- Filtreleme & Sayfalama ---
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- Düzenleme (Modal) ---
    const [editMode, setEditMode] = useState(null);

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        try {
            const res = await API.get('/brands');
            setBrands(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Markalar yüklenemedi", err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu markayı silmek istediğinize emin misiniz?")) return;
        try {
            await API.delete(`/brands/${id}`);
            setBrands(brands.filter(b => b._id !== id));
        } catch (err) {
            alert("Silme hatası!");
        }
    };

    const handleUpdate = async () => {
        try {
            await API.put(`/brands/${editMode._id}`, editMode);
            setEditMode(null);
            loadBrands();
            alert("✅ Marka güncellendi!");
        } catch (err) {
            alert("❌ Güncelleme hatası!");
        }
    };

    // Filtreleme
    const filteredBrands = brands.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sayfalama
    const indexOfLastItem = currentPage * itemsPerPage;
    const currentItems = filteredBrands.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
    const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

    if (loading) return <div style={{padding: '20px'}}>Yükleniyor...</div>;

    return (
        <div style={tableStyles.container}>
            {/* ÜST FİLTRE BARI */}
            <div style={tableStyles.filterBar}>
                <div style={tableStyles.filterGroup}>
                    <input 
                        placeholder="Marka adıyla ara..." 
                        style={tableStyles.filterInput}
                        value={searchTerm}
                        onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                    />
                    <div style={{marginLeft: 'auto', fontSize: '14px', color: '#666'}}>
                        Toplam: <strong>{filteredBrands.length}</strong> Marka
                    </div>
                </div>
            </div>

            {/* TABLO YAPISI */}
            <div style={tableStyles.tableWrapper}>
                <table style={tableStyles.table}>
                    <thead>
                        <tr style={tableStyles.thRow}>
                            <th style={tableStyles.th}>Logo</th>
                            <th style={tableStyles.th}>Marka Adı</th>
                            <th style={tableStyles.th}>Kayıt Tarihi</th>
                            <th style={{...tableStyles.th, textAlign: 'right'}}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((brand) => (
                            <tr key={brand._id} style={tableStyles.tr}>
                                <td style={tableStyles.td}>
                                    <img src={brand.logo || 'https://via.placeholder.com/50'} alt="logo" style={tableStyles.img} />
                                </td>
                                <td style={tableStyles.td}><strong>{brand.name}</strong></td>
                                <td style={tableStyles.td}>{new Date(brand.createdAt).toLocaleDateString('tr-TR')}</td>
                                <td style={{...tableStyles.td, textAlign: 'right'}}>
                                    <button onClick={() => setEditMode(brand)} style={tableStyles.editBtn}>⚙️ Düzenle</button>
                                    <button onClick={() => handleDelete(brand._id)} style={tableStyles.deleteBtn}>🗑️ Sil</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div style={tableStyles.pagination}>
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={tableStyles.pageBtn}>Geri</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setCurrentPage(i+1)} 
                            style={{...tableStyles.pageNumber, backgroundColor: currentPage === i+1 ? '#2e89ff' : '#eee', color: currentPage === i+1 ? '#fff' : '#333'}}
                        >
                            {i+1}
                        </button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={tableStyles.pageBtn}>İleri</button>
                </div>
            )}

            {/* DÜZENLEME MODALI */}
            {editMode && (
                <div style={tableStyles.modalOverlay} onClick={() => setEditMode(null)}>
                    <div style={tableStyles.editModal} onClick={e => e.stopPropagation()}>
                        <div style={tableStyles.modalHeader}>
                            <h3>🏷️ Markayı Düzenle</h3>
                            <button onClick={() => setEditMode(null)} style={tableStyles.closeBtn}>✕</button>
                        </div>
                        <div style={tableStyles.modalBody}>
                            <label style={tableStyles.label}>Marka İsmi</label>
                            <input 
                                style={tableStyles.input} 
                                value={editMode.name} 
                                onChange={e => setEditMode({...editMode, name: e.target.value})} 
                            />
                            <label style={tableStyles.label}>Logo URL</label>
                            <input 
                                style={tableStyles.input} 
                                value={editMode.logo} 
                                onChange={e => setEditMode({...editMode, logo: e.target.value})} 
                            />
                            <button onClick={handleUpdate} style={tableStyles.saveBtn}>GÜNCELLEMEYİ KAYDET</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const tableStyles = {
    container: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', fontFamily: 'sans-serif' },
    filterBar: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #eee' },
    filterGroup: { display: 'flex', gap: '10px', alignItems: 'center' },
    filterInput: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', width: '250px' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f1f3f5' },
    th: { padding: '12px', textAlign: 'left', fontSize: '13px', color: '#444' },
    tr: { borderBottom: '1px solid #f1f1f1' },
    td: { padding: '12px', fontSize: '14px' },
    img: { height: '35px', width: '60px', objectFit: 'contain', background: '#f9f9f9', borderRadius: '5px' },
    editBtn: { padding: '6px 12px', backgroundColor: '#f0f2f5', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    deleteBtn: { padding: '6px 10px', backgroundColor: '#fff0f0', color: 'red', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    pagination: { display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '5px' },
    pageBtn: { padding: '5px 12px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer' },
    pageNumber: { width: '30px', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    editModal: { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', width: '400px' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
    modalBody: { display: 'flex', flexDirection: 'column' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' },
    label: { display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#666' },
    saveBtn: { width: '100%', padding: '12px', backgroundColor: '#2e89ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    closeBtn: { border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }
};

export default BrandTable;