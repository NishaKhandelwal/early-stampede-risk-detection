import React from "react";
import { Maximize2 } from "lucide-react";
import LiveFeedViewer from "../components/LiveFeedViewer";

export default function LiveMonitoring() {
    return (
        <div>

            <div
                className="flex-between"
                style={{ marginBottom: "2rem" }}
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
            </div>

            <div
                className="grid-layout"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(450px,1fr))",
                }}
            >
                <CameraCard
                    title="Sector A"
                    cameraId="uploaded-video"
                />

                <CameraCard
                    title="Sector B"
                    cameraId="cam-2"
                />

                <CameraCard
                    title="Sector C"
                    cameraId="cam-3"
                />

                <CameraCard
                    title="Sector D"
                    cameraId="cam-4"
                />
            </div>

        </div>
    );
}

function CameraCard({ title }) {

    return (

        <div
            className="panel"
            style={{
                overflow: "hidden",
                padding: 0,
            }}
        >

            <div
                className="flex-between"
                style={{
                    padding: "1rem",
                }}
            >

                <h3>{title}</h3>

                <Maximize2 />

            </div>

            <div
                style={{
                    height: 300,
                    background: "#000",
                }}
            >
                <LiveFeedViewer cameraId={title === "Sector A" ? "uploaded-video" : title} />
            </div>

        </div>

    );
}