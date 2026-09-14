import React from "react";
import { useAlertContext } from "../context/AlertContext";
import { Maximize2, Play, Square, Trash2 } from "lucide-react";
import LiveFeedViewer from "./LiveFeedViewer";

export default function CameraCard({
    camera,
    onStart,
    onStop,
    onRemove,
    busy,
    monitoringOnly = false,
}) {
    const { dashboardData } = useAlertContext();

    const isRunning = camera.status === "running";

    const metrics =
        dashboardData?.[camera.camera_id] || null;

    const peopleCount =
        metrics?.people_count ?? "--";

    const densityLevel =
        metrics?.density_level ?? "--";

    const motionScore =
        metrics?.motion_score != null
            ? Number(metrics.motion_score).toFixed(2)
            : "--";

    const riskLevel =
        metrics?.risk_level ?? "--";
    

    return (
        <div
            className="panel"
            style={{
                overflow: "hidden",
                padding: 0,
            }}
        >
            {/* Header */}
            <div
                className="flex-between"
                style={{
                    padding: "1rem",
                }}
            >
                <div>
                    <h3 style={{ margin: 0 }}>
                        {camera.camera_id}
                    </h3>

                    <div
                        style={{
                            marginTop: "0.35rem",
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                        }}
                    >
                        {camera.source_type.toUpperCase()}
                    </div>
                </div>

                <Maximize2 size={20} />
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "0.6rem",
                    marginTop: "1rem",
                }}
            >
                <div
                    style={{
                        padding: "0.75rem",
                        background: "#11161b",
                        border: "1px solid #1f2937",
                        borderRadius: "8px",
                    }}
                >
                    <div
                        style={{
                            color: "#718096",
                            fontSize: "0.75rem",
                        }}
                    >
                        PEOPLE
                    </div>

                    <strong
                        style={{
                            color: "#fff",
                            fontSize: "1.1rem",
                        }}
                    >
                        {peopleCount}
                    </strong>
                </div>

                <div
                    style={{
                        padding: "0.75rem",
                        background: "#11161b",
                        border: "1px solid #1f2937",
                        borderRadius: "8px",
                    }}
                >
                    <div
                        style={{
                            color: "#718096",
                            fontSize: "0.75rem",
                        }}
                    >
                        DENSITY
                    </div>

                    <strong
                        style={{
                            color: "#fff",
                            fontSize: "1.1rem",
                        }}
                    >
                        {densityLevel}
                    </strong>
                </div>

                <div
                    style={{
                        padding: "0.75rem",
                        background: "#11161b",
                        border: "1px solid #1f2937",
                        borderRadius: "8px",
                    }}
                >
                    <div
                        style={{
                            color: "#718096",
                            fontSize: "0.75rem",
                        }}
                    >
                        MOTION
                    </div>

                    <strong
                        style={{
                            color: "#fff",
                            fontSize: "1.1rem",
                        }}
                    >
                        {motionScore}
                    </strong>
                </div>

                <div
                    style={{
                        padding: "0.75rem",
                        background: "#11161b",
                        border: "1px solid #1f2937",
                        borderRadius: "8px",
                    }}
                >
                    <div
                        style={{
                            color: "#718096",
                            fontSize: "0.75rem",
                        }}
                    >
                        RISK
                    </div>

                    <strong
                        style={{
                            color:
                                riskLevel === "HIGH"
                                    ? "#ef4444"
                                    : riskLevel === "WARNING"
                                    ? "#f59e0b"
                                    : "#22c55e",
                            fontSize: "1.1rem",
                        }}
                    >
                        {riskLevel}
                    </strong>
                </div>
            </div>

            {/* Live Feed */}
            <div
                style={{
                    height: 300,
                    background: "#000",
                }}
            >
                <LiveFeedViewer
                    cameraId={camera.camera_id}
                />
            </div>

            {/* Camera information */}
            <div
                style={{
                    padding: "1rem",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                    }}
                >
                    <span
                        style={{
                            fontSize: "0.9rem",
                            color: "var(--text-secondary)",
                        }}
                    >
                        Status
                    </span>

                    <span
                        style={{
                            fontWeight: 600,
                            color:
                                isRunning
                                    ? "#22c55e"
                                    : camera.status === "error"
                                    ? "#ef4444"
                                    : "var(--text-secondary)",
                        }}
                    >
                        ● {camera.status.toUpperCase()}
                    </span>
                </div>

                <div
                    style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        marginBottom: monitoringOnly
                            ? 0
                            : "1rem",
                        wordBreak: "break-word",
                    }}
                >
                    Source: {String(camera.source_url)}
                </div>

                {/* Management Controls */}
                {!monitoringOnly && (
                    <div
                        style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                            marginTop: "1rem",
                        }}
                    >
                        {!isRunning ? (
                            <button
                                onClick={() =>
                                    onStart(
                                        camera.camera_id
                                    )
                                }
                                disabled={busy}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                }}
                            >
                                <Play size={16} />

                                {busy
                                    ? "Starting..."
                                    : "Start"}
                            </button>
                        ) : (
                            <button
                                onClick={() =>
                                    onStop(
                                        camera.camera_id
                                    )
                                }
                                disabled={busy}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                }}
                            >
                                <Square size={16} />

                                {busy
                                    ? "Stopping..."
                                    : "Stop"}
                            </button>
                        )}

                        <button
                            onClick={() =>
                                onRemove(
                                    camera.camera_id
                                )
                            }
                            disabled={
                                busy || isRunning
                            }
                            title={
                                isRunning
                                    ? "Stop the camera before removing it"
                                    : "Remove camera"
                            }
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                            }}
                        >
                            <Trash2 size={16} />

                            Remove
                        </button>
                    </div>
                )}

                {/* Monitoring-only information */}
                {monitoringOnly && (
                    <div
                        style={{
                            marginTop: "1rem",
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                        }}
                    >
                        Live AI monitoring active
                    </div>
                )}
            </div>
        </div>
    );
}