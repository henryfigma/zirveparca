import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Products from './Products';
import FilterTable from './FilterTable';

// Alt klasörden gelen bileşenler
import AddCar from './dashboard/AddCar';
import AddPart from './dashboard/AddPart';
import BrandSettings from './dashboard/BrandSettings';
import BrandTable from './dashboard/BrandTable'; 
import PartBrandTable from './dashboard/PartBrandTable';
import CarTable from './dashboard/CarTable';
import CategoryForm from './dashboard/CategoryForm'; 
import CategoryTable from './dashboard/CategoryTable';
import UserList from './dashboard/UserList'; 
// --- YENİ: AdminOrders Import ---
import AdminOrders from './dashboard/AdminOrders'; 

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/', { replace: true });
        window.location.reload();
    };

    return (
        <div style={styles.layout}>
            <aside style={styles.sidebar}>
                <h2 style={styles.logo}>Zirve Admin</h2>
                <div style={styles.navGroup}>
                    {/* YENİ: Sipariş Yönetimi Butonu (Üstte olması daha iyi olur) */}
                    <button onClick={() => setActiveTab('adminOrders')} style={activeTab === 'adminOrders' ? styles.activeBtn : styles.navBtn}>🛍️ Sipariş Yönetimi</button>
                    
                    <button onClick={() => setActiveTab('products')} style={activeTab === 'products' ? styles.activeBtn : styles.navBtn}>📦 Ürün Kataloğu</button>
                    <button onClick={() => setActiveTab('stokListesi')} style={activeTab === 'stokListesi' ? styles.activeBtn : styles.navBtn}>📊 Detaylı Stok & Filtre</button>
                    
                    <div style={styles.divider}>LİSTELER</div>
                    <button onClick={() => setActiveTab('userList')} style={activeTab === 'userList' ? styles.activeBtn : styles.navBtn}>👥 Müşteri Listesi</button>
                    <button onClick={() => setActiveTab('carTable')} style={activeTab === 'carTable' ? styles.activeBtn : styles.navBtn}>🏎️ Araç Model Listesi</button>
                    <button onClick={() => setActiveTab('brandTable')} style={activeTab === 'brandTable' ? styles.activeBtn : styles.navBtn}>🚗 Araç Markaları</button>
                    <button onClick={() => setActiveTab('partBrandTable')} style={activeTab === 'partBrandTable' ? styles.activeBtn : styles.navBtn}>🏢 Üretici Markaları</button>
                    <button onClick={() => setActiveTab('categoryTable')} style={activeTab === 'categoryTable' ? styles.activeBtn : styles.navBtn}>📂 Kategori Listesi</button>
                    
                    <div style={styles.divider}>EKLEME İŞLEMLERİ</div>
                    <button onClick={() => setActiveTab('addCar')} style={activeTab === 'addCar' ? styles.activeBtn : styles.navBtn}>➕ Araç & Motor Ekle</button>
                    <button onClick={() => setActiveTab('addPart')} style={activeTab === 'addPart' ? styles.activeBtn : styles.navBtn}>🔧 Parça & Uyumluluk</button>
                    <button onClick={() => setActiveTab('categoryForm')} style={activeTab === 'categoryForm' ? styles.activeBtn : styles.navBtn}>📁 Yeni Kategori Ekle</button>
                    <button onClick={() => setActiveTab('settings')} style={activeTab === 'settings' ? styles.activeBtn : styles.navBtn}>⚙️ Hızlı Marka Kaydı</button>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Çıkış Yap</button>
            </aside>

            <main style={styles.content}>
                {/* YENİ: Sipariş Yönetimi İçeriği */}
                {activeTab === 'adminOrders' && <AdminOrders />}

                {activeTab === 'products' && <Products />}
                {activeTab === 'stokListesi' && <FilterTable />}
                {activeTab === 'userList' && <UserList />}
                {activeTab === 'carTable' && <CarTable />}
                {activeTab === 'brandTable' && <BrandTable />}
                {activeTab === 'partBrandTable' && <PartBrandTable />}
                {activeTab === 'categoryTable' && <CategoryTable />}
                
                {activeTab === 'addCar' && <AddCar />}
                {activeTab === 'addPart' && <AddPart />}
                {activeTab === 'categoryForm' && <CategoryForm />}
                {activeTab === 'settings' && <BrandSettings />}
            </main>
        </div>
    );
};
// ...styles aynı kalabilir
const styles = {
    layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' },
    sidebar: { width: '250px', backgroundColor: '#1c1e21', padding: '20px', color: '#fff', position:'fixed', height:'100vh', display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto' },
    logo: { color: '#fff', textAlign: 'center', marginBottom: '40px', fontSize: '24px', fontWeight: 'bold' },
    navGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    divider: { color: '#65676b', fontSize: '11px', fontWeight: 'bold', marginTop: '15px', marginBottom: '5px', paddingLeft: '14px', letterSpacing: '1px' },
    navBtn: { width: '100%', padding: '14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#b0b3b8', borderRadius: '8px', fontSize: '15px', transition: '0.2s' },
    activeBtn: { width: '100%', padding: '14px', textAlign: 'left', border: 'none', backgroundColor: '#2e89ff', color: '#fff', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px' },
    logoutBtn: { width: '100%', padding: '15px', backgroundColor: '#e41e3f', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '30px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' },
    content: { flex: 1, marginLeft: '250px', padding: '30px', minHeight: '100vh' }
};

export default Dashboard;