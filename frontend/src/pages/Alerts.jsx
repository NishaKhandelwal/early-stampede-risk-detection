import React, { useEffect, useState } from "react";
import {
    AlertTriangle,
    ShieldAlert,
    CheckCircle,
    Clock,
} from "lucide-react";

import {
    getAlerts,
    acknowledgeAlert,
    acknowledgeAllAlerts,
} from "../services/api";
import { useAlertContext } from "../context/AlertContext";

export default function Alerts() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acknowledging, setAcknowledging] =useState({});

    const {
        alerts: liveAlerts,
    } = useAlertContext();

    const [historyAlerts, setHistoryAlerts] = useState([]);

    // ---------------------------------------------------------
    // Load alert history from backend
    // ---------------------------------------------------------

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getAlerts({
                    limit: 50,
                });

                setHistoryAlerts(response.alerts || []);
            } catch (err) {
                console.error("Failed to load alerts:", err);
                setError("Unable to load alert history.");
            } finally {
                setLoading(false);
            }
        };

        loadAlerts();
    }, []);

    // ---------------------------------------------------------
    // Combine database alerts + newly received live alerts
    // ---------------------------------------------------------

    const allAlerts = [
        ...liveAlerts,
        ...historyAlerts,
    ];

    // Remove duplicates
    const uniqueAlerts = Array.from(
        new Map(
            allAlerts.map((alert, index) => [
                alert.id ?? `${alert.camera_id}-${alert.timestamp}-${index}`,
                alert,
            ])
        ).values()
    );
    const handleAcknowledge = async (alertId) => {
        if (!alertId) {
            return;
        }

        try {
            setAcknowledging((prev) => ({
                ...prev,
                [alertId]: true,
            }));

            await acknowledgeAlert(alertId);

            setHistoryAlerts((prev) =>
                prev.map((alert) =>
                    alert.id === alertId
                        ? {
                              ...alert,
                              acknowledged: 1,
                          }
                        : alert
                )
            );
        } catch (error) {
            console.error(
                "Failed to acknowledge alert:",
                error
            );
        } finally {
            setAcknowledging((prev) => ({
                ...prev,
                [alertId]: false,
            }));
        }
    };
    const handleAcknowledgeAll = async () => {
        try {
            await acknowledgeAllAlerts();

            setHistoryAlerts((prev) =>
                prev.map((alert) => ({
                    ...alert,
                    acknowledged: 1,
                }))
            );
        } catch (error) {
            console.error(
                "Failed to acknowledge all alerts:",
                error
            );
        }
    };

    // ---------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------

    const getAlertType = (riskLevel) => {
        if (riskLevel === "HIGH RISK") {
            return "critical";
        }

        if (riskLevel === "WARNING") {
            return "warning";
        }

        return "warning";
    };

    const getIcon = (type) => {
        if (type === "critical") {
            return (
                <ShieldAlert
                    size={24}
                    color="var(--alert-red)"
                />
            );
        }

        return (
            <AlertTriangle
                size={24}
                color="var(--accent-yellow)"
            />
        );
    };

    const formatTime = (timestamp) => {
        if (!timestamp) {
            return "Unknown time";
        }

        const date = new Date(timestamp);

        if (Number.isNaN(date.getTime())) {
            return timestamp;
        }

        return date.toLocaleString();
    };

    // ---------------------------------------------------------
    // UI
    // ---------------------------------------------------------

    return (
        <div>
            <div
                className="flex-between"
                style={{ marginBottom: "2rem" }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>
                        System Alerts
                    </h1>

                    <p
                        style={{
                            margin: "0.5rem 0 0 0",
                        }}
                    >
                        Live and historical risks detected by
                        the AI monitoring system.
                    </p>
                </div>

                <button
                  className="btn-primary"
                  style={{
                      padding: "0.5rem 1rem",
                      fontSize: "0.9rem",
                  }}
                  disabled={
                      alert.acknowledged === 1 ||
                      acknowledging[alert.id]
                  }
                  onClick={() =>
                      handleAcknowledge(alert.id)
                  }
              >
                  {alert.acknowledged === 1
                      ? "Acknowledged"
                      : "Review"}
              </button>
              <button
                  className="btn-primary"
                  style={{
                      backgroundColor: "var(--panel-grey)",
                      color: "var(--text-primary)",
                  }}
                  onClick={handleAcknowledgeAll}
              >
                  Acknowledge All
              </button>
            </div>

            <div
                className="panel"
                style={{ padding: "0" }}
            >
                {loading && (
                    <div
                        style={{
                            padding: "2rem",
                            textAlign: "center",
                            color: "var(--text-secondary)",
                        }}
                    >
                        Loading alerts...
                    </div>
                )}

                {!loading && error && (
                    <div
                        style={{
                            padding: "2rem",
                            textAlign: "center",
                            color: "var(--alert-red)",
                        }}
                    >
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    uniqueAlerts.length === 0 && (
                        <div
                            style={{
                                padding: "3rem",
                                textAlign: "center",
                                color: "var(--text-secondary)",
                            }}
                        >
                            <CheckCircle
                                size={40}
                                style={{
                                    marginBottom: "1rem",
                                }}
                            />

                            <h3>
                                No alerts detected
                            </h3>

                            <p>
                                The AI system has not detected
                                any WARNING or HIGH RISK events
                                yet.
                            </p>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    uniqueAlerts.length > 0 && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {uniqueAlerts.map(
                                (alert, index) => {
                                    const type =
                                        getAlertType(
                                            alert.risk_level
                                        );

                                    return (
                                        <div
                                            key={
                                                alert.id ??
                                                `${alert.camera_id}-${alert.timestamp}-${index}`
                                            }
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                padding:
                                                    "1.5rem",
                                                borderBottom:
                                                    index !==
                                                    uniqueAlerts.length -
                                                        1
                                                        ? "1px solid rgba(255,255,255,0.05)"
                                                        : "none",
                                                gap: "1.5rem",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    padding:
                                                        "1rem",
                                                    backgroundColor:
                                                        type ===
                                                        "critical"
                                                            ? "rgba(255,77,77,0.1)"
                                                            : "rgba(255,255,255,0.05)",
                                                    borderRadius:
                                                        "50%",
                                                }}
                                            >
                                                {getIcon(type)}
                                            </div>

                                            <div
                                                style={{
                                                    flex: 1,
                                                }}
                                            >
                                                <h4
                                                    style={{
                                                        margin:
                                                            "0 0 0.5rem 0",
                                                        color:
                                                            type ===
                                                            "critical"
                                                                ? "var(--alert-red)"
                                                                : "var(--text-primary)",
                                                    }}
                                                >
                                                    {alert.message ||
                                                        `${alert.risk_level} detected`}
                                                </h4>

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap: "1rem",
                                                        color:
                                                            "var(--text-secondary)",
                                                        fontSize:
                                                            "0.85rem",
                                                        flexWrap:
                                                            "wrap",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "0.25rem",
                                                        }}
                                                    >
                                                        <Clock
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {formatTime(
                                                            alert.timestamp
                                                        )}
                                                    </span>

                                                    <span>
                                                        •
                                                    </span>

                                                    <span>
                                                        Camera:{" "}
                                                        {alert.camera_id ||
                                                            "Unknown"}
                                                    </span>

                                                    {alert.people_count !==
                                                        undefined && (
                                                        <>
                                                            <span>
                                                                •
                                                            </span>

                                                            <span>
                                                                People:{" "}
                                                                {
                                                                    alert.people_count
                                                                }
                                                            </span>
                                                        </>
                                                    )}

                                                    <span>
                                                        •
                                                    </span>

                                                    <span>
                                                        Risk:{" "}
                                                        {
                                                            alert.risk_level
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                className="btn-primary"
                                                style={{
                                                    padding:
                                                        "0.5rem 1rem",
                                                    fontSize:
                                                        "0.9rem",
                                                }}
                                                onClick={() =>
                                                    console.log(
                                                        "Review alert:",
                                                        alert
                                                    )
                                                }
                                            >
                                                Review
                                            </button>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
            </div>
        </div>
    );
}