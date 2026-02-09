import React, { useState, useEffect } from 'react';
import API from '../../api';

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [editMode, setEditMode] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await API.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error("Veri çekme hatası:", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bu kategori silindiğinde ona bağlı parçalar ve alt kategoriler etkilenebilir. Emin misiniz?")) {
            try {
                await API.delete(`/categories/${id}`);
                loadData();
            } catch (err) { alert("❌ Silme işlemi başarısız."); }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        // Mantıksal Kontrol: Kendi kendisinin altı olamaz
        if (editMode.parent === editMode._id) {
            alert("❌ Bir kategori kendisinin üst kategorisi olamaz!");
            return;
        }

        try {
            await API.put(`/categories/${editMode._id}`, {
                name: editMode.name,
                image: editMode.parent ? "" : editMode.image, // Alt kategori oluyorsa görseli temizle (isteğe bağlı)
                parent: editMode.parent || null // Boş string yerine null göndermek daha sağlıklıdır
            });
            setEditMode(null);
            loadData();
            alert("✅ Kategori başarıyla güncellendi!");
        } catch (err) {
            console.error("Güncelleme hatası:", err);
            alert("❌ Güncelleme başarısız: " + (err.response?.data?.message || "Sunucu hatası"));
        }
    };

    // Düzenleme sırasında listelenecek "Üst Kategori" adayları
    // Sadece ana kategoriler üst kategori olabilir.
    const mainCategories = categories.filter(cat => !cat.parent);

    return (
        <div style={styles.tableWrapper}>
            <h2 style={styles.title}>Kategori Yönetimi</h2>
            <table style={styles.table}>
                <thead>
                    <tr style={styles.thead}>
                        <th style={styles.th}>Görsel</th>
                        <th style={styles.th}>Kategori Adı</th>
                        <th style={styles.th}>Tür</th>
                        <th style={styles.th}>Üst Kategori</th>
                        <th style={styles.th}>İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map(cat => (
                        <tr key={cat._id} style={styles.tr}>
                            <td style={styles.td}>
                                {cat.image && !cat.parent ? (
                                    <img src={cat.image} style={styles.img} alt="" />
                                ) : (
                                    <div style={styles.noImgBox}>{cat.parent ? '↳' : 'N/A'}</div>
                                )}
                            </td>
                            <td style={{...styles.td, fontWeight: cat.parent ? '400' : '700'}}>
                                {cat.name}
                            </td>
                            <td style={styles.td}>
                                <span style={cat.parent ? styles.badgeSub : styles.badgeMain}>
                                    {cat.parent ? 'Alt Kategori' : 'Ana Kategori'}
                                </span>
                            </td>
                            <td style={styles.td}>
                                {cat.parent?.name || <span style={{color:'#ccc'}}>—</span>}
                            </td>
                            <td style={styles.td}>
                                <div style={{display:'flex', gap:'8px'}}>
                                    <button onClick={() => setEditMode({...cat, parent: cat.parent?._id || ""})} style={styles.editBtn}>DÜZENLE</button>
                                    <button onClick={() => handleDelete(cat._id)} style={styles.delBtn}>SİL</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editMode && (
                <div style={styles.modalOverlay} onClick={() => setEditMode(null)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3>Kategoriyi Düzenle</h3>
                            <span style={{fontSize:'12px', color:'#999'}}>ID: {editMode._id}</span>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <label style={styles.label}>Kategori Adı</label>
                            <input 
                                style={styles.input}
                                value={editMode.name}
                                onChange={e => setEditMode({...editMode, name: e.target.value})}
                                required
                            />

                            <label style={styles.label}>Üst Kategori (Opsiyonel)</label>
                            <select 
                                style={styles.input}
                                value={editMode.parent}
                                onChange={e => setEditMode({...editMode, parent: e.target.value, image: e.target.value ? "" : editMode.image})}
                            >
                                <option value="">-- Ana Kategori Yap (Üst Yok) --</option>
                                {mainCategories
                                    .filter(m => m._id !== editMode._id) // Kendisini listeden çıkar
                                    .map(m => (
                                        <option key={m._id} value={m._id}>{m.name}</option>
                                    ))
                                }
                            </select>

                            {!editMode.parent && (
                                <>
                                    <label style={styles.label}>Görsel URL</label>
                                    <input 
                                        style={styles.input}
                                        placeholder="https://..."
                                        value={editMode.image || ''}
                                        onChange={e => setEditMode({...editMode, image: e.target.value})}
                                    />
                                </>
                            )}

                            <div style={styles.modalActions}>
                                <button type="submit" style={styles.saveBtn}>GÜNCELLEMEYİ KAYDET</button>
                                <button type="button" onClick={() => setEditMode(null)} style={styles.cancelBtn}>KAPAT</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    tableWrapper: { padding: '30px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', margin: '20px', overflowX: 'auto' },
    title: { marginBottom: '25px', color: '#1e293b', fontSize: '24px', fontWeight: '800' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: '#f8fafc' },
    th: { padding: '16px', textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: '0.2s' },
    td: { padding: '14px 16px', verticalAlign: 'middle', color: '#334155', fontSize: '14px' },
    img: { width: '45px', height: '45px', objectFit: 'contain', borderRadius: '10px', background: '#f8fafc', border: '1px solid #edf2f7' },
    noImgBox: { width: '45px', height: '45px', display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9', borderRadius:'10px', color:'#cbd5e1', fontSize:'18px' },
    badgeMain: { padding: '5px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '8px', fontSize: '11px', fontWeight: '700' },
    badgeSub: { padding: '5px 12px', background: '#e0f2fe', color: '#0284c7', borderRadius: '8px', fontSize: '11px', fontWeight: '700' },
    delBtn: { background: '#fff', color: '#ef4444', border: '1px solid #fee2e2', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    editBtn: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: '#fff', padding: '32px', borderRadius: '20px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
    modalHeader: { marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px', marginTop: '15px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px', outline: 'none' },
    modalActions: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '25px' },
    saveBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
    cancelBtn: { background: '#f1f5f9', color: '#64748b', border: 'none', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};

export default CategoryTable;