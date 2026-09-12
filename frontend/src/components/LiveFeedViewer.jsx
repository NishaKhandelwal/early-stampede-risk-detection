import React from "react";
import { useAlertContext } from "../context/AlertContext";

function LiveFeedViewer({ cameraId }) {
    const { liveFrames } = useAlertContext();

    const rawFrame = liveFrames?.[cameraId];

    const frame = rawFrame
        ? rawFrame.startsWith("data:image")
            ? rawFrame
            : `data:image/jpeg;base64,${rawFrame}`
        : null;
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minHeight: "280px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#111",
                overflow: "hidden",
            }}
        >
            {frame ? (
                <img
                    src={frame}
                    alt={`Live feed ${cameraId}`}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                    }}
                />
            ) : (
                <div
                    style={{
                        color: "white",
                        textAlign: "center",
                    }}
                >
                    <h3>
                        Waiting for live stream...
                    </h3>

                    <p
                        style={{
                            color: "#888",
                            fontSize: "0.85rem",
                        }}
                    >
                        {cameraId}
                    </p>
                </div>
            )}
        </div>
    );
}

export default LiveFeedViewer;