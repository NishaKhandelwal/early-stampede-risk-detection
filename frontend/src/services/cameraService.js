import api from "./api";

/**
 * Get all registered cameras and their current status.
 */
export const getCameras = async () => {
    const response = await api.get("/stream/status");
    return response.data;
};

/**
 * Get one camera's status.
 */
export const getCameraStatus = async (cameraId) => {
    const response = await api.get(
        `/stream/status/${encodeURIComponent(cameraId)}`
    );

    return response.data;
};

/**
 * Register a new camera.
 */
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

/**
 * Start a camera stream.
 */
export const startCamera = async (cameraId) => {
    const response = await api.post("/stream/start", {
        camera_id: cameraId,
    });

    return response.data;
};

/**
 * Stop a camera stream.
 */
export const stopCamera = async (cameraId) => {
    const response = await api.post("/stream/stop", {
        camera_id: cameraId,
    });

    return response.data;
};

/**
 * Remove a camera.
 */
export const deleteCamera = async (cameraId) => {
    const response = await api.delete(
        `/stream/${encodeURIComponent(cameraId)}`
    );

    return response.data;
};