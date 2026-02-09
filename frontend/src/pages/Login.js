import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/login', formData);
            
            // Backend'den gelen verileri kaydet
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role); // Role kaydı önemli
            
            alert('Başarıyla giriş yapıldı!');
            
            // Sayfayı zorla yenilemeden yönlendirme yapmak için navigate kullanıyoruz
            // replace: true ile geri dönülmesini engelleriz
            navigate('/dashboard', { replace: true });
            
        } catch (err) {
            alert('Hata: ' + (err.response?.data?.message || 'Giriş yapılamadı'));
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Admin Panel</h2>
                <div style={{marginBottom: '15px'}}>
                    <label style={{display: 'block', fontSize: '12px', fontWeight: 'bold'}}>Kullanıcı Adı</label>
                    <input 
                        type="text" 
                        onChange={e => setFormData({...formData, username: e.target.value})} 
                        style={styles.input}
                        required 
                    />
                </div>
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', fontSize: '12px', fontWeight: 'bold'}}>Şifre</label>
                    <input 
                        type="password" 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        style={styles.input}
                        required 
                    />
                </div>
                <button type="submit" style={styles.button}>Giriş Yap</button>
            </form>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
    form: { backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '350px' },
    input: { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', backgroundColor: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }
};

export default Login;