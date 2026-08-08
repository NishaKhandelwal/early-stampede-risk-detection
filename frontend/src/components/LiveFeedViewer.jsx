import { useEffect, useState } from "react";
import socket from "../services/websocket";

function LiveFeedViewer({ cameraId }) {
    const [frame, setFrame] = useState(null);

    useEffect(() => {
        // Connect only once
        if (!socket.connected) {
            socket.connect();
        }

        // Receive annotated frames
        const handleFrame = (data) => {

            if (data.camera_id !== cameraId) return;

            setFrame(data.image);

        };

        // Video finished processing
        const handleComplete = (data) => {
            console.log("Video Finished:", data.camera_id);
            alert("Video processing completed.");
        };

        // Register listeners
        socket.on("live_frame", handleFrame);
        socket.on("processing_complete", handleComplete);

        // Cleanup when component unmounts
        return () => {
            socket.off("live_frame", handleFrame);
            socket.off("processing_complete", handleComplete);
        };
    }, [cameraId]);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#111",
            }}
        >
            {frame ? (
                <img
                    src={`data:image/jpeg;base64,${frame}`}
                    alt="Live Feed"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                    }}
                />
            ) : (
                <h3 style={{ color: "white" }}>
                    Waiting for live stream...
                </h3>
            )}
        </div>
    );
}

export default LiveFeedViewer;