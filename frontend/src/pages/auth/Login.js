import React, { useState } from 'react';
import API from '../../api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Backend'deki /api/auth/login rotasına istek atar
            const res = await API.post('/auth/login', { email, password });
            
            // Bilgileri tarayıcıya kaydet
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.setItem('role', res.data.role);
            
            // Rol kontrolü ve yönlendirme
            if (res.data.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
            
            // Header ve diğer bileşenlerin güncellenmesi için sayfayı tazeler
            window.location.reload(); 
        } catch (err) {
            alert("Giriş başarısız: " + (err.response?.data?.message || "Bilgilerinizi kontrol edin."));
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.card}>
                <h2 style={styles.title}>Giriş Yap</h2>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>E-posta</label>
                    <input 
                        type="email" 
                        style={styles.input} 
                        placeholder="ornek@mail.com"
                        onChange={e => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Şifre</label>
                    <input 
                        type="password" 
                        style={styles.input} 
                        placeholder="••••••••"
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" style={styles.btn}>Oturum Aç</button>
                <p style={styles.footerText}>
                    Hesabınız yok mu? <Link to="/register" style={styles.link}>Hemen Üye Ol</Link>
                </p>
            </form>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f6fa' },
    card: { background: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' },
    title: { textAlign: 'center', marginBottom: '30px', color: '#2d3436', fontSize: '24px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#636e72' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6e9', boxSizing: 'border-box', outline: 'none' },
    btn: { width: '100%', padding: '14px', background: '#0984e3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' },
    footerText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#636e72' },
    link: { color: '#0984e3', textDecoration: 'none', fontWeight: 'bold' }
};

export default Login;