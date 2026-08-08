import { createContext, useContext, useEffect, useState } from "react";
import socket from "../services/websocket";

const AlertContext = createContext();

export function AlertProvider({ children }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        socket.connect();

        const handleDashboardUpdate = (data) => {
            console.log("Dashboard Update:", data);
            setDashboardData(data);
        };

        const handleNewAlert = (alert) => {
            console.log("New Alert:", alert);
            setAlerts((prev) => [alert, ...prev]);
        };

        socket.on("dashboard_update", handleDashboardUpdate);
        socket.on("new_alert", handleNewAlert);

        return () => {
            socket.off("dashboard_update", handleDashboardUpdate);
            socket.off("new_alert", handleNewAlert);

            socket.disconnect();
        };
    }, []);

    return (
        <AlertContext.Provider
            value={{
                dashboardData,
                alerts,
            }}
        >
            {children}
        </AlertContext.Provider>
    );
}

export const useAlertContext = () => useContext(AlertContext);