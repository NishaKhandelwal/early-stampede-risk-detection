import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 600000,
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
export const uploadVideo = async (videoFile) => {
    const formData = new FormData();

    formData.append("video", videoFile);
    formData.append("camera_id", "demo-camera");

    const response = await api.post(
        "/upload-video",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};
export const getCameras = async () => {
    const response = await api.get("/stream/status");
    return response.data;
};

export const getCameraStatus = async (cameraId) => {
    const response = await api.get(
        `/stream/status/${encodeURIComponent(cameraId)}`
    );

    return response.data;
};

export const registerCamera = async ({
    camera_id,
    source_url,
    source_type = "rtsp",
    process_every_n = 3,
}) => {
    const response = await api.post("/stream/register", {
        camera_id,
        source_url,
        source_type,
        process_every_n,
    });

    return response.data;
};

export const startCamera = async (cameraId) => {
    const response = await api.post("/stream/start", {
        camera_id: cameraId,
    });

    return response.data;
};

export const stopCamera = async (cameraId) => {
    const response = await api.post("/stream/stop", {
        camera_id: cameraId,
    });

    return response.data;
};

export const removeCamera = async (cameraId) => {
    const response = await api.delete(
        `/stream/${encodeURIComponent(cameraId)}`
    );

    return response.data;
};
export const getAlerts = async ({
    limit = 50,
    risk_level = null,
} = {}) => {
    const params = {
        limit,
    };

    if (risk_level) {
        params.risk_level = risk_level;
    }

    const response = await api.get("/alerts", { params });

    return response.data;
};
export const acknowledgeAlert = async (alertId) => {
    const response = await api.post(
        `/alerts/${alertId}/acknowledge`
    );

    return response.data;
};


export const acknowledgeAllAlerts = async () => {
    const response = await api.post(
        "/alerts/acknowledge-all"
    );

    return response.data;
};
export default api;
