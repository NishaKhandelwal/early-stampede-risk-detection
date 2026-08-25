import { createContext, useContext, useEffect, useState } from "react";
import socket from "../services/websocket";

const AlertContext = createContext();

export function AlertProvider({ children }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [liveFrames, setLiveFrames] = useState({});
    const [processingStatus, setProcessingStatus] = useState({});

    useEffect(() => {
        const handleDashboardUpdate = (data) => {
            console.log("Dashboard Update:", data);

            setDashboardData(data);
        };

        const handleNewAlert = (alert) => {
            console.log("New Alert:", alert);

            setAlerts((prev) => [alert, ...prev]);
        };

        const handleLiveFrame = (data) => {
            if (!data?.camera_id || !data?.image) {
                return;
            }

            setLiveFrames((prev) => ({
                ...prev,
                [data.camera_id]: data.image,
            }));
        };

        const handleProcessingComplete = (data) => {
            console.log(
                "Processing Complete:",
                data?.camera_id
            );

            if (data?.camera_id) {
                setProcessingStatus((prev) => ({
                    ...prev,
                    [data.camera_id]: false,
                }));
            }
        };

        socket.on("dashboard_update", handleDashboardUpdate);
        socket.on("new_alert", handleNewAlert);
        socket.on("live_frame", handleLiveFrame);
        socket.on(
            "processing_complete",
            handleProcessingComplete
        );

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off(
                "dashboard_update",
                handleDashboardUpdate
            );

            socket.off(
                "new_alert",
                handleNewAlert
            );

            socket.off(
                "live_frame",
                handleLiveFrame
            );

            socket.off(
                "processing_complete",
                handleProcessingComplete
            );

            // IMPORTANT:
            // Do NOT socket.disconnect() here.
        };
    }, []);

    return (
        <AlertContext.Provider
            value={{
                dashboardData,
                alerts,
                liveFrames,
                processingStatus,
            }}
        >
            {children}
        </AlertContext.Provider>
    );
}

export const useAlertContext = () =>
    useContext(AlertContext);