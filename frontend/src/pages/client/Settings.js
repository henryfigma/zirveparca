import React, { useState } from 'react';
import NavBar from '../../components/NavBar';
import API from '../../api';

const Settings = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        // Şifre kontrolü
        if (passData.newPassword !== passData.confirmPassword) {
            return setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor!' });
        }

        try {
            const res = await API.put('/users/change-password', {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            });
            setMessage({ type: 'success', text: res.data.message });
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Bir hata oluştu.' });
        }
    };

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <NavBar />
            <div style={styles.container}>
                <h1 style={styles.mainTitle}>Hesap Ayarları</h1>

                <div style={styles.sectionLayout}>
                    {/* Sol: Profil Bilgileri */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Profil Bilgileri</h3>
                        <div style={styles.infoGroup}>
                            <label style={styles.label}>AD SOYAD</label>
                            <p style={styles.infoText}>{user.name}</p>
                        </div>
                        <div style={styles.infoGroup}>
                            <label style={styles.label}>E-POSTA ADRESİ</label>
                            <p style={styles.infoText}>{user.email}</p>
                        </div>
                    </div>

                    {/* Sağ: Şifre Değiştirme */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Şifre Güncelleme</h3>
                        {message.text && (
                            <div style={{ 
                                padding: '10px', 
                                marginBottom: '15px', 
                                borderRadius: '5px',
                                backgroundColor: message.type === 'success' ? '#dff9fb' : '#ffdfdf',
                                color: message.type === 'success' ? '#009432' : '#eb4d4b',
                                fontSize: '14px'
                            }}>
                                {message.text}
                            </div>
                        )}
                        <form onSubmit={handleChangePassword}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>ESKİ ŞİFRE</label>
                                <input 
                                    type="password" 
                                    required
                                    style={styles.input} 
                                    value={passData.oldPassword}
                                    onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>YENİ ŞİFRE</label>
                                <input 
                                    type="password" 
                                    required
                                    style={styles.input} 
                                    value={passData.newPassword}
                                    onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>YENİ ŞİFRE (TEKRAR)</label>
                                <input 
                                    type="password" 
                                    required
                                    style={styles.input} 
                                    value={passData.confirmPassword}
                                    onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                                />
                            </div>
                            <button type="submit" style={styles.saveBtn}>ŞİFREYİ GÜNCELLE</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px' },
    mainTitle: { fontSize: '32px', fontWeight: '900', marginBottom: '30px', color: '#2d3436' },
    sectionLayout: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' },
    card: { background: '#fff', borderRadius: '15px', padding: '30px', border: '1px solid #eee', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    cardTitle: { marginTop: 0, marginBottom: '25px', fontSize: '18px', fontWeight: '800', borderBottom: '2px solid #f1f2f6', paddingBottom: '10px' },
    infoGroup: { marginBottom: '20px' },
    label: { fontSize: '11px', fontWeight: 'bold', color: '#b2bec3', letterSpacing: '1px' },
    infoText: { fontSize: '16px', fontWeight: '600', color: '#2d3436', marginTop: '5px' },
    inputGroup: { marginBottom: '15px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6e9', marginTop: '5px', outline: 'none' },
    saveBtn: { width: '100%', padding: '15px', background: '#0984e3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};

export default Settings;