import React from "react";
import { Maximize2, Play, Square, Trash2 } from "lucide-react";
import LiveFeedViewer from "./LiveFeedViewer";

export default function CameraCard({
    camera,
    onStart,
    onStop,
    onRemove,
    busy,
}) {
    const isRunning = camera.status === "running";

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

            {/* Live Feed */}
            <div
                style={{
                    height: 300,
                    background: "#000",
                }}
            >
                <LiveFeedViewer cameraId={camera.camera_id} />
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
                            color: isRunning
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
                        marginBottom: "1rem",
                        wordBreak: "break-word",
                    }}
                >
                    Source: {String(camera.source_url)}
                </div>

                {/* Controls */}
                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                    }}
                >
                    {!isRunning ? (
                        <button
                            onClick={() => onStart(camera.camera_id)}
                            disabled={busy}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                            }}
                        >
                            <Play size={16} />
                            {busy ? "Starting..." : "Start"}
                        </button>
                    ) : (
                        <button
                            onClick={() => onStop(camera.camera_id)}
                            disabled={busy}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                            }}
                        >
                            <Square size={16} />
                            {busy ? "Stopping..." : "Stop"}
                        </button>
                    )}

                    <button
                        onClick={() => onRemove(camera.camera_id)}
                        disabled={busy || isRunning}
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
            </div>
        </div>
    );
}