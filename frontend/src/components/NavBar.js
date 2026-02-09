import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCar, FaShoppingBasket, FaSearch, FaBox, FaCog, FaHome, FaPlus, FaMinus, FaCarSide } from 'react-icons/fa';
import API from '../api';

const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState({ items: [] });
    const [searchTerm, setSearchTerm] = useState(""); // Arama terimi için state
    const cartRef = useRef(null);

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchCart = async () => {
        if (!token) return;
        try {
            const res = await API.get('/cart');
            setCart(res.data || { items: [] });
        } catch (err) { console.error("Sepet çekilemedi"); }
    };

    // 🚀 OEM ARAMA FONKSİYONU
    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (searchTerm.trim()) {
                navigate(`/?search=${searchTerm.trim()}`);
            }
        }
    };

    // 🚀 LOGO TIKLANDIĞINDA REFRESH ETME
    const handleLogoClick = (e) => {
        e.preventDefault();
        navigate('/');
        window.location.reload(); // Sayfayı tamamen yeniler
    };

    const updateQtyMini = async (partId, change, currentQty) => {
        if (currentQty === 1 && change === -1) return;
        const previousCart = { ...cart };
        const updatedItems = cart.items.map(item => 
            item.part?._id === partId ? { ...item, quantity: item.quantity + change } : item
        );
        setCart({ ...cart, items: updatedItems });

        try {
            await API.post('/cart/add', { partId, quantity: change, price: 0 });
            window.dispatchEvent(new Event('cartUpdated')); 
        } catch (err) { setCart(previousCart); }
    };

    useEffect(() => {
        fetchCart();
        const handleCartUpdate = () => fetchCart();
        window.addEventListener('cartUpdated', handleCartUpdate);
        const handleClickOutside = (e) => {
            if (cartRef.current && !cartRef.current.contains(e.target)) setIsCartOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [token]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const calculateTotal = () => cart?.items?.reduce((acc, item) => acc + (item.priceAtAdd * item.quantity), 0) || 0;

    // 🚀 MİNİ SEPETTE DE GRUPLAMA YAPALIM (KARIŞIKLIK OLMASIN)
    const groupedItems = cart.items.reduce((acc, item) => {
        let carName = "GENEL";
        if (item.part?.car) {
            const brand = item.part.car.brand?.name || "";
            const model = item.part.car.model || "";
            if (brand || model) carName = `${brand} ${model}`.toUpperCase();
        }
        if (!acc[carName]) acc[carName] = [];
        acc[carName].push(item);
        return acc;
    }, {});

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                {/* LOGO GÜNCELLENDİ */}
                <Link to="/" onClick={handleLogoClick} style={styles.logo}>ZİRVE<span style={{color:'#0984e3'}}>OTOMOTİV</span></Link>
                
                <div style={styles.searchBox}>
                    <input 
                        type="text" 
                        placeholder="Parça veya OEM kodu..." 
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch} // Enter basınca arar
                    />
                    <button style={styles.searchBtn} onClick={handleSearch}><FaSearch /></button>
                </div>

                <div style={styles.menu}>
                    <Link to="/garage" style={styles.menuItem}><FaCar /> <span>Garajım</span></Link>
                    
                    {token ? (
                        <div style={styles.userWrapper} onMouseEnter={() => setIsMenuOpen(true)} onMouseLeave={() => setIsMenuOpen(false)}>
                            <div style={styles.menuItem}><FaUser /> <span>{user.fullName || 'Hesabım'}</span></div>
                            {isMenuOpen && (
                                <div style={styles.dropdown}>
                                    <Link to="/garage" style={styles.dropItem}><div style={styles.dropLead}><FaCar /> Araçlarım</div></Link>
                                    <Link to="/address" style={styles.dropItem}><div style={styles.dropLead}><FaHome /> Adreslerim</div></Link>
                                    <Link to="/orders" style={styles.dropItem}><div style={styles.dropLead}><FaBox /> Siparişlerim</div></Link>
                                    <Link to="/settings" style={styles.dropItem}><div style={styles.dropLead}><FaCog /> Ayarlar</div></Link>
                                    <div style={{...styles.dropItem, borderTop:'1px solid #eee', color:'red'}} onClick={handleLogout}>Çıkış yap</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" style={styles.menuItem}><FaUser /> <span>Giriş Yap</span></Link>
                    )}

                    <div style={{position:'relative'}} ref={cartRef}>
                        <div style={styles.menuItem} onClick={() => setIsCartOpen(!isCartOpen)}>
                            <div style={{position:'relative'}}>
                                <FaShoppingBasket />
                                {cart?.items?.length > 0 && <span style={styles.cartBadge}>{cart.items.length}</span>}
                            </div>
                            <span>Sepetim</span>
                        </div>

                        {isCartOpen && (
                            <div style={styles.cartDropdown}>
                                <div style={styles.cartHeader}>Sepetim ({cart?.items?.length || 0})</div>
                                <div style={styles.cartContent}>
                                    {cart?.items?.length > 0 ? (
                                        Object.keys(groupedItems).map(carGroup => (
                                            <div key={carGroup}>
                                                <div style={styles.miniCarLabel}><FaCarSide size={10}/> {carGroup}</div>
                                                {groupedItems[carGroup].map(item => (
                                                    <div key={item._id} style={styles.cartRow}>
                                                        <img src={item.part?.photo || 'https://via.placeholder.com/40'} style={styles.cartImg} alt="p" />
                                                        <div style={styles.cartInfo}>
                                                            <div style={styles.cartName}>{item.part?.name}</div>
                                                            <div style={styles.cartPriceRow}>
                                                                <span style={styles.miniPrice}>{item.priceAtAdd?.toLocaleString()} TL</span>
                                                                <div style={styles.miniQtyControls}>
                                                                    <button onClick={() => updateQtyMini(item.part?._id, -1, item.quantity)} style={styles.miniQtyBtn} disabled={item.quantity <= 1}><FaMinus size={8} /></button>
                                                                    <span style={styles.miniQtyNum}>{item.quantity}</span>
                                                                    <button onClick={() => updateQtyMini(item.part?._id, 1, item.quantity)} style={styles.miniQtyBtn}><FaPlus size={8} /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))
                                    ) : <div style={{textAlign:'center', padding:'20px', color:'#999'}}>Sepetiniz boş</div>}
                                </div>
                                {cart?.items?.length > 0 && (
                                    <div style={styles.cartFooter}>
                                        <div style={styles.miniTotalRow}><span>Toplam:</span><strong>{calculateTotal().toLocaleString()} TL</strong></div>
                                        <button style={styles.goCartBtn} onClick={() => { navigate('/cart'); setIsCartOpen(false); }}>SEPETE GİT</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

const styles = {
    // ... Eski stiller aynı kalıyor, sadece yenileri ekledim ...
    nav: { background: '#fff', borderBottom: '1px solid #ddd', padding: '10px 0', position: 'sticky', top: 0, zIndex: 2000 },
    container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' },
    logo: { fontWeight: '900', fontSize: '22px', textDecoration: 'none', color: '#333' },
    searchBox: { flex: 1, margin: '0 30px', position: 'relative', display: 'flex' },
    searchInput: { width: '100%', padding: '10px 15px', borderRadius: '5px', border: '1px solid #ddd', outline: 'none' },
    searchBtn: { position: 'absolute', right: 0, top: 0, bottom: 0, background: '#0984e3', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '0 5px 5px 0', cursor: 'pointer' },
    menu: { display: 'flex', gap: '20px', alignItems: 'center' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    userWrapper: { position: 'relative', padding: '10px 0' },
    dropdown: { position: 'absolute', top: '100%', right: 0, width: '180px', background: '#fff', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', borderRadius: '4px', border: '1px solid #eee', overflow: 'hidden' },
    dropItem: { display: 'flex', alignItems: 'center', padding: '12px 15px', textDecoration: 'none', color: '#333', fontSize: '13px', cursor: 'pointer' },
    dropLead: { display: 'flex', alignItems: 'center', gap: '10px' },
    cartBadge: { position: 'absolute', top: '-8px', right: '-10px', background: '#d63031', color: '#fff', fontSize: '10px', padding: '2px 5px', borderRadius: '50%' },
    cartDropdown: { position: 'absolute', top: '45px', right: 0, width: '320px', background: '#fff', boxShadow: '0 15px 40px rgba(0,0,0,0.2)', borderRadius: '12px', padding: '15px', zIndex: 2001, border: '1px solid #eee' },
    cartHeader: { fontWeight: '800', fontSize: '15px', marginBottom: '10px', borderBottom: '1px solid #f1f1f1', paddingBottom: '10px' },
    cartContent: { maxHeight: '350px', overflowY: 'auto' },
    
    // YENİ EKLEDİĞİM STİLLER
    miniCarLabel: { fontSize: '10px', fontWeight: '800', color: '#0984e3', marginBottom: '8px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' },
    cartRow: { display: 'flex', gap: '10px', marginBottom: '12px', borderBottom: '1px solid #fafafa', paddingBottom: '8px' },
    cartImg: { width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' },
    cartInfo: { flex: 1 },
    cartName: { fontSize: '11px', fontWeight: '700', color: '#2d3436' },
    cartPriceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' },
    miniPrice: { fontSize: '11px', color: '#0984e3', fontWeight: 'bold' },
    miniQtyControls: { display: 'flex', alignItems: 'center', gap: '5px' },
    miniQtyBtn: { border: 'none', background: '#f1f2f6', width: '18px', height: '18px', borderRadius: '4px', cursor: 'pointer' },
    miniQtyNum: { fontSize: '11px', fontWeight: 'bold' },
    cartFooter: { borderTop: '1px solid #eee', paddingTop: '10px' },
    miniTotalRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' },
    goCartBtn: { width: '100%', padding: '10px', background: '#0984e3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }
};

export default Navbar;