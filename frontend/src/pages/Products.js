import React, { useState, useEffect } from 'react';
import API from '../api';

const Products = () => {
    const [allParts, setAllParts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [partBrands, setPartBrands] = useState([]);
    const [allCars, setAllCars] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    
    const [step, setStep] = useState('brand'); 
    const [selection, setSelection] = useState({ 
        brand: '', 
        model: '', 
        bodyStyle: '', 
        engine: '', 
        engineId: '', 
        category: '', 
        subCategory: '' 
    });
    
    const [selectedPart, setSelectedPart] = useState(null); 
    const [oemGroup, setOemGroup] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [editMode, setEditMode] = useState(null);
    const [editPool, setEditPool] = useState([]); 
    const [variantData, setVariantData] = useState({ brand: '', price: '', stock: 0, photo: '' });
    const [newSelection, setNewSelection] = useState({ brand: '', model: '' });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [bRes, cRes, pRes, pbRes, catRes] = await Promise.all([
                API.get('/brands'), API.get('/cars'), API.get('/parts'), 
                API.get('/part-brands'), API.get('/categories')
            ]);
            setBrands(bRes.data);
            setAllCars(cRes.data);
            setAllParts(pRes.data);
            setPartBrands(pbRes.data);
            setDbCategories(catRes.data);
        } catch (err) { console.error("Veri yüklenemedi", err); }
    };

    const checkBrandMatch = (carBrand, selectedBrandName) => {
        if (!carBrand) return false;
        const brandName = typeof carBrand === 'object' ? carBrand.name : carBrand;
        return brandName === selectedBrandName;
    };

    const getActiveCategories = () => {
        const partsForThisCar = allParts.filter(p => 
            p.compatibleCars?.some(car => (car._id || car).toString() === selection.engineId?.toString())
        );
        const categoryIdsWithParts = partsForThisCar.map(p => (p.category?._id || p.category)?.toString());

        if (!selection.category) {
            return dbCategories.filter(cat => {
                if (cat.parent) return false;
                const catIdStr = cat._id.toString();
                return categoryIdsWithParts.includes(catIdStr) || 
                       dbCategories.some(sub => (sub.parent?._id || sub.parent)?.toString() === catIdStr && categoryIdsWithParts.includes(sub._id.toString()));
            });
        } else {
            return dbCategories.filter(cat => (cat.parent?._id || cat.parent)?.toString() === selection.category.toString() && categoryIdsWithParts.includes(cat._id.toString()));
        }
    };

    const filteredParts = allParts.filter(p => {
        if (searchTerm) return p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.oem?.includes(searchTerm);
        if (!selection.engineId || !selection.category) return false;
        const isCompatible = p.compatibleCars?.some(car => (car._id || car).toString() === selection.engineId?.toString());
        if (!isCompatible) return false;
        const partCatId = (p.category?._id || p.category)?.toString();
        const selectedCatId = selection.category.toString();
        const selectedSubCatId = selection.subCategory?.toString();
        if (selectedSubCatId) return partCatId === selectedSubCatId;
        const categoryObj = dbCategories.find(c => c._id.toString() === partCatId);
        return partCatId === selectedCatId || (categoryObj?.parent?._id || categoryObj?.parent)?.toString() === selectedCatId;
    });

    const handlePartClick = (part) => {
        const group = allParts.filter(p => p.oem === part.oem);
        setOemGroup(group);
        setSelectedPart(part);
    };

    const handleCategoryClick = (cat) => {
        const hasChildren = dbCategories.some(c => (c.parent?._id || c.parent)?.toString() === cat._id.toString());
        if (hasChildren) {
            setSelection({ ...selection, category: cat._id });
        } else {
            if (!selection.category) setSelection({ ...selection, category: cat._id, subCategory: '' });
            else setSelection({ ...selection, subCategory: cat._id });
            setStep('parts');
        }
    };

    const startEdit = (p) => {
        const currentCat = dbCategories.find(c => c._id === (p.category?._id || p.category));
        const parentId = currentCat?.parent?._id || currentCat?.parent || (currentCat ? currentCat._id : '');
        const subId = currentCat?.parent ? currentCat._id : '';

        setEditMode({ 
            ...p, 
            brand: p.brand?._id || p.brand, 
            oem: p.oem || '',
            mainCategory: parentId,
            category: subId || parentId,
            stock: p.stock || 0
        });
        setEditPool(p.compatibleCars || []);
        setVariantData({ brand: '', price: p.price, stock: p.stock || 0, photo: p.photo });
    };

    const handleSave = async (isNew = false) => {
        try {
            const commonData = { compatibleCars: editPool.map(c => c._id || c) };
            if (isNew) {
                await API.post('/parts', { ...editMode, ...commonData, _id: undefined, brand: variantData.brand, price: Number(variantData.price), stock: Number(variantData.stock), photo: variantData.photo });
                alert("Varyant eklendi.");
            } else {
                await API.put(`/parts/${editMode._id}`, { ...editMode, ...commonData, price: Number(editMode.price), stock: Number(editMode.stock) });
                alert("Güncellendi.");
            }
            setEditMode(null);
            loadData();
        } catch (err) { alert("Hata oluştu!"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        try {
            await API.delete(`/parts/${id}`);
            setEditMode(null);
            setSelectedPart(null);
            loadData();
        } catch (err) { alert("Hata oluştu."); }
    };

    const existingVariants = allParts.filter(p => p.oem === editMode?.oem);

    return (
        <div style={s.container}>
            {/* ÜST PANEL */}
            <div style={s.headerSticky}>
                <input 
                    type="text" 
                    placeholder="Hızlı Ara (OEM/Parça)..." 
                    value={searchTerm} 
                    onChange={(e) => { 
                        setSearchTerm(e.target.value); 
                        setStep(e.target.value ? 'parts' : 'brand'); 
                    }} 
                    style={s.searchInput} 
                />
                <div style={s.navigation}>
                    {(step !== 'brand' || selectedPart) && <button onClick={() => {
                        if (selectedPart) setSelectedPart(null);
                        else if (step === 'parts') setStep('category');
                        else if (step === 'category') {
                            if (selection.subCategory) { setSelection({...selection, subCategory: ''}); setStep('category'); }
                            else if (selection.category) setSelection({...selection, category: ''});
                            else setStep('engine');
                        }
                        else if (step === 'engine') setStep('bodyStyle');
                        else if (step === 'bodyStyle') setStep('model');
                        else setStep('brand');
                    }} style={s.backBtn}>⬅ Geri</button>}
                    <h3 style={{margin:0}}>
                        {selection.brand} {selection.model} {selection.bodyStyle && `| ${selection.bodyStyle}`} {selection.engine && `| ${selection.engine}`}
                    </h3>
                </div>
            </div>

            {/* ANA İÇERİK */}
            <div style={s.contentArea}>
                {selectedPart ? (
                    <div key="detail-view" style={s.detailCard}>
                        <div style={s.detailGallery}>
                            <img src={selectedPart.photo} style={s.detailImg} alt="" />
                            <div style={s.oemFloatingBadge}>OEM: {selectedPart.oem}</div>
                        </div>
                        <div style={s.detailInfo}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <h1 style={s.detailTitle}>{selectedPart.name}</h1>
                                <div style={{display:'flex', gap: '10px'}}>
                                    <button onClick={() => startEdit(selectedPart)} style={s.btnEditLarge}>✏️ Düzenle</button>
                                    <button onClick={() => handleDelete(selectedPart._id)} style={s.btnDeleteLarge}>🗑️ Sil</button>
                                </div>
                            </div>
                            <div style={s.mainPriceTag}>{selectedPart.price} TL</div>
                            <div style={{marginBottom: '10px', color: '#64748b', fontSize: '14px'}}>
                                <strong>Stok:</strong> {selectedPart.stock || 0} Adet
                            </div>
                            <div style={s.brandSelectionWrapper}>
                                <p style={s.sectionLabel}>DİĞER ÜRETİCİ SEÇENEKLERİ</p>
                                <div style={s.oemMarkaListesi}>
                                    {oemGroup.map(p => (
                                        <div key={`oem-${p._id}`} onClick={() => setSelectedPart(p)} style={{...s.oemMarkaSatir, borderColor: selectedPart._id === p._id ? '#3498db' : '#eee', background: selectedPart._id === p._id ? '#f0f7ff' : '#fff'}}>
                                            <img src={p.brand?.logo} style={s.oemMarkaLogo} alt="" />
                                            <div style={{flex:1, fontWeight:'bold'}}>{p.brand?.name} <span style={{fontSize:'10px', color:'#777'}}>(Stok: {p.stock || 0})</span></div>
                                            <div style={{fontWeight:'800'}}>{p.price} TL</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div key="grid-view" style={s.mainGrid}>
                        {/* 1. ADIM: MARKA */}
                        {step === 'brand' && brands.map(b => (
                            <div key={`brand-${b._id}`} onClick={() => { setSelection({brand: b.name}); setStep('model'); }} style={s.card}>
                                <img src={b.logo} style={s.brandLogo} alt="" />
                                <strong>{b.name}</strong>
                            </div>
                        ))}

                        {/* 2. ADIM: MODEL */}
                        {step === 'model' && Array.from(new Set(allCars.filter(c => checkBrandMatch(c.brand, selection.brand)).map(c => c.model))).map((m, idx) => (
                            <div key={`model-${m}-${idx}`} onClick={() => { setSelection({...selection, model: m}); setStep('bodyStyle'); }} style={s.card}>
                                <img src={allCars.find(c => c.model === m)?.modelPhoto || 'https://via.placeholder.com/150'} style={s.modelImg} alt="" />
                                <span style={{marginTop:'10px', fontWeight:'bold'}}>{m}</span>
                            </div>
                        ))}

                        {/* 3. ADIM: GÖVDE TİPİ (İstediğin Görsel Ayrımı Burası) */}
                        {step === 'bodyStyle' && Array.from(new Set(allCars
                            .filter(c => checkBrandMatch(c.brand, selection.brand) && c.model === selection.model)
                            .map(c => c.bodyStyle))).map((bs, idx) => {
                                const bodyPhoto = allCars.find(c => checkBrandMatch(c.brand, selection.brand) && c.model === selection.model && c.bodyStyle === bs)?.modelPhoto;
                                return (
                                    <div key={`body-${bs}-${idx}`} onClick={() => { setSelection({...selection, bodyStyle: bs}); setStep('engine'); }} style={s.card}>
                                        <img src={bodyPhoto || 'https://via.placeholder.com/150'} style={s.modelImg} alt="" />
                                        <strong style={{marginTop:'10px'}}>{bs}</strong>
                                    </div>
                                );
                        })}

                        {/* 4. ADIM: MOTOR */}
                        {step === 'engine' && allCars.filter(c => checkBrandMatch(c.brand, selection.brand) && c.model === selection.model && c.bodyStyle === selection.bodyStyle).map(e => (
                            <div key={`eng-${e._id}`} onClick={() => { setSelection({...selection, engine: e.engine, engineId: e._id}); setStep('category'); }} style={s.engineCard}>
                                <strong>{e.engine}</strong> 
                                <div style={{fontSize:'12px', marginTop:'5px'}}>
                                    <span>{e.hp} HP / {e.kw} KW</span> • <small>{e.years}</small>
                                </div>
                            </div>
                        ))}

                        {/* 5. ADIM: KATEGORİ */}
                        {step === 'category' && getActiveCategories().map(cat => (
                            <div key={`cat-${cat._id}`} onClick={() => handleCategoryClick(cat)} style={s.card}>
                                {cat.image ? <img src={cat.image} style={s.categoryImg} alt={cat.name} /> : <div style={{fontSize: '30px'}}>📦</div>}
                                <strong>{cat.name}</strong>
                            </div>
                        ))}

                        {/* 6. ADIM: PARÇALAR */}
                        {(step === 'parts' || searchTerm) && filteredParts.map(p => (
                            <div key={`part-${p._id}`} style={s.partCard} onClick={() => handlePartClick(p)}>
                                <div style={s.cardHeader}>
                                    <div style={s.brandBadgeDetay}>
                                        {p.brand?.logo ? <img src={p.brand.logo} style={s.miniLogo} alt="" /> : <span>📦</span>} 
                                        {p.brand?.name}
                                    </div>
                                    <div style={{display:'flex', gap:'5px'}}>
                                        <button onClick={(e) => { e.stopPropagation(); startEdit(p); }} style={s.btnMini}>✏️</button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }} style={s.btnMiniDel}>🗑️</button>
                                    </div>
                                </div>
                                <img src={p.photo} style={s.partImg} alt="" />
                                <div style={s.partInfo}>
                                    <small>OEM: {p.oem} | Stok: {p.stock || 0}</small>
                                    <strong style={s.partTitle}>{p.name}</strong>
                                    <div style={s.priceTag}>{p.price} TL</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL PORTAL */}
            {editMode && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <div style={s.modalHeader}>
                            <div>
                                <h2 style={s.modalTitle}>Ürün Düzenleme</h2>
                                <p style={s.modalSub}>ID: {editMode._id}</p>
                            </div>
                            <button onClick={() => setEditMode(null)} style={s.btnClose}>✕</button>
                        </div>
                        <div style={s.modalBody}>
                            <div style={s.modalCol}>
                                <div style={s.sectionHeader}><span style={s.sectionStep}>1</span><h4>Temel Bilgiler</h4></div>
                                <div style={s.imageUploadCard}>
                                    <img src={editMode.photo} style={s.previewImg} alt=""/>
                                    <input style={s.input} value={editMode.photo} onChange={e => setEditMode({...editMode, photo: e.target.value})} placeholder="Görsel URL" />
                                </div>
                                <label style={s.label}>OEM NUMARASI</label>
                                <input style={s.input} value={editMode.oem} onChange={e => setEditMode({...editMode, oem: e.target.value})} />
                                <label style={s.label}>PARÇA ADI</label>
                                <input style={s.input} value={editMode.name} onChange={e => setEditMode({...editMode, name: e.target.value})} />
                                <div style={{display:'flex', gap:'10px'}}>
                                    <div style={{flex:1}}>
                                        <label style={s.label}>ANA KATEGORİ</label>
                                        <select style={s.select} value={editMode.mainCategory} onChange={e => setEditMode({...editMode, mainCategory: e.target.value, category: e.target.value})}>
                                            <option value="">Seçiniz...</option>
                                            {dbCategories.filter(c => !c.parent).map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{flex:1}}>
                                        <label style={s.label}>ALT KATEGORİ</label>
                                        <select style={s.select} value={editMode.category === editMode.mainCategory ? '' : editMode.category} onChange={e => setEditMode({...editMode, category: e.target.value || editMode.mainCategory})}>
                                            <option value="">Yok</option>
                                            {dbCategories.filter(c => (c.parent?._id || c.parent) === editMode.mainCategory).map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button onClick={() => handleSave(false)} style={s.btnPrimary}>GÜNCELLE</button>
                            </div>

                            <div style={{...s.modalCol, borderLeft:'1px solid #f1f5f9', background:'#fafafa'}}>
                                <div style={s.sectionHeader}><span style={s.sectionStep}>2</span><h4>Uyumlu Araçlar</h4></div>
                                <div style={s.poolContainer}>
                                    {editPool.map((c, idx) => {
                                        const car = allCars.find(x => x._id === (c._id || c));
                                        return (
                                            <div key={`pool-${idx}`} style={s.poolItem}>
                                                <div>
                                                    <div style={s.poolText}>{car?.brand?.name || car?.brand} {car?.model}</div>
                                                    <div style={s.poolSubText}>{car?.bodyStyle} | {car?.engine}</div>
                                                </div>
                                                <span onClick={() => setEditPool(editPool.filter(i => (i._id || i) !== (c._id || c)))} style={s.poolDel}>✕</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <select style={s.select} value={newSelection.brand} onChange={e => setNewSelection({brand: e.target.value, model: ''})}>
                                    <option value="">Marka Seç</option>
                                    {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                </select>
                                <select style={s.select} disabled={!newSelection.brand} value={newSelection.model} onChange={e => setNewSelection({...newSelection, model: e.target.value})}>
                                    <option value="">Model Seç</option>
                                    {[...new Set(allCars.filter(c => (c.brand?.name || c.brand) === newSelection.brand).map(c => c.model))].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select style={s.select} disabled={!newSelection.model} onChange={e => {
                                    const car = allCars.find(x => x._id === e.target.value);
                                    if(car) { setEditPool([...editPool, car]); }
                                }}>
                                    <option value="">Motor / Kasa Ekle...</option>
                                    {allCars.filter(c => (c.brand?.name || c.brand) === newSelection.brand && c.model === newSelection.model).map(c => (
                                        <option key={c._id} value={c._id}>{c.bodyStyle} | {c.engine} ({c.years})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={s.modalCol}>
                                <div style={s.sectionHeader}><span style={{...s.sectionStep, background:'#0891b2'}}>3</span><h4>Varyasyon</h4></div>
                                <div style={s.variantForm}>
                                    <select style={s.select} value={variantData.brand} onChange={e => setVariantData({...variantData, brand: e.target.value})}>
                                        <option value="">Marka Seç...</option>
                                        {partBrands.map(pb => <option key={pb._id} value={pb._id}>{pb.name}</option>)}
                                    </select>
                                    <button onClick={() => handleSave(true)} style={s.btnCyan}>VARYANT EKLE</button>
                                </div>
                                {existingVariants.map(v => (
                                    <div key={`v-${v._id}`} style={s.vCard}>
                                        <img src={v.brand?.logo} style={s.vLogo} alt=""/>
                                        <div style={{flex:1}}>{v.brand?.name} - {v.price} TL</div>
                                        <button onClick={() => handleDelete(v._id)} style={s.vDel}>🗑️</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const s = {
    container: { padding: '20px', backgroundColor:'#f0f2f5', minHeight:'100vh', fontFamily:'"Inter", sans-serif' },
    headerSticky: { position:'sticky', top:0, background:'#f0f2f5', zIndex:10, paddingBottom:'20px' },
    searchInput: { width:'100%', padding:'15px', borderRadius:'12px', border:'1px solid #ddd', marginBottom:'15px' },
    navigation: { display:'flex', alignItems:'center', gap:'15px' },
    backBtn: { padding:'10px 20px', cursor:'pointer', borderRadius:'8px', border:'none', background:'#fff', fontWeight:'bold', boxShadow:'0 2px 4px rgba(0,0,0,0.1)' },
    mainGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'25px' },
    card: { background:'#fff', padding:'15px', borderRadius:'15px', textAlign:'center', cursor:'pointer', boxShadow:'0 4px 6px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', alignItems:'center' },
    brandLogo: { width:'100%', height:'60px', objectFit:'contain', marginBottom:'10px' },
    modelImg: { width:'100%', height:'140px', objectFit:'contain', borderRadius:'10px', background: '#f9f9f9' },
    categoryImg: { width: '100%', height: '100px', objectFit: 'contain' },
    engineCard: { background:'#fff', padding:'20px', borderRadius:'12px', cursor:'pointer', borderLeft:'6px solid #3498db' },
    partCard: { background:'#fff', borderRadius:'20px', overflow:'hidden', position:'relative', cursor:'pointer', boxShadow:'0 10px 20px rgba(0,0,0,0.05)' },
    cardHeader: { padding:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' },
    brandBadgeDetay: { display:'flex', alignItems:'center', gap:'6px', background:'#f8f9fa', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'bold' },
    miniLogo: { width:'20px', height:'20px', objectFit:'contain' },
    btnMini: { border:'none', background:'#f0f7ff', cursor:'pointer', padding:'5px', borderRadius:'5px' },
    btnMiniDel: { border:'none', background:'#fff1f1', cursor:'pointer', padding:'5px', borderRadius:'5px' },
    partImg: { width:'100%', height:'180px', objectFit:'contain', background:'#fff', padding:'10px' },
    partInfo: { padding:'15px', borderTop:'1px solid #f1f1f1' },
    partTitle: { fontSize:'14px', color:'#333', display:'block', marginBottom:'8px', height:'35px', overflow:'hidden' },
    priceTag: { fontSize:'20px', fontWeight:'800', color:'#2ecc71' },
    detailCard: { background:'#fff', padding:'30px', borderRadius:'25px', display:'flex', gap:'40px' },
    detailGallery: { flex: '0 0 300px', position:'relative' },
    detailImg: { width:'100%', height:'300px', objectFit:'contain', background:'#f9f9f9', borderRadius:'15px' },
    oemFloatingBadge: { position:'absolute', top:15, left:15, background:'#333', color:'#fff', padding:'6px 12px', borderRadius:'8px', fontSize:'11px' },
    detailInfo: { flex: 1 },
    detailTitle: { fontSize:'24px', margin:0 },
    btnEditLarge: { padding:'8px 15px', borderRadius:'10px', border:'1px solid #3498db', background:'#fff', color:'#3498db', cursor:'pointer' },
    btnDeleteLarge: { padding:'8px 15px', borderRadius:'10px', border:'1px solid #e74c3c', background:'#fff', color:'#e74c3c', cursor:'pointer' },
    mainPriceTag: { fontSize:'32px', fontWeight:'900', color:'#2ecc71', margin:'15px 0' },
    brandSelectionWrapper: { background:'#f8f9fa', padding:'15px', borderRadius:'15px' },
    sectionLabel: { fontSize:'10px', fontWeight:'bold', color:'#777' },
    oemMarkaListesi: { display:'flex', flexDirection:'column', gap:'8px', marginTop:'10px' },
    oemMarkaSatir: { display:'flex', alignItems:'center', gap:'12px', padding:'10px', borderRadius:'10px', border:'2px solid', cursor:'pointer' },
    oemMarkaLogo: { width:'25px', height:'25px', objectFit:'contain' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
    modal: { background: '#fff', width: '100%', maxWidth: '1250px', borderRadius: '24px', display: 'flex', flexDirection: 'column', maxHeight: '92vh', overflow:'hidden' },
    modalHeader: { padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '18px', fontWeight: '800', margin: 0 },
    modalSub: { fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' },
    btnClose: { background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' },
    modalBody: { display: 'flex', flex: 1, overflow: 'hidden' },
    modalCol: { flex: 1, padding: '25px', overflowY: 'auto' },
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
    sectionStep: { background: '#4f46e5', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', textAlign: 'center', fontSize: '12px', lineHeight: '22px', fontWeight: 'bold' },
    label: { fontSize: '10px', fontWeight: '700', color: '#64748b', display:'block', marginBottom:'5px' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' },
    select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' },
    imageUploadCard: { background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed #e2e8f0', textAlign: 'center', marginBottom: '15px' },
    previewImg: { height: '85px', objectFit: 'contain' },
    poolContainer: { background: '#fff', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', height:'250px', overflowY:'auto', marginBottom:'15px' },
    poolItem: { display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '8px', marginBottom: '6px' },
    poolText: { fontSize: '12px', fontWeight: '600' },
    poolSubText: { fontSize: '10px', color: '#64748b' },
    poolDel: { color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' },
    btnPrimary: { background: '#4f46e5', color: '#fff', padding: '12px', width: '100%', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    btnCyan: { background: '#0891b2', color: '#fff', padding: '12px', width: '100%', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    vCard: { display: 'flex', alignItems:'center', gap: '10px', padding: '10px', borderRadius: '10px', background: '#f8fafc', marginBottom: '8px' },
    vLogo: { width: '22px', height:'22px', objectFit:'contain' },
    vDel: { background: 'none', border: 'none', cursor: 'pointer', color:'#94a3b8' },
    variantForm: { background:'#fcfcfc', padding:'15px', borderRadius:'15px', border:'1px solid #f1f5f9', marginBottom:'20px' }
};

export default Products;