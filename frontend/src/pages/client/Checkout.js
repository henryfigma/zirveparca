import React, { useState, useEffect } from 'react';
import API from '../../api';
import NavBar from '../../components/NavBar';
import { 
    FaMapMarkerAlt, FaCheckCircle, FaCreditCard, 
    FaUniversity, FaTruck, FaStore, FaPlus, FaTimes, FaLock, FaInfoCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Checkout = () => {
    const [step, setStep] = useState(1);
    const [cart, setCart] = useState({ items: [] });
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddrModal, setShowAddrModal] = useState(false);

    // Seçimler
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [deliveryMethod, setDeliveryMethod] = useState('cargo'); 
    const [paymentType, setPaymentType] = useState(null); 
    const [isAgreed, setIsAgreed] = useState(false);
    const [isPaidTransfer, setIsPaidTransfer] = useState(false); // Havale onayı
    const [orderNo, setOrderNo] = useState(null);

    // Kart & Adres State
    const [cardData, setCardData] = useState({ holder: '', number: '', expMonth: '', expYear: '', cvc: '' });
    const [newAddr, setNewAddr] = useState({ title: '', detail: '' });

    useEffect(() => { fetchInitialData(); }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [cartRes, userRes] = await Promise.all([
                API.get('/cart'),
                API.get('/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setCart(cartRes.data || { items: [] });
            setAddresses(userRes.data.addresses || []);
        } catch (err) { console.error("Veri yükleme hatası"); }
        finally { setLoading(false); }
    };

    // Kart Numarası Formatlama (4 hanede bir boşluk)
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        if (value.length <= 16) {
            setCardData({ ...cardData, number: formattedValue });
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await API.post('/auth/address', newAddr, { headers: { Authorization: `Bearer ${token}` } });
            setAddresses(res.data.addresses);
            setShowAddrModal(false);
            setNewAddr({ title: '', detail: '' });
        } catch (err) { alert("Adres eklenemedi."); }
    };

    const calculateTotal = () => cart?.items?.reduce((acc, item) => acc + (item.priceAtAdd * item.quantity), 0) || 0;

    const handleFinalSubmit = async () => {
        if (!isAgreed) return alert("Lütfen sözleşmeyi onaylayınız.");
        if (paymentType === 'transfer' && !isPaidTransfer) return alert("Lütfen havale ödemesini yaptığınızı onaylayın.");
        
        try {
            const token = localStorage.getItem('token');
            const orderData = {
                items: cart.items,
                totalAmount: calculateTotal(),
                address: addresses.find(a => a._id === selectedAddress),
                deliveryMethod,
                paymentMethod: paymentType,
                status: paymentType === 'transfer' ? 'Ödeme Onayı Bekliyor' : 'Hazırlanıyor',
                currentStep: paymentType === 'transfer' ? 1 : 2 
            };

            await API.post('/orders', orderData, { headers: { Authorization: `Bearer ${token}` } });
            await API.delete('/cart', { headers: { Authorization: `Bearer ${token}` } });

            setOrderNo("ZO-" + Math.random().toString(36).substr(2, 7).toUpperCase());
            setStep(5);
        } catch (err) {
            alert("Sipariş işlenirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
        }
    };

    const ProgressBar = () => (
        <div style={s.progressWrapper}>
            {[ {id:1, n:'Adres'}, {id:2, n:'Teslimat'}, {id:3, n:'Ödeme'}, {id:4, n:'Onay'} ].map((i, index) => (
                <React.Fragment key={i.id}>
                    <div style={{...s.stepItem, color: step >= i.id ? '#4834d4' : '#b2bec3'}}>
                        <div style={{...s.stepCircle, background: step >= i.id ? '#4834d4' : '#fff', border: step >= i.id ? '2px solid #4834d4' : '2px solid #dfe6e9'}}>
                            {step > i.id ? <FaCheckCircle size={18} /> : <span>{i.id}</span>}
                        </div>
                        <span style={s.stepName}>{i.n}</span>
                    </div>
                    {index < 3 && <div style={{...s.stepLine, background: step > i.id ? '#4834d4' : '#dfe6e9'}} />}
                </React.Fragment>
            ))}
        </div>
    );

    if (step === 5) return (
        <div style={s.successCard}>
            <div style={s.successIcon}><FaCheckCircle size={70} color="#2ecc71" /></div>
            <h2 style={{margin:'15px 0', fontWeight:'900'}}>Siparişiniz Alındı!</h2>
            <p style={{color:'#636e72'}}>Siparişiniz başarıyla tamamlandı. Sipariş numaranız:</p>
            <div style={s.successInfo}><strong>{orderNo}</strong></div>
            <Link to="/orders" style={s.primaryBtn}>SİPARİŞLERİME GİT</Link>
        </div>
    );

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', paddingBottom:'50px' }}>
            <NavBar />
            <div style={s.container}>
                <ProgressBar />
                <div style={s.layout}>
                    <div style={s.mainSection}>
                        {step === 1 && (
                            <div className="fade-in">
                                <div style={s.headerRow}><h3 style={s.secTitle}>Adres Seçimi</h3><button onClick={() => setShowAddrModal(true)} style={s.outlineBtn}><FaPlus /> Yeni Ekle</button></div>
                                <div style={s.addressGrid}>
                                    {addresses.map(addr => (
                                        <div key={addr._id} onClick={() => setSelectedAddress(addr._id)}
                                            style={{...s.addressCard, border: selectedAddress === addr._id ? '2px solid #4834d4' : '1px solid #dfe6e9', background: selectedAddress === addr._id ? '#f0f0ff' : '#fff'}}>
                                            <div style={s.addrHeader}><FaMapMarkerAlt color={selectedAddress === addr._id ? '#4834d4' : '#b2bec3'} /> <strong>{addr.title}</strong></div>
                                            <p style={s.addrText}>{addr.detail}</p>
                                        </div>
                                    ))}
                                </div>
                                <button disabled={!selectedAddress} onClick={() => setStep(2)} style={s.primaryBtn}>DEVAM ET</button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="fade-in">
                                <h3 style={s.secTitle}>Teslimat Seçenekleri</h3>
                                <div style={s.optionGrid}>
                                    <div onClick={() => setDeliveryMethod('cargo')} style={{...s.optionCard, border: deliveryMethod === 'cargo' ? '2px solid #4834d4' : '1px solid #dfe6e9'}}>
                                        <FaTruck size={30} color={deliveryMethod === 'cargo' ? '#4834d4' : '#636e72'} />
                                        <div style={s.optionInfo}><strong>Kargo</strong><span>Adresinize teslimat</span></div>
                                    </div>
                                    <div onClick={() => setDeliveryMethod('store')} style={{...s.optionCard, border: deliveryMethod === 'store' ? '2px solid #4834d4' : '1px solid #dfe6e9'}}>
                                        <FaStore size={30} color={deliveryMethod === 'store' ? '#4834d4' : '#636e72'} />
                                        <div style={s.optionInfo}><strong>Mağazadan Teslim</strong><span>Hemen teslim alın</span></div>
                                    </div>
                                </div>
                                <div style={s.actionRow}><button onClick={() => setStep(1)} style={s.textBtn}>Geri Dön</button><button onClick={() => setStep(3)} style={s.primaryBtn}>DEVAM ET</button></div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="fade-in">
                                <h3 style={s.secTitle}>Ödeme Şekli</h3>
                                <div style={s.optionGrid}>
                                    <div onClick={() => setPaymentType('card')} style={{...s.optionCard, border: paymentType === 'card' ? '2px solid #4834d4' : '1px solid #dfe6e9'}}>
                                        <FaCreditCard size={30} color={paymentType === 'card' ? '#4834d4' : '#636e72'} />
                                        <div style={s.optionInfo}><strong>Kredi / Banka Kartı</strong></div>
                                    </div>
                                    <div onClick={() => setPaymentType('transfer')} style={{...s.optionCard, border: paymentType === 'transfer' ? '2px solid #4834d4' : '1px solid #dfe6e9'}}>
                                        <FaUniversity size={30} color={paymentType === 'transfer' ? '#4834d4' : '#636e72'} />
                                        <div style={s.optionInfo}><strong>Havale / EFT</strong></div>
                                    </div>
                                </div>
                                <div style={s.actionRow}><button onClick={() => setStep(2)} style={s.textBtn}>Geri Dön</button><button disabled={!paymentType} onClick={() => setStep(4)} style={s.primaryBtn}>DEVAM ET</button></div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="fade-in">
                                {paymentType === 'card' ? (
                                    <div style={s.paymentWrapper}>
                                        {/* Kredi Kartı Önizleme */}
                                        <div style={s.cardPreview}>
                                            <div style={{fontSize:'22px', marginBottom:'30px', letterSpacing:'3px'}}>{cardData.number || '**** **** **** ****'}</div>
                                            <div style={{display:'flex', justifyContent:'space-between'}}>
                                                <div><div style={{fontSize:'10px', opacity:0.7}}>KART SAHİBİ</div><div style={{fontSize:'14px'}}>{cardData.holder.toUpperCase() || 'AD SOYAD'}</div></div>
                                                <div><div style={{fontSize:'10px', opacity:0.7}}>TARİH</div><div style={{fontSize:'14px'}}>{cardData.expMonth || 'MM'}/{cardData.expYear || 'YY'}</div></div>
                                            </div>
                                        </div>
                                        <div style={s.paymentForm}>
                                            <div style={s.formHeader}><FaLock /> Güvenli Ödeme</div>
                                            <input placeholder="Kart Sahibi" onChange={e => setCardData({...cardData, holder: e.target.value})} style={s.inputFull}/>
                                            <input placeholder="Kart Numarası" value={cardData.number} onChange={handleCardNumberChange} style={s.inputFull}/>
                                            <div style={s.row}>
                                                <select onChange={e => setCardData({...cardData, expMonth: e.target.value})} style={s.select}>
                                                    <option value="">Ay</option>
                                                    {Array.from({length:12}, (_,i)=> <option key={i+1} value={String(i+1).padStart(2,'0')}>{String(i+1).padStart(2,'0')}</option>)}
                                                </select>
                                                <select onChange={e => setCardData({...cardData, expYear: e.target.value})} style={s.select}>
                                                    <option value="">Yıl</option>
                                                    {[26,27,28,29,30,31].map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                                <input placeholder="CVC" maxLength="3" onChange={e => setCardData({...cardData, cvc: e.target.value.replace(/\D/g,'')})} style={{...s.inputFull, width:'80px', marginBottom:0}}/>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={s.transferWrapper}>
                                        <div style={s.transferBox}>
                                            <div style={{display:'flex', gap:'10px', marginBottom:'15px', color:'#4834d4'}}><FaInfoCircle /> <strong>Hesap Bilgileri</strong></div>
                                            <p><strong>Banka:</strong> X Bankası</p>
                                            <p><strong>Alıcı:</strong> Yedek Parça Ltd. Şti.</p>
                                            <p><strong>IBAN:</strong> TR12 3456 7890 1234 5678 9012 34</p>
                                        </div>
                                        <label style={s.paidCheck}>
                                            <input type="checkbox" checked={isPaidTransfer} onChange={e => setIsPaidTransfer(e.target.checked)} />
                                            <span>Ödemeyi yaptım, onaylıyorum.</span>
                                        </label>
                                    </div>
                                )}
                                <div style={s.agreementSection}>
                                    <label style={s.checkLabel}><input type="checkbox" checked={isAgreed} onChange={e => setIsAgreed(e.target.checked)} /> Mesafeli Satış Sözleşmesini kabul ediyorum.</label>
                                </div>
                                <div style={s.actionRow}><button onClick={() => setStep(3)} style={s.textBtn}>Geri Dön</button><button onClick={handleFinalSubmit} style={s.confirmBtn}>SİPARİŞİ ONAYLA</button></div>
                            </div>
                        )}
                    </div>

                    <div style={s.sidebar}>
                        <div style={s.summaryCard}>
                            <h4 style={{marginBottom:'15px'}}>Sipariş Özeti</h4>
                            {cart.items.map(item => (
                                <div key={item._id} style={s.itemRow}>
                                    <span>{item.part?.name} <small>(x{item.quantity})</small></span>
                                    <strong>{(item.priceAtAdd * item.quantity).toLocaleString()} TL</strong>
                                </div>
                            ))}
                            <div style={s.divider} />
                            <div style={s.grandTotal}><span>Toplam</span><span>{calculateTotal().toLocaleString()} TL</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {showAddrModal && (
                <div style={s.modalOverlay}>
                    <div style={s.modal}>
                        <div style={s.modalHeader}><h3>Yeni Adres</h3><FaTimes onClick={()=>setShowAddrModal(false)} /></div>
                        <form onSubmit={handleAddAddress}>
                            <input placeholder="Başlık (Ev, İş)" required onChange={e=>setNewAddr({...newAddr, title:e.target.value})} style={s.inputFull}/>
                            <textarea placeholder="Adres" required onChange={e=>setNewAddr({...newAddr, detail:e.target.value})} style={{...s.inputFull, height:'100px', resize:'none'}} />
                            <button type="submit" style={s.primaryBtn}>KAYDET</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const s = {
    container: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px' },
    progressWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' },
    stepItem: { display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' },
    stepCircle: { width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'bold' },
    stepName: { fontSize:'12px', fontWeight:'600' },
    stepLine: { height:'2px', width:'60px', margin:'0 -5px 15px -5px' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' },
    mainSection: { background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    sidebar: { position: 'sticky', top: '20px' },
    summaryCard: { background: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    secTitle: { fontSize:'22px', fontWeight:'800', marginBottom:'20px' },
    headerRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
    addressGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'25px' },
    addressCard: { padding:'15px', borderRadius:'12px', cursor:'pointer', transition:'0.2s' },
    addrHeader: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px' },
    addrText: { fontSize:'12px', color:'#636e72' },
    optionGrid: { display:'grid', gridTemplateColumns:'1fr', gap:'12px', marginBottom:'25px' },
    optionCard: { padding:'15px', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'15px' },
    optionInfo: { display:'flex', flexDirection:'column' },
    primaryBtn: { width:'100%', padding:'14px', background:'#4834d4', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer' },
    outlineBtn: { padding:'8px 12px', border:'1px solid #4834d4', color:'#4834d4', background:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer' },
    textBtn: { background:'none', border:'none', color:'#b2bec3', cursor:'pointer', fontWeight:'bold' },
    actionRow: { display:'flex', justifyContent:'space-between', marginTop:'20px' },
    inputFull: { width:'100%', padding:'12px', border:'1px solid #dfe6e9', borderRadius:'8px', marginBottom:'12px' },
    select: { flex:1, padding:'12px', border:'1px solid #dfe6e9', borderRadius:'8px', marginRight:'8px' },
    row: { display:'flex', marginBottom:'12px' },
    paymentWrapper: { display:'flex', flexDirection:'column', gap:'20px' },
    cardPreview: { background:'linear-gradient(135deg, #4834d4, #686de0)', color:'#fff', padding:'30px', borderRadius:'16px', boxShadow:'0 10px 20px rgba(72, 52, 212, 0.3)' },
    paymentForm: { background:'#f9f9f9', padding:'20px', borderRadius:'12px' },
    formHeader: { marginBottom:'15px', fontSize:'14px', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px' },
    transferWrapper: { display:'flex', flexDirection:'column', gap:'15px' },
    transferBox: { padding:'20px', background:'#f0f0ff', border:'1px solid #4834d4', borderRadius:'12px' },
    paidCheck: { display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', color:'#4834d4', fontWeight:'bold', cursor:'pointer' },
    agreementSection: { margin:'20px 0' },
    checkLabel: { display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer' },
    confirmBtn: { flex:1, padding:'14px', background:'#2ecc71', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer' },
    itemRow: { display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'5px' },
    divider: { height:'1px', background:'#f1f1f1', margin:'15px 0' },
    grandTotal: { display:'flex', justifyContent:'space-between', fontSize:'18px', fontWeight:'bold', color:'#4834d4' },
    modalOverlay: { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
    modal: { background:'#fff', padding:'30px', borderRadius:'20px', width:'400px' },
    modalHeader: { display:'flex', justifyContent:'space-between', marginBottom:'20px' },
    successCard: { textAlign:'center', padding:'60px', maxWidth:'500px', margin:'100px auto', background:'#fff', borderRadius:'25px', boxShadow:'0 10px 30px rgba(0,0,0,0.05)' },
    successInfo: { background:'#f0f0ff', padding:'10px', borderRadius:'10px', margin:'20px 0', fontSize:'18px', fontWeight:'bold', color:'#4834d4' }
};

export default Checkout;