import React, { useEffect, useState } from "react";
import { RefreshCw, Video } from "lucide-react";

import CameraCard from "../components/CameraCard";
import { getCameras } from "../services/cameraService";

export default function LiveMonitoring() {
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

        // Keep monitoring view synchronized with camera state.
        const interval = setInterval(() => {
            loadCameras();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const runningCameras = cameras.filter(
        (camera) => camera.status === "running"
    );

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
                    className="button"
                    onClick={loadCameras}
                    disabled={loading}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                    }}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* ================================================== */}
            {/* Error */}
            {/* ================================================== */}

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

            {/* ================================================== */}
            {/* Monitoring Summary */}
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
                    {runningCameras.length} running
                </div>
            )}

            {/* ================================================== */}
            {/* Loading */}
            {/* ================================================== */}

            {loading && cameras.length === 0 && (
                <div className="panel">
                    Loading monitoring feeds...
                </div>
            )}

            {/* ================================================== */}
            {/* No Running Cameras */}
            {/* ================================================== */}

            {!loading && runningCameras.length === 0 && (
                <div
                    className="panel"
                    style={{
                        padding: "2rem",
                        textAlign: "center",
                    }}
                >
                    <Video
                        size={40}
                        style={{
                            marginBottom: "1rem",
                            opacity: 0.7,
                        }}
                    />

                    <h3>
                        No cameras are currently running
                    </h3>

                    <p
                        style={{
                            color: "var(--text-secondary)",
                            maxWidth: "600px",
                            margin: "0 auto",
                        }}
                    >
                        Start a registered camera from the
                        Camera Management page to begin live
                        monitoring.
                    </p>
                </div>
            )}

            {/* ================================================== */}
            {/* Live Camera Grid */}
            {/* ================================================== */}

            {runningCameras.length > 0 && (
                <div
                    className="grid-layout"
                    style={{
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(450px,1fr))",
                    }}
                >
                    {runningCameras.map((camera) => (
                        <CameraCard
                            key={camera.camera_id}
                            camera={camera}
                            monitoringOnly
                        />
                    ))}
                </div>
            )}
        </div>
    );
}