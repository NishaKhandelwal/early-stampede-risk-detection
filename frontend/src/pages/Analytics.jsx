import React, { useEffect, useState } from "react";

import AnalyticsCharts from "../analytics/AnalyticsCharts";

import { getAnalytics } from "../services/analyticsService";

export default function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAnalytics();
    }, []);

    async function loadAnalytics() {
        try {
            setLoading(true);
            setError("");

            const data = await getAnalytics();

            console.log("Analytics API response:", data);

            setAnalytics(data);
        } catch (err) {
            console.error(
                "Failed to load analytics:",
                err
            );

            setError(
                err.message ||
                    "Unable to load analytics."
            );
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div>
                <h1>Analytics</h1>

                <p
                    style={{
                        color: "var(--text-secondary)",
                    }}
                >
                    Loading analytics...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1>Analytics</h1>

                <div
                    className="panel"
                    style={{
                        marginTop: "2rem",
                        padding: "1.5rem",
                    }}
                >
                    <h3>
                        Unable to load analytics
                    </h3>

                    <p
                        style={{
                            color:
                                "var(--text-secondary)",
                        }}
                    >
                        {error}
                    </p>

                    <button
                        className="button button-primary"
                        onClick={loadAnalytics}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const snapshots =
        analytics?.snapshots || [];

    if (snapshots.length === 0) {
        return (
            <div>
                <div
                    className="flex-between"
                    style={{
                        marginBottom: "2rem",
                    }}
                >
                    <div>
                        <h1 style={{ margin: 0 }}>
                            Analytics
                        </h1>

                        <p
                            style={{
                                marginTop: "0.5rem",
                                color:
                                    "var(--text-secondary)",
                            }}
                        >
                            Crowd, density, motion and
                            risk analytics
                        </p>
                    </div>
                </div>

                <div className="panel">
                    <h3>
                        No analytics data available
                    </h3>

                    <p
                        style={{
                            color:
                                "var(--text-secondary)",
                        }}
                    >
                        Process a surveillance video or
                        start a camera stream to generate
                        analytics data.
                    </p>
                </div>
            </div>
        );
    }

    const chartData = snapshots
        .slice()
        .reverse()
        .map((item, index) => ({
            frame: index + 1,

            people:
                item.people_count ?? 0,

            density:
                item.density_score ?? 0,

            motion:
                item.motion_score ?? 0,

            risk:
                item.risk_level === "HIGH RISK"
                    ? 3
                    : item.risk_level === "WARNING"
                    ? 2
                    : 1,
        }));

    return (
        <div>
            <div
                className="flex-between"
                style={{
                    marginBottom: "2rem",
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>
                        Analytics
                    </h1>

                    <p
                        style={{
                            marginTop: "0.5rem",
                            color:
                                "var(--text-secondary)",
                        }}
                    >
                        Crowd, density, motion and
                        risk analytics
                    </p>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: "20px",
                    marginTop: "30px",
                }}
            >
                <AnalyticsCharts
                    title="Crowd Count Trend"
                    data={chartData}
                    dataKey="people"
                    color="#22c55e"
                />

                <AnalyticsCharts
                    title="Density Trend"
                    data={chartData}
                    dataKey="density"
                    color="#3b82f6"
                />

                <AnalyticsCharts
                    title="Motion Trend"
                    data={chartData}
                    dataKey="motion"
                    color="#f59e0b"
                />

                <AnalyticsCharts
                    title="Risk Timeline"
                    data={chartData}
                    dataKey="risk"
                    color="#ef4444"
                />
            </div>
        </div>
    );
}