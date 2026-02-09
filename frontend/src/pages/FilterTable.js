import React, { useState, useEffect } from 'react';
import API from '../api';

const FilterTable = () => {
    const [parts, setParts] = useState([]);
    const [cars, setCars] = useState([]);
    const [brands, setBrands] = useState([]);
    const [partBrands, setPartBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- YENİ FİLTRE STATE'LERİ ---
    const [filterCategory, setFilterCategory] = useState('');
    const [filterBrand, setFilterBrand] = useState('');
    
    // --- SAYFALAMA STATE'LERİ ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [editMode, setEditMode] = useState(null);
    const [editPool, setEditPool] = useState([]);
    const [newSelection, setNewSelection] = useState({ brand: '', model: '', carId: '' });
    const [catSelection, setCatSelection] = useState({ main: '', sub: '' });
    const [variantData, setVariantData] = useState({ brand: '', price: '', photo: '', description: '', stock: 0 });

    useEffect(() => { loadAllData(); }, []);

    const loadAllData = async () => {
        try {
            const [pRes, pbRes, cRes, bRes, catRes] = await Promise.all([
                API.get('/parts'), API.get('/part-brands'), API.get('/cars'), API.get('/brands'), API.get('/categories')
            ]);
            setParts(pRes.data || []);
            setPartBrands(pbRes.data || []);
            setCars(cRes.data || []);
            setBrands(bRes.data || []);
            setCategories(catRes.data || []);
            setLoading(false);
        } catch (err) { console.error("Hata:", err); setLoading(false); }
    };

    // --- FİLTRELEME MANTIĞI ---
    const filteredParts = parts.filter(p => {
        const matchesSearch = !searchTerm || 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.oem?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !filterCategory || 
            p.category?._id === filterCategory || 
            p.mainCategory?._id === filterCategory;

        const matchesBrand = !filterBrand || 
            p.brand?._id === filterBrand;

        return matchesSearch && matchesCategory && matchesBrand;
    });

    // --- SAYFALAMA HESAPLARI ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredParts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredParts.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getCarBrandName = (car) => {
        if (!car) return '';
        const b = typeof car.brand === 'object' ? car.brand : brands.find(x => x._id === car.brand);
        return b?.name || '';
    };

    const openEdit = (p) => {
        const currentCat = categories.find(c => c._id === (p.category?._id || p.category));
        const mainCatId = currentCat?.parent ? (currentCat.parent?._id || currentCat.parent) : currentCat?._id;
        const subCatId = currentCat?.parent ? currentCat?._id : '';

        setEditMode({ ...p, brand: p.brand?._id || p.brand, stock: p.stock || 0 });
        setVariantData({ brand: '', price: p.price, photo: '', description: '', stock: 0 });
        setCatSelection({ main: mainCatId, sub: subCatId });
        setEditPool(p.compatibleCars || []);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        try {
            await API.delete(`/parts/${id}`);
            setEditMode(null);
            loadAllData();
        } catch (err) { alert("Silme işlemi başarısız."); }
    };

    const existingVariants = parts.filter(p => p.oem === editMode?.oem);
    const usedBrandIds = existingVariants.map(v => (v.brand?._id || v.brand));
    const availablePartBrands = partBrands.filter(pb => !usedBrandIds.includes(pb._id));

    const handleSave = async (isNew = false) => {
        try {
            const commonData = {
                mainCategory: catSelection.main,
                category: catSelection.sub || catSelection.main,
                compatibleCars: editPool.map(c => c._id || c)
            };

            if (isNew) {
                if (!variantData.brand || !variantData.photo || !variantData.price) 
                    return alert("Marka, Görsel ve Fiyat zorunludur.");
                
                await API.post('/parts', {
                    ...editMode,
                    ...commonData,
                    _id: undefined,
                    photo: variantData.photo,
                    brand: variantData.brand,
                    price: Number(variantData.price),
                    stock: Number(variantData.stock),
                    description: variantData.description
                });
                alert("Varyant eklendi.");
            } else {
                await API.put(`/parts/${editMode._id}`, { 
                    ...editMode, 
                    ...commonData,
                    stock: Number(editMode.stock)
                });
                alert("Güncellendi.");
            }
            setEditMode(null);
            loadAllData();
        } catch (err) { alert("Hata oluştu."); }
    };

    const addToPool = () => {
        if (!newSelection.carId) return;
        const fullCar = cars.find(c => c._id === newSelection.carId);
        if (editPool.some(c => (c._id || c) === fullCar._id)) return;
        setEditPool([...editPool, fullCar]);
    };

    if (loading) return <div style={s.loading}>Veriler Hazırlanıyor...</div>;

    return (
        <div style={s.container}>
            <div style={s.headerCard}>
                <div style={s.searchRow}>
                    <div style={{...s.searchWrapper, flex: 2}}>
                        <span style={s.searchIcon}>🔍</span>
                        <input 
                            placeholder="Parça adı veya OEM numarası..." 
                            style={s.mainInput} 
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                        />
                    </div>
                    
                    <select 
                        style={{...s.select, marginBottom: 0, flex: 1}} 
                        value={filterCategory} 
                        onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Tüm Kategoriler</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>

                    <select 
                        style={{...s.select, marginBottom: 0, flex: 1}} 
                        value={filterBrand} 
                        onChange={e => { setFilterBrand(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Tüm Markalar</option>
                        {partBrands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={s.tableCard}>
                <table style={s.table}>
                    <thead>
                        <tr style={s.thRow}>
                            <th style={{...s.th, width: '80px'}}>GÖRSEL</th>
                            <th style={s.th}>OEM & PARÇA DETAYI</th>
                            <th style={s.th}>MARKA</th>
                            <th style={s.th}>FİYAT</th>
                            <th style={s.th}>STOK</th>
                            <th style={{...s.th, textAlign: 'center'}}>EYLEMLER</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(p => (
                            <tr key={p._id} style={s.tr}>
                                <td style={s.td}><img src={p.photo} style={s.img} alt="" /></td>
                                <td style={s.td}>
                                    <div style={s.oemGroup}>
                                        <code style={s.oemBadge}>{p.oem}</code>
                                        <span style={s.partName}>{p.name}</span>
                                    </div>
                                </td>
                                <td style={s.td}><span style={s.brandBadge}>{p.brand?.name}</span></td>
                                <td style={s.td}><span style={s.priceText}>{p.price} <small>TL</small></span></td>
                                <td style={s.td}>
                                    <span style={{...s.brandBadge, background: p.stock > 0 ? '#ecfdf5' : '#fef2f2', color: p.stock > 0 ? '#059669' : '#dc2626'}}>
                                        {p.stock || 0} Adet
                                    </span>
                                </td>
                                <td style={{...s.td, textAlign: 'center'}}>
                                    <div style={s.actionBtns}>
                                        <button onClick={() => openEdit(p)} style={s.btnEditMini} title="Düzenle">✏️</button>
                                        <button onClick={() => handleDelete(p._id)} style={s.btnDelMini} title="Sil">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* --- PAGINATION UI --- */}
                <div style={s.pagination}>
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => paginate(currentPage - 1)}
                        style={s.pageBtn}
                    >
                        Önceki
                    </button>
                    <div style={s.pageNumbers}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                            <button 
                                key={num} 
                                onClick={() => paginate(num)}
                                style={{
                                    ...s.pageNumber,
                                    background: currentPage === num ? '#4f46e5' : 'transparent',
                                    color: currentPage === num ? '#fff' : '#475569'
                                }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => paginate(currentPage + 1)}
                        style={s.pageBtn}
                    >
                        Sonraki
                    </button>
                </div>
            </div>

            {/* MODAL KISMI (DEĞİŞMEDİ) */}
            {editMode && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <div style={s.modalHeader}>
                            <div>
                                <h2 style={s.modalTitle}>Ürün Yönetim Paneli</h2>
                                <p style={s.modalSub}>ID: {editMode._id}</p>
                            </div>
                            <div style={s.modalHeaderActions}>
                                <button onClick={() => handleDelete(editMode._id)} style={s.btnDangerOutline}>Ürünü Kalıcı Olarak Sil</button>
                                <button onClick={() => setEditMode(null)} style={s.btnClose}>✕</button>
                            </div>
                        </div>
                        
                        <div style={s.modalBody}>
                            <div style={s.modalCol}>
                                <div style={s.sectionHeader}>
                                    <span style={s.sectionStep}>1</span>
                                    <h4>Temel Veriler</h4>
                                </div>
                                
                                <div style={s.imageUploadCard}>
                                    <img src={editMode.photo} style={s.previewImg} alt="Önizleme"/>
                                    <input style={s.input} value={editMode.photo} onChange={e => setEditMode({...editMode, photo: e.target.value})} placeholder="Görsel URL" />
                                </div>

                                <div style={s.inputRow}>
                                    <div style={{flex:1}}>
                                        <label style={s.label}>OEM KODU</label>
                                        <input style={s.input} value={editMode.oem} onChange={e => setEditMode({...editMode, oem: e.target.value})} />
                                    </div>
                                    <div style={{flex:2}}>
                                        <label style={s.label}>PARÇA ADI</label>
                                        <input style={s.input} value={editMode.name} onChange={e => setEditMode({...editMode, name: e.target.value})} />
                                    </div>
                                </div>

                                <div style={s.inputRow}>
                                    <div style={{flex:1}}>
                                        <label style={s.label}>ANA KATEGORİ</label>
                                        <select style={s.select} value={catSelection.main} onChange={e => setCatSelection({ main: e.target.value, sub: '' })}>
                                            <option value="">Seçiniz</option>
                                            {categories.filter(c => !c.parent).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{flex:1}}>
                                        <label style={s.label}>ALT KATEGORİ</label>
                                        <select style={s.select} disabled={!catSelection.main} value={catSelection.sub} onChange={e => setCatSelection({ ...catSelection, sub: e.target.value })}>
                                            <option value="">Genel</option>
                                            {categories.filter(c => (c.parent?._id || c.parent) === catSelection.main).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={s.inputRow}>
                                    <div style={{flex:1}}>
                                        <label style={s.label}>FİYAT (TL)</label>
                                        <input style={s.input} type="number" value={editMode.price} onChange={e => setEditMode({...editMode, price: e.target.value})} />
                                    </div>
                                    <div style={{flex:1}}>
                                        <label style={s.label}>STOK ADEDİ</label>
                                        <input style={s.input} type="number" value={editMode.stock} onChange={e => setEditMode({...editMode, stock: e.target.value})} />
                                    </div>
                                </div>
                                
                                <button onClick={() => handleSave(false)} style={s.btnPrimary}>DEĞİŞİKLİKLERİ KAYDET</button>
                            </div>

                            <div style={{...s.modalCol, borderLeft:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9', background:'#fafafa'}}>
                                <div style={s.sectionHeader}>
                                    <span style={s.sectionStep}>2</span>
                                    <h4>Uyumlu Araçlar</h4>
                                </div>
                                <div style={s.poolContainer}>
                                    {editPool.map(c => (
                                        <div key={c._id} style={s.poolItem}>
                                            <div>
                                                <div style={s.poolText}>{getCarBrandName(c)} {c.model}</div>
                                                <div style={s.poolSubText}>{c.bodyType} • {c.engine}</div>
                                            </div>
                                            <span onClick={() => setEditPool(editPool.filter(i => (i._id || i) !== c._id))} style={s.poolDel}>✕</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={s.addToolBox}>
                                    <select style={s.select} value={newSelection.brand} onChange={e => setNewSelection({brand: e.target.value, model: '', carId: ''})}>
                                        <option value="">Marka Seç</option>
                                        {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                    </select>
                                    <select style={s.select} disabled={!newSelection.brand} value={newSelection.model} onChange={e => setNewSelection({...newSelection, model: e.target.value, carId: ''})}>
                                        <option value="">Model Seç</option>
                                        {[...new Set(cars.filter(c => (c.brand?.name || c.brand) === newSelection.brand).map(c => c.model))].map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select style={s.select} disabled={!newSelection.model} value={newSelection.carId} onChange={e => setNewSelection({...newSelection, carId: e.target.value})}>
                                        <option value="">Kasa & Motor</option>
                                        {cars.filter(c => (c.brand?.name || c.brand) === newSelection.brand && c.model === newSelection.model).map(c => (
                                            <option key={c._id} value={c._id}>{c.bodyType} | {c.engine}</option>
                                        ))}
                                    </select>
                                    <button onClick={addToPool} style={s.btnSuccess}>ARACI HAVUZA EKLE</button>
                                </div>
                            </div>

                            <div style={s.modalCol}>
                                <div style={s.sectionHeader}>
                                    <span style={{...s.sectionStep, background:'#0891b2'}}>3</span>
                                    <h4>Varyasyon Ekle</h4>
                                </div>
                                
                                <div style={s.variantForm}>
                                    <label style={s.label}>VARYANT MARKASI</label>
                                    <select style={s.select} value={variantData.brand} onChange={e => setVariantData({...variantData, brand: e.target.value})}>
                                        <option value="">Marka Seçiniz...</option>
                                        {availablePartBrands.map(pb => <option key={pb._id} value={pb._id}>{pb.name}</option>)}
                                    </select>

                                    <div style={s.inputRow}>
                                        <div style={{flex:1}}>
                                            <label style={s.label}>FİYAT (TL)</label>
                                            <input style={s.input} type="number" value={variantData.price} onChange={e => setVariantData({...variantData, price: e.target.value})} />
                                        </div>
                                        <div style={{flex:1}}>
                                            <label style={s.label}>STOK (ADET)</label>
                                            <input style={s.input} type="number" value={variantData.stock} onChange={e => setVariantData({...variantData, stock: e.target.value})} />
                                        </div>
                                    </div>

                                    <label style={s.label}>GÖRSEL URL</label>
                                    <input style={s.input} placeholder="https://..." value={variantData.photo} onChange={e => setVariantData({...variantData, photo: e.target.value})} />

                                    <button onClick={() => handleSave(true)} style={s.btnCyan}>YENİ VARYANT OLUŞTUR</button>
                                </div>

                                <div style={s.existingVariantsBox}>
                                    <label style={s.label}>MEVCUT VARYANTLAR ({existingVariants.length})</label>
                                    {existingVariants.map(v => (
                                        <div key={v._id} style={s.vCard}>
                                            <img src={v.brand?.logo} style={s.vLogo} alt=""/>
                                            <div style={{flex:1}}>
                                                <div style={s.vName}>{v.brand?.name}</div>
                                                <div style={s.vPrice}>{v.price} TL | Stok: {v.stock || 0}</div>
                                            </div>
                                            <button onClick={() => handleDelete(v._id)} style={s.vDel}>🗑️</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- EKLENEN VE GÜNCELLENEN STİLLER ---
const s = {
    container: { padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' },
    loading: { padding: '100px', textAlign: 'center', fontSize: '18px', color: '#64748b' },
    headerCard: { marginBottom: '25px' },
    searchRow: { display: 'flex', gap: '15px', alignItems: 'center' }, // Yeni
    searchWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: '15px', color: '#94a3b8', zIndex: 1 },
    mainInput: { width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', outline: 'none' },
    tableCard: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { background: '#f1f5f9' },
    th: { padding: '15px 20px', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
    td: { padding: '15px 20px', color: '#1e293b', fontSize: '14px' },
    img: { width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', background: '#f1f5f9' },
    oemGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    oemBadge: { width: 'fit-content', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' },
    partName: { fontWeight: '600', color: '#1e293b' },
    brandBadge: { background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
    priceText: { fontWeight: '700', color: '#0f172a' },
    actionBtns: { display: 'flex', gap: '8px', justifyContent: 'center' },
    btnEditMini: { border: '1px solid #e2e8f0', background: '#fff', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' },
    btnDelMini: { border: '1px solid #fee2e2', background: '#fff1f1', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' },

    // PAGINATION STİLLERİ
    pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderTop: '1px solid #f1f5f9' },
    pageNumbers: { display: 'flex', gap: '5px' },
    pageBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
    pageNumber: { width: '35px', height: '35px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' },

    // MODAL STİLLERİ
    overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
    modal: { background: '#fff', width: '100%', maxWidth: '1400px', borderRadius: '24px', display: 'flex', flexDirection: 'column', maxHeight: '95vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
    modalHeader: { padding: '20px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 },
    modalSub: { fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' },
    modalHeaderActions: { display: 'flex', gap: '15px', alignItems: 'center' },
    btnClose: { background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '18px' },
    modalBody: { display: 'flex', flex: 1, overflow: 'hidden' },
    modalCol: { flex: 1, padding: '25px', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
    sectionStep: { background: '#4f46e5', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' },
    label: { fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '14px', outline: 'none' },
    select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '14px', background: '#fff' },
    inputRow: { display: 'flex', gap: '12px' },
    imageUploadCard: { background: '#f8fafc', padding: '15px', borderRadius: '15px', border: '2px dashed #e2e8f0', marginBottom: '20px', textAlign: 'center' },
    previewImg: { height: '120px', objectFit: 'contain', marginBottom: '15px' },
    poolContainer: { flex: 1, background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '10px', overflowY: 'auto', marginBottom: '15px' },
    poolItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: '#f1f5f9', marginBottom: '8px' },
    poolText: { fontSize: '13px', fontWeight: '600' },
    poolSubText: { fontSize: '11px', color: '#64748b' },
    poolDel: { color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', padding: '5px' },
    btnPrimary: { background: '#4f46e5', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' },
    btnSuccess: { background: '#10b981', color: '#fff', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer' },
    btnCyan: { background: '#0891b2', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' },
    btnDangerOutline: { background: 'transparent', color: '#ef4444', border: '1px solid #fee2e2', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    existingVariantsBox: { marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' },
    vCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '10px' },
    vLogo: { width: '24px', height: '24px', borderRadius: '4px' },
    vName: { fontSize: '13px', fontWeight: '600' },
    vPrice: { fontSize: '12px', color: '#10b981', fontWeight: '700' },
    vDel: { background: 'none', border: 'none', cursor: 'pointer', filter: 'grayscale(1)' }
};

export default FilterTable;