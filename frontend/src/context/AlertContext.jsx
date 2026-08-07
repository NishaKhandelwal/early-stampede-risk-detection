import { createContext, useContext, useEffect, useState } from "react";
import socket from "../services/websocket";

const AlertContext = createContext();

export function AlertProvider({ children }) {

    const [dashboardData, setDashboardData] = useState(null);

    const [alerts, setAlerts] = useState([]);

    useEffect(() => {

        socket.connect();

        socket.on("dashboard_update", (data) => {

            setDashboardData(data);

        });

        socket.on("new_alert", (alert) => {

            setAlerts(prev => [alert, ...prev]);

        });

        return () => {

            socket.off("dashboard_update");

            socket.off("new_alert");

            socket.disconnect();

        };

    }, []);

    return (

        <AlertContext.Provider value={{
            dashboardData,
            alerts
        }}>
            {children}
        </AlertContext.Provider>

    );
}

export const useAlertContext = () => useContext(AlertContext);