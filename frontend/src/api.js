import axios from 'axios';

const API = axios.create({
    // Buraya kendi VPS IP adresini yazıyorsun
    baseURL: 'http://89.252.153.99:5000/api' 
});

// Interceptor aynı kalsın...
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
