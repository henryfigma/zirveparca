import axios from 'axios';

const API = axios.create({
    baseURL: 'http://192.168.1.118:5000/api'
});

// Interceptor'ı standart Bearer formatına çekiyoruz
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Backend'deki protect middleware'i büyük ihtimalle burayı okuyor
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
