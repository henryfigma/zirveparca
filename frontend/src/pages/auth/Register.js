import React, { useState } from 'react';
import API from '../../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', password: '',
        membershipAgreed: false, kvkkAgreed: false
    });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.membershipAgreed || !formData.kvkkAgreed) return alert("Sözleşmeleri onaylamanız gerekmektedir.");

        try {
            await API.post('/auth/register', formData);
            alert("Kayıt başarılı! Giriş yapabilirsiniz.");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || "Kayıt hatası");
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleRegister} style={styles.card}>
                <h2 style={{textAlign:'center', marginBottom:'20px'}}>Üye Ol</h2>
                <input placeholder="Ad Soyad" style={styles.input} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                <input placeholder="E-posta" type="email" style={styles.input} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input placeholder="Telefon (05xx)" style={styles.input} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                <input placeholder="Şifre" type="password" style={styles.input} onChange={e => setFormData({...formData, password: e.target.value})} required />
                
                <div style={styles.checkboxArea}>
                    <input type="checkbox" id="membership" onChange={e => setFormData({...formData, membershipAgreed: e.target.checked})} />
                    <label htmlFor="membership">Üyelik sözleşmesini okudum, onaylıyorum.</label>
                </div>
                <div style={styles.checkboxArea}>
                    <input type="checkbox" id="kvkk" onChange={e => setFormData({...formData, kvkkAgreed: e.target.checked})} />
                    <label htmlFor="kvkk">KVKK metnini okudum.</label>
                </div>

                <button type="submit" style={styles.btn}>Kayıt Ol</button>
                <p style={{textAlign:'center', marginTop:'15px', fontSize:'14px'}}>
                    Zaten üye misiniz? <Link to="/login" style={{color:'#1a73e8', textDecoration:'none'}}>Giriş Yap</Link>
                </p>
            </form>
        </div>
    );
};

const styles = {
    container: { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f5f6fa' },
    card: { background:'#fff', padding:'30px', borderRadius:'12px', boxShadow:'0 4px 15px rgba(0,0,0,0.1)', width:'350px' },
    input: { width:'100%', padding:'10px', marginBottom:'15px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box' },
    btn: { width:'100%', padding:'12px', background:'#1a73e8', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' },
    checkboxArea: { display:'flex', gap:'10px', alignItems:'center', marginBottom:'10px', fontSize:'12px' }
};

export default Register; // Burası tekil export olmalı