import React, { useEffect, useState } from "react";
import CameraCard from "../components/CameraCard";

import {
    getCameras,
    registerCamera,
    startCamera,
    stopCamera,
    removeCamera,
} from "../services/api";


export default function LiveMonitoring() {
    const [cameras, setCameras] = useState([]);

    const [loading, setLoading] = useState(true);

    const [actionCameraId, setActionCameraId] = useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showRegisterForm, setShowRegisterForm] = useState(false);

    const [form, setForm] = useState({
        camera_id: "",
        source_url: "",
        source_type: "rtsp",
        process_every_n: 3,
    });


    // ============================================================
    // Load cameras
    // ============================================================

    const loadCameras = async () => {
        try {
            setError("");

            const data = await getCameras();

            setCameras(data.cameras || []);
        } catch (err) {
            console.error("Failed to load cameras:", err);

            setError(
                err.response?.data?.error ||
                "Unable to load cameras."
            );
        } finally {
            setLoading(false);
        }
    };


    // ============================================================
    // Initial load
    // ============================================================

    useEffect(() => {
        loadCameras();
    }, []);


    // ============================================================
    // Register camera
    // ============================================================

    const handleRegister = async (event) => {
        event.preventDefault();

        try {
            setError("");
            setMessage("");

            if (!form.camera_id.trim()) {
                setError("Camera ID is required.");
                return;
            }

            if (!form.source_url && form.source_type !== "webcam") {
                setError("Source URL is required.");
                return;
            }

            let sourceUrl = form.source_url;

            // Webcam source 0 must be sent as number 0,
            // not string "0".
            if (form.source_type === "webcam") {
                sourceUrl = form.source_url.trim()
                    ? Number(form.source_url)
                    : 0;

                if (Number.isNaN(sourceUrl)) {
                    setError("Webcam device index must be a number.");
                    return;
                }
            }

            const response = await registerCamera({
                camera_id: form.camera_id.trim(),
                source_url: sourceUrl,
                source_type: form.source_type,
                process_every_n: Number(form.process_every_n),
            });

            setMessage(response.message || "Camera registered.");

            setForm({
                camera_id: "",
                source_url: "",
                source_type: "rtsp",
                process_every_n: 3,
            });

            setShowRegisterForm(false);

            await loadCameras();
        } catch (err) {
            console.error("Failed to register camera:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to register camera."
            );
        }
    };


    // ============================================================
    // Start camera
    // ============================================================

    const handleStart = async (cameraId) => {
        try {
            setError("");
            setMessage("");
            setActionCameraId(cameraId);

            const response = await startCamera(cameraId);

            setMessage(response.message || "Camera started.");

            await loadCameras();
        } catch (err) {
            console.error("Failed to start camera:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to start camera."
            );
        } finally {
            setActionCameraId(null);
        }
    };


    // ============================================================
    // Stop camera
    // ============================================================

    const handleStop = async (cameraId) => {
        try {
            setError("");
            setMessage("");
            setActionCameraId(cameraId);

            const response = await stopCamera(cameraId);

            setMessage(response.message || "Camera stopped.");

            await loadCameras();
        } catch (err) {
            console.error("Failed to stop camera:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to stop camera."
            );
        } finally {
            setActionCameraId(null);
        }
    };


    // ============================================================
    // Remove camera
    // ============================================================

    const handleRemove = async (cameraId) => {
        const confirmed = window.confirm(
            `Remove camera "${cameraId}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");
            setActionCameraId(cameraId);

            const response = await removeCamera(cameraId);

            setMessage(response.message || "Camera removed.");

            await loadCameras();
        } catch (err) {
            console.error("Failed to remove camera:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to remove camera."
            );
        } finally {
            setActionCameraId(null);
        }
    };


    // ============================================================
    // Form change
    // ============================================================

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    return (
        <div>
            {/* ================================================== */}
            {/* Header */}
            {/* ================================================== */}

            <div
                className="flex-between"
                style={{
                    marginBottom: "1.5rem",
                    gap: "1rem",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>
                        Live Monitoring
                    </h1>

                    <p
                        style={{
                            marginTop: "0.5rem",
                            color: "var(--text-secondary)",
                        }}
                    >
                        Real-time AI annotated surveillance
                    </p>
                </div>

                <button
                    onClick={() => {
                        setShowRegisterForm((previous) => !previous);
                        setError("");
                        setMessage("");
                    }}
                >
                    {showRegisterForm
                        ? "Close"
                        : "+ Register Camera"}
                </button>
            </div>


            {/* ================================================== */}
            {/* Messages */}
            {/* ================================================== */}

            {message && (
                <div
                    style={{
                        marginBottom: "1rem",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        background: "rgba(34, 197, 94, 0.12)",
                    }}
                >
                    {message}
                </div>
            )}

            {error && (
                <div
                    style={{
                        marginBottom: "1rem",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        background: "rgba(239, 68, 68, 0.12)",
                    }}
                >
                    {error}
                </div>
            )}


            {/* ================================================== */}
            {/* Register Camera */}
            {/* ================================================== */}

            {showRegisterForm && (
                <form
                    onSubmit={handleRegister}
                    className="panel"
                    style={{
                        marginBottom: "1.5rem",
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>
                        Register Camera
                    </h2>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit,minmax(220px,1fr))",
                            gap: "1rem",
                        }}
                    >
                        {/* Camera ID */}
                        <label>
                            <div style={{ marginBottom: "0.4rem" }}>
                                Camera ID
                            </div>

                            <input
                                type="text"
                                name="camera_id"
                                value={form.camera_id}
                                onChange={handleFormChange}
                                placeholder="CAM-01"
                                required
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
                            />
                        </label>


                        {/* Source Type */}
                        <label>
                            <div style={{ marginBottom: "0.4rem" }}>
                                Source Type
                            </div>

                            <select
                                name="source_type"
                                value={form.source_type}
                                onChange={handleFormChange}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
                            >
                                <option value="rtsp">
                                    RTSP
                                </option>

                                <option value="webcam">
                                    Webcam
                                </option>

                                <option value="video">
                                    Video File
                                </option>
                            </select>
                        </label>


                        {/* Source URL */}
                        <label
                            style={{
                                gridColumn:
                                    "span 2",
                            }}
                        >
                            <div style={{ marginBottom: "0.4rem" }}>
                                {form.source_type === "webcam"
                                    ? "Device Index"
                                    : "Source URL / File Path"}
                            </div>

                            <input
                                type={
                                    form.source_type === "webcam"
                                        ? "number"
                                        : "text"
                                }
                                name="source_url"
                                value={form.source_url}
                                onChange={handleFormChange}
                                placeholder={
                                    form.source_type === "webcam"
                                        ? "0"
                                        : form.source_type === "rtsp"
                                        ? "rtsp://camera_ip/live"
                                        : "path/to/video.mp4"
                                }
                                required={
                                    form.source_type !== "webcam"
                                }
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
                            />
                        </label>


                        {/* Process Every N */}
                        <label>
                            <div style={{ marginBottom: "0.4rem" }}>
                                Process Every N Frames
                            </div>

                            <input
                                type="number"
                                name="process_every_n"
                                min="1"
                                value={form.process_every_n}
                                onChange={handleFormChange}
                                required
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
                            />
                        </label>
                    </div>


                    <div
                        style={{
                            marginTop: "1rem",
                        }}
                    >
                        <button type="submit">
                            Register Camera
                        </button>
                    </div>
                </form>
            )}


            {/* ================================================== */}
            {/* Camera Summary */}
            {/* ================================================== */}

            {!loading && (
                <div
                    style={{
                        marginBottom: "1rem",
                        color: "var(--text-secondary)",
                    }}
                >
                    {cameras.length} registered camera
                    {cameras.length !== 1 ? "s" : ""}
                    {" • "}
                    {
                        cameras.filter(
                            (camera) =>
                                camera.status === "running"
                        ).length
                    }{" "}
                    running
                </div>
            )}


            {/* ================================================== */}
            {/* Camera Grid */}
            {/* ================================================== */}

            {loading ? (
                <div className="panel">
                    Loading cameras...
                </div>
            ) : cameras.length === 0 ? (
                <div className="panel">
                    <h3>No cameras registered</h3>

                    <p
                        style={{
                            color: "var(--text-secondary)",
                        }}
                    >
                        Register an RTSP camera, webcam, or video
                        source to begin monitoring.
                    </p>
                </div>
            ) : (
                <div
                    className="grid-layout"
                    style={{
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(450px,1fr))",
                    }}
                >
                    {cameras.map((camera) => (
                        <CameraCard
                            key={camera.camera_id}
                            camera={camera}
                            onStart={handleStart}
                            onStop={handleStop}
                            onRemove={handleRemove}
                            busy={
                                actionCameraId ===
                                camera.camera_id
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}