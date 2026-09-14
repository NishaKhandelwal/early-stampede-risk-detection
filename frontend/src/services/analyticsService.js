import api from "./api";

export async function getAnalytics(cameraId = null, limit = 200) {
    const params = {
        limit,
    };

    if (cameraId) {
        params.camera_id = cameraId;
    }

    const response = await api.get("/analytics", {
        params,
    });

    return response.data;
}