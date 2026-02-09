import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/client/Home';
import Dashboard from './pages/Dashboard';

// Dosya yollarını görseldeki klasör yapısına göre düzelttik
import UserPartDetail from './pages/client/UserPartDetail'; // Kullanıcı Detay Sayfası
import PartDetail from './pages/PartDetail'; // Admin Detay Sayfası

import Garage from './pages/client/Garage';
import Settings from './pages/client/Settings';
import Orders from './pages/client/Orders';
import Address from './pages/client/Address';
import Cart from './pages/client/Cart';
import Checkout from './pages/client/Checkout'; // 🚀 Checkout sayfasını içe aktardık

function App() {
    const isAuthenticated = !!localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); 

    return (
        <Router>
            <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* 🚀 KULLANICI ÜRÜN DETAY (Herkes görebilir) */}
                <Route path="/part/:id" element={<UserPartDetail />} />

                {/* ADMIN ROUTES */}
                <Route 
                    path="/dashboard" 
                    element={isAuthenticated && userRole === 'admin' ? <Dashboard /> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/admin/part/:id" 
                    element={isAuthenticated && userRole === 'admin' ? <PartDetail /> : <Navigate to="/login" />} 
                />

                {/* CLIENT PRIVATE ROUTES */}
                <Route path="/garage" element={isAuthenticated ? <Garage /> : <Navigate to="/login" />} />
                <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
                <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" />} />
                <Route path="/address" element={isAuthenticated ? <Address /> : <Navigate to="/login" />} />
                <Route path="/cart" element={isAuthenticated ? <Cart /> : <Navigate to="/login" />} />
                
                {/* 🚀 CHECKOUT ROUTE (Ödeme Adımı - Sadece Giriş Yapanlar) */}
                <Route 
                    path="/checkout" 
                    element={isAuthenticated ? <Checkout /> : <Navigate to="/login" />} 
                />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;