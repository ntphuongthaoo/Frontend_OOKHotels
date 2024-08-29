import axios from "axios";

const http = 'http://localhost:3000';

const axiosClient = axios.create({
    baseURL: http,
    headers: {
        "Content-Type": 'application/json',
    }
});

axiosClient.interceptors.request.use(function (config) {
    const organizationId = localStorage.getItem('ORGANIZATION_ID');
    if (organizationId) {
        config.headers['ORGANIZATION_ID'] = organizationId;
    }
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

axiosClient.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    return Promise.reject(error);
});

export default axiosClient;
