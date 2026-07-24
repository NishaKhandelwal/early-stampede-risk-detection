import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        console.log(
            `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
        );
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("[API ERROR]", error);
        return Promise.reject(error);
    }
);

export const healthCheck = async () => {
    const response = await api.get("/health");
    return response.data;
};

export default api;