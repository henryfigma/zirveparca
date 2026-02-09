import React, { useState, useEffect } from 'react';
import API from '../../api';

const CarTable = () => {
    const [cars, setCars] = useState([]);
    const [brands, setBrands] = useState([]); // Marka listesi için yeni state
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [editMode, setEditMode] = useState(null);
    const [selectedCarId, setSelectedCarId] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Hem araçları hem markaları aynı anda yüklüyoruz
            const [carRes, brandRes] = await Promise.all([
                API.get('/cars'),
                API.get('/brands')
            ]);
            setCars(carRes.data);
            setBrands(brandRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Veriler yüklenemedi", err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Seçili araç silinecektir. Emin misiniz?")) return;
        try {
            await API.delete(`/cars/${id}`);
            setCars(cars.filter(c => c._id !== id));
            setSelectedCarId(null);
        } catch (err) {
            alert("Silme hatası!");
        }
    };

const handleUpdate = async () => {
    try {
        // Sistem alanlarını ayıklıyoruz
        const { _id, createdAt, updatedAt, __v, ...pureData } = editMode;

        // Marka bilgisini sadece ID olarak hazırlıyoruz
        const payload = {
            ...pureData,
            brand: (pureData.brand && typeof pureData.brand === 'object') 
                ? pureData.brand._id 
                : pureData.brand
        };

        // PUT isteği gönderiyoruz
        const res = await API.put(`/cars/${_id}`, payload);
        
        if(res.status === 200) {
            setEditMode(null);
            await loadData(); 
            alert("✅ Araç bilgileri başarıyla güncellendi!");
        }
    } catch (err) {
        console.error("Hata detayı:", err.response?.data);
        // Backend'den gelen spesifik hata mesajını göster
        const errorMsg = err.response?.data?.message || "Sunucuyla iletişim kurulamadı";
        alert(`❌ Hata: ${errorMsg}`);
    }
};

    const filteredCars = cars.filter(c => {
        const brandName = (c.brand && typeof c.brand === 'object') ? (c.brand.name || '') : '';
        const modelName = c.model || '';
        const search = searchTerm.toLowerCase();
        return brandName.toLowerCase().includes(search) || modelName.toLowerCase().includes(search);
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const currentItems = filteredCars.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
    const totalPages = Math.ceil(filteredCars.length / itemsPerPage);

    if (loading) return <div style={{ padding: '20px' }}>📊 Veriler hazırlanıyor...</div>;

    return (
        <div style={tableStyles.container}>
            <div style={tableStyles.filterBar}>
                <div style={tableStyles.filterGroup}>
                    <input
                        placeholder="Marka veya model ara..."
                        style={tableStyles.filterInput}
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
                        Toplam: <strong>{filteredCars.length}</strong> Araç
                    </div>
                </div>
            </div>

            <div style={tableStyles.tableWrapper}>
                <table style={tableStyles.table}>
                    <thead>
                        <tr style={tableStyles.thRow}>
                            <th style={{ ...tableStyles.th, width: '40px' }}>Seç</th>
                            <th style={tableStyles.th}>Görsel</th>
                            <th style={tableStyles.th}>Marka/Model</th>
                            <th style={tableStyles.th}>Motor/Güç</th>
                            <th style={tableStyles.th}>Kasa</th>
                            <th style={tableStyles.th}>Yıllar</th>
                            <th style={{ ...tableStyles.th, textAlign: 'right' }}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((car) => {
                            const isSelected = selectedCarId === car._id;
                            const brandName = (car.brand && typeof car.brand === 'object') ? car.brand.name : "Belirsiz";

                            return (
                                <tr
                                    key={car._id}
                                    style={{
                                        ...tableStyles.tr,
                                        backgroundColor: isSelected ? '#f0f7ff' : 'transparent'
                                    }}
                                    onClick={() => setSelectedCarId(car._id)}
                                >
                                    <td style={tableStyles.td}>
                                        <input type="radio" checked={isSelected} readOnly />
                                    </td>
                                    <td style={tableStyles.td}>
                                        <img src={car.modelPhoto || 'https://via.placeholder.com/50'} alt="" style={tableStyles.img} />
                                    </td>
                                    <td style={tableStyles.td}>
                                        <strong>{brandName}</strong><br />
                                        <span style={{ fontSize: '12px', color: '#666' }}>{car.model}</span>
                                    </td>
                                    <td style={tableStyles.td}>
                                        {car.engine}<br />
                                        <span style={{ fontSize: '12px', color: '#2e89ff' }}>{car.hp} HP / {car.kw} KW</span>
                                    </td>
                                    <td style={tableStyles.td}>{car.bodyStyle}</td>
                                    <td style={tableStyles.td}>{car.years}</td>
                                    <td style={{ ...tableStyles.td, textAlign: 'right' }}>
                                        <button
                                            disabled={!isSelected}
                                            onClick={(e) => { e.stopPropagation(); setEditMode(car); }}
                                            style={isSelected ? tableStyles.editBtn : tableStyles.disabledBtn}
                                        >⚙️</button>
                                        <button
                                            disabled={!isSelected}
                                            onClick={(e) => { e.stopPropagation(); handleDelete(car._id); }}
                                            style={isSelected ? tableStyles.deleteBtn : tableStyles.disabledBtn}
                                        >🗑️</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={tableStyles.pagination}>
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={tableStyles.pageBtn}>Önceki</button>
                    <span style={{alignSelf:'center', fontSize:'14px'}}> {currentPage} / {totalPages} </span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={tableStyles.pageBtn}>Sonraki</button>
                </div>
            )}

            {/* DÜZENLEME MODALI */}
            {editMode && (
                <div style={tableStyles.modalOverlay} onClick={() => setEditMode(null)}>
                    <div style={tableStyles.editModal} onClick={e => e.stopPropagation()}>
                        <div style={tableStyles.modalHeader}>
                            <h3>🏎️ Araç Düzenle</h3>
                            <button onClick={() => setEditMode(null)} style={tableStyles.closeBtn}>✕</button>
                        </div>
                        <div style={tableStyles.modalBody}>
                            
                            {/* MARKA SEÇİMİ (DROPDOWN) */}
                            <label style={tableStyles.label}>Marka</label>
                            <select 
                                style={tableStyles.input}
                                value={(editMode.brand && typeof editMode.brand === 'object') ? editMode.brand._id : editMode.brand}
                                onChange={e => setEditMode({ ...editMode, brand: e.target.value })}
                            >
                                <option value="">Marka Seçin</option>
                                {brands.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>

                            <label style={tableStyles.label}>Model Adı</label>
                            <input style={tableStyles.input} value={editMode.model || ''} onChange={e => setEditMode({ ...editMode, model: e.target.value })} />

                            <label style={tableStyles.label}>Motor Tipi</label>
                            <input style={tableStyles.input} value={editMode.engine || ''} onChange={e => setEditMode({ ...editMode, engine: e.target.value })} />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={tableStyles.label}>Beygir (HP)</label>
                                    <input style={tableStyles.input} value={editMode.hp || ''} onChange={e => setEditMode({ ...editMode, hp: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={tableStyles.label}>Kilowatt (KW)</label>
                                    <input style={tableStyles.input} value={editMode.kw || ''} onChange={e => setEditMode({ ...editMode, kw: e.target.value })} />
                                </div>
                            </div>

                            <label style={tableStyles.label}>Kasa Tipi</label>
                            <select style={tableStyles.input} value={editMode.bodyStyle || ''} onChange={e => setEditMode({ ...editMode, bodyStyle: e.target.value })}>
                                <option value="Sedan">Sedan</option>
                                <option value="Hatchback">Hatchback</option>
                                <option value="SUV">SUV</option>
                                <option value="Station Wagon">Station Wagon</option>
                            </select>

                            <label style={tableStyles.label}>Üretim Yılları</label>
                            <input style={tableStyles.input} value={editMode.years || ''} onChange={e => setEditMode({ ...editMode, years: e.target.value })} />

                            <label style={tableStyles.label}>Görsel URL</label>
                            <input style={tableStyles.input} value={editMode.modelPhoto || ''} onChange={e => setEditMode({ ...editMode, modelPhoto: e.target.value })} />

                            <button onClick={handleUpdate} style={tableStyles.saveBtn}>DEĞİŞİKLİKLERİ KAYDET</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ... (tableStyles objen aynı kalabilir, yukarıdaki yapıya uygun çalışacaktır)
const tableStyles = {
    container: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', fontFamily: 'sans-serif' },
    filterBar: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #eee' },
    filterGroup: { display: 'flex', gap: '10px', alignItems: 'center' },
    filterInput: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', width: '250px' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f1f3f5' },
    th: { padding: '12px', textAlign: 'left', fontSize: '13px', color: '#444' },
    tr: { borderBottom: '1px solid #f1f1f1', cursor: 'pointer' },
    td: { padding: '12px', fontSize: '14px' },
    img: { width: '60px', height: '40px', objectFit: 'contain', background: '#f9f9f9', borderRadius: '4px' },
    editBtn: { padding: '6px 12px', backgroundColor: '#f0f2f5', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    deleteBtn: { padding: '6px 10px', backgroundColor: '#fff0f0', color: 'red', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    disabledBtn: { padding: '6px 12px', backgroundColor: '#f5f5f5', color: '#ccc', border: 'none', borderRadius: '4px', cursor: 'not-allowed', marginRight: '5px' },
    pagination: { display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' },
    pageBtn: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    editModal: { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', width: '450px', maxHeight: '95vh', overflowY: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
    modalBody: { display: 'flex', flexDirection: 'column' },
    input: { width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' },
    label: { display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#666' },
    saveBtn: { width: '100%', padding: '12px', backgroundColor: '#2e89ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    closeBtn: { border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }
};

export default CarTable;