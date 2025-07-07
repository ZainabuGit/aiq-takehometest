import axios from "axios";
import { logout } from "./auth";
import {API_ENDPOINTS} from "@/config/api";

const api = axios.create({
    baseURL: API_ENDPOINTS.BASE,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refresh_token");

            try {
                const { data } = await axios.post(API_ENDPOINTS.REFRESH_TOKEN , {
                    refresh_token: refreshToken,
                });

                localStorage.setItem("token", data.access_token);
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                return api(originalRequest);
            } catch (err) {
                logout(); // 🔥 Refresh failed — logout and redirect
            }
        }

        return Promise.reject(error);
    }
);

export default api;
