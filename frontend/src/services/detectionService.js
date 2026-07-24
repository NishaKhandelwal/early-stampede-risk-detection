import api from "./api";


export const uploadVideo = async (videoFile, cameraId = "uploaded-video") => {
    const formData = new FormData();

    formData.append("video", videoFile);
    formData.append("camera_id", cameraId);

    const response = await api.post(
        "/upload-video",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 120000,
        }
    );

    return response.data;
};


export const processFrame = async (
    imageFile,
    cameraId = "default",
    annotate = true
) => {

    const formData = new FormData();

    formData.append("frame", imageFile);
    formData.append("camera_id", cameraId);
    formData.append("annotate", annotate);

    const response = await api.post(
        "/process-frame",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};