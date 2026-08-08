import React from "react";

export default function AnalyticsCharts({
    title,
    data = [],
    dataKey,
    color = "#3b82f6",
}) {
    if (!data || data.length === 0) {
        return (
            <div
                className="panel"
                style={{
                    padding: "1.5rem",
                    minHeight: "300px",
                }}
            >
                <h3 style={{ marginTop: 0 }}>
                    {title}
                </h3>

                <div
                    style={{
                        height: "220px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-secondary)",
                    }}
                >
                    No data available
                </div>
            </div>
        );
    }

    const values = data.map((item) => {
        const value = Number(item[dataKey]);
        return Number.isFinite(value) ? value : 0;
    });

    const maxValue = Math.max(...values, 1);

    const chartWidth = 700;
    const chartHeight = 250;

    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 35;

    const usableWidth =
        chartWidth - paddingLeft - paddingRight;

    const usableHeight =
        chartHeight - paddingTop - paddingBottom;

    const points = values.map((value, index) => {
        const x =
            values.length === 1
                ? paddingLeft + usableWidth / 2
                : paddingLeft +
                  (index / (values.length - 1)) *
                      usableWidth;

        const y =
            paddingTop +
            usableHeight -
            (value / maxValue) * usableHeight;

        return {
            x,
            y,
            value,
        };
    });

    const polylinePoints = points
        .map((point) => `${point.x},${point.y}`)
        .join(" ");

    return (
        <div
            className="panel"
            style={{
                padding: "1.5rem",
                minHeight: "300px",
            }}
        >
            <h3
                style={{
                    marginTop: 0,
                    marginBottom: "1rem",
                }}
            >
                {title}
            </h3>

            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                }}
            >
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    style={{
                        width: "100%",
                        minWidth: "500px",
                        height: "250px",
                    }}
                >
                    {/* Horizontal grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(
                        (fraction) => {
                            const y =
                                paddingTop +
                                usableHeight -
                                fraction *
                                    usableHeight;

                            return (
                                <line
                                    key={fraction}
                                    x1={paddingLeft}
                                    y1={y}
                                    x2={
                                        chartWidth -
                                        paddingRight
                                    }
                                    y2={y}
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="1"
                                />
                            );
                        }
                    )}

                    {/* Y axis */}
                    <line
                        x1={paddingLeft}
                        y1={paddingTop}
                        x2={paddingLeft}
                        y2={
                            chartHeight -
                            paddingBottom
                        }
                        stroke="rgba(255,255,255,0.3)"
                    />

                    {/* X axis */}
                    <line
                        x1={paddingLeft}
                        y1={
                            chartHeight -
                            paddingBottom
                        }
                        x2={
                            chartWidth -
                            paddingRight
                        }
                        y2={
                            chartHeight -
                            paddingBottom
                        }
                        stroke="rgba(255,255,255,0.3)"
                    />

                    {/* Data line */}
                    <polyline
                        points={polylinePoints}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {points.map((point, index) => (
                        <circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill={color}
                        />
                    ))}

                    {/* Latest value */}
                    {points.length > 0 && (
                        <text
                            x={
                                points[
                                    points.length - 1
                                ].x
                            }
                            y={
                                points[
                                    points.length - 1
                                ].y - 12
                            }
                            textAnchor="middle"
                            fill={color}
                            fontSize="13"
                            fontWeight="bold"
                        >
                            {
                                points[
                                    points.length - 1
                                ].value
                            }
                        </text>
                    )}
                </svg>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "var(--text-secondary)",
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                }}
            >
                <span>
                    Snapshot 1
                </span>

                <span>
                    Snapshot {data.length}
                </span>
            </div>
        </div>
    );
}