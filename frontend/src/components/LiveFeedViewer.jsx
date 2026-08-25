import { useEffect } from "react";
import { useAlertContext } from "../context/AlertContext";

function LiveFeedViewer({ cameraId }) {
    const { liveFrames } = useAlertContext();

    const frame = liveFrames?.[cameraId];

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
                    src={`data:image/jpeg;base64,${frame}`}
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