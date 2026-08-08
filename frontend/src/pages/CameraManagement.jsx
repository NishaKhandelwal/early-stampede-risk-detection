import React, { useEffect, useState } from "react";
import {
    Plus,
    Play,
    Square,
    Trash2,
    RefreshCw,
    Video,
} from "lucide-react";

import {
    getCameras,
    registerCamera,
    startCamera,
    stopCamera,
    deleteCamera,
} from "../services/cameraService";

export default function CameraManagement() {
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionCamera, setActionCamera] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        camera_id: "",
        source_url: "",
        source_type: "rtsp",
        process_every_n: 3,
    });

    const loadCameras = async () => {
        try {
            setError("");

            const data = await getCameras();

            setCameras(data.cameras || []);
        } catch (err) {
            console.error("Failed to load cameras:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load cameras."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCameras();

        const interval = setInterval(() => {
            loadCameras();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                name === "process_every_n"
                    ? Number(value)
                    : value,
        }));
    };

    const handleRegister = async (event) => {
        event.preventDefault();

        try {
            setError("");
            setMessage("");

            if (!form.camera_id.trim()) {
                setError("Camera ID is required.");
                return;
            }

            if (!form.source_url.trim()) {
                setError("Source URL is required.");
                return;
            }

            await registerCamera(form);

            setMessage("Camera registered successfully.");

            setForm({
                camera_id: "",
                source_url: "",
                source_type: "rtsp",
                process_every_n: 3,
            });

            setShowForm(false);

            await loadCameras();
        } catch (err) {
            console.error("Camera registration failed:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to register camera."
            );
        }
    };

    const handleStart = async (cameraId) => {
        try {
            setActionCamera(cameraId);
            setError("");
            setMessage("");

            await startCamera(cameraId);

            setMessage(`${cameraId} started.`);

            await loadCameras();
        } catch (err) {
            console.error("Failed to start camera:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to start camera."
            );
        } finally {
            setActionCamera(null);
        }
    };

    const handleStop = async (cameraId) => {
        try {
            setActionCamera(cameraId);
            setError("");
            setMessage("");

            await stopCamera(cameraId);

            setMessage(`${cameraId} stopped.`);

            await loadCameras();
        } catch (err) {
            console.error("Failed to stop camera:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to stop camera."
            );
        } finally {
            setActionCamera(null);
        }
    };

    const handleDelete = async (cameraId) => {
        const confirmed = window.confirm(
            `Remove camera "${cameraId}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionCamera(cameraId);
            setError("");
            setMessage("");

            await deleteCamera(cameraId);

            setMessage(`${cameraId} removed.`);

            await loadCameras();
        } catch (err) {
            console.error("Failed to delete camera:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to remove camera."
            );
        } finally {
            setActionCamera(null);
        }
    };

    const getStatusClass = (status) => {
        if (status === "running") {
            return "status-running";
        }

        if (status === "error") {
            return "status-error";
        }

        return "status-stopped";
    };

    return (
        <div>
            <div
                className="flex-between"
                style={{
                    marginBottom: "2rem",
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>
                        Camera Management
                    </h1>

                    <p
                        style={{
                            marginTop: "0.5rem",
                            color: "var(--text-secondary)",
                        }}
                    >
                        Register and control surveillance cameras
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "0.75rem",
                    }}
                >
                    <button
                        className="button"
                        onClick={loadCameras}
                        disabled={loading}
                    >
                        <RefreshCw size={16} />

                        Refresh
                    </button>

                    <button
                        className="button button-primary"
                        onClick={() => {
                            setShowForm(!showForm);
                            setError("");
                            setMessage("");
                        }}
                    >
                        <Plus size={16} />

                        Add Camera
                    </button>
                </div>
            </div>

            {message && (
                <div
                    className="panel"
                    style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                    }}
                >
                    {message}
                </div>
            )}

            {error && (
                <div
                    className="panel"
                    style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                    }}
                >
                    {error}
                </div>
            )}

            {showForm && (
                <div
                    className="panel"
                    style={{
                        marginBottom: "2rem",
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>
                        Register Camera
                    </h2>

                    <form onSubmit={handleRegister}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit,minmax(220px,1fr))",
                                gap: "1rem",
                            }}
                        >
                            <div>
                                <label>Camera ID</label>

                                <input
                                    name="camera_id"
                                    value={form.camera_id}
                                    onChange={handleInputChange}
                                    placeholder="CAM-01"
                                />
                            </div>

                            <div>
                                <label>Source Type</label>

                                <select
                                    name="source_type"
                                    value={form.source_type}
                                    onChange={handleInputChange}
                                >
                                    <option value="rtsp">
                                        RTSP
                                    </option>

                                    <option value="webcam">
                                        Webcam
                                    </option>

                                    <option value="video">
                                        Video
                                    </option>
                                </select>
                            </div>

                            <div
                                style={{
                                    gridColumn:
                                        "span 2",
                                }}
                            >
                                <label>
                                    Source URL / Path
                                </label>

                                <input
                                    name="source_url"
                                    value={form.source_url}
                                    onChange={handleInputChange}
                                    placeholder={
                                        form.source_type ===
                                        "rtsp"
                                            ? "rtsp://camera/live"
                                            : "path/to/video.mp4"
                                    }
                                />
                            </div>

                            <div>
                                <label>
                                    Process Every N Frames
                                </label>

                                <input
                                    type="number"
                                    name="process_every_n"
                                    min="1"
                                    value={
                                        form.process_every_n
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                />
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                marginTop: "1.5rem",
                            }}
                        >
                            <button
                                type="submit"
                                className="button button-primary"
                            >
                                Register Camera
                            </button>

                            <button
                                type="button"
                                className="button"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid-layout">
                {loading && cameras.length === 0 ? (
                    <div className="panel">
                        Loading cameras...
                    </div>
                ) : cameras.length === 0 ? (
                    <div className="panel">
                        <Video size={32} />

                        <h3>
                            No cameras registered
                        </h3>

                        <p
                            style={{
                                color:
                                    "var(--text-secondary)",
                            }}
                        >
                            Add a camera to begin monitoring.
                        </p>
                    </div>
                ) : (
                    cameras.map((camera) => (
                        <div
                            className="panel"
                            key={camera.camera_id}
                        >
                            <div className="flex-between">
                                <div>
                                    <h3
                                        style={{
                                            marginTop: 0,
                                        }}
                                    >
                                        {camera.camera_id}
                                    </h3>

                                    <span
                                        className={getStatusClass(
                                            camera.status
                                        )}
                                    >
                                        {camera.status}
                                    </span>
                                </div>

                                <Video size={24} />
                            </div>

                            <div
                                style={{
                                    marginTop: "1rem",
                                    color:
                                        "var(--text-secondary)",
                                }}
                            >
                                <div>
                                    <strong>
                                        Type:
                                    </strong>{" "}
                                    {camera.source_type}
                                </div>

                                <div
                                    style={{
                                        marginTop:
                                            "0.5rem",
                                        wordBreak:
                                            "break-all",
                                    }}
                                >
                                    <strong>
                                        Source:
                                    </strong>{" "}
                                    {camera.source_url}
                                </div>

                                <div
                                    style={{
                                        marginTop:
                                            "0.5rem",
                                    }}
                                >
                                    <strong>
                                        Processing:
                                    </strong>{" "}
                                    Every{" "}
                                    {
                                        camera.process_every_n
                                    }{" "}
                                    frames
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    flexWrap:
                                        "wrap",
                                    gap: "0.5rem",
                                    marginTop: "1.5rem",
                                }}
                            >
                                {camera.status ===
                                "running" ? (
                                    <button
                                        className="button"
                                        disabled={
                                            actionCamera ===
                                            camera.camera_id
                                        }
                                        onClick={() =>
                                            handleStop(
                                                camera.camera_id
                                            )
                                        }
                                    >
                                        <Square
                                            size={15}
                                        />

                                        Stop
                                    </button>
                                ) : (
                                    <button
                                        className="button button-primary"
                                        disabled={
                                            actionCamera ===
                                            camera.camera_id
                                        }
                                        onClick={() =>
                                            handleStart(
                                                camera.camera_id
                                            )
                                        }
                                    >
                                        <Play
                                            size={15}
                                        />

                                        Start
                                    </button>
                                )}

                                <button
                                    className="button"
                                    disabled={
                                        camera.status ===
                                            "running" ||
                                        actionCamera ===
                                            camera.camera_id
                                    }
                                    onClick={() =>
                                        handleDelete(
                                            camera.camera_id
                                        )
                                    }
                                >
                                    <Trash2
                                        size={15}
                                    />

                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}