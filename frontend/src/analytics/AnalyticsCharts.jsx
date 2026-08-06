import React from "react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

import "./AnalyticsCharts.css";

export default function AnalyticsCharts({

    title,
    data,
    dataKey,
    color

}) {

    return (

        <div className="chart-card">

            <h3>{title}</h3>

            <ResponsiveContainer
                width="100%"
                height={260}
            >

                <LineChart data={data}>

                    <CartesianGrid
                        stroke="#222"
                    />

                    <XAxis
                        dataKey="frame"
                        tick={{fill:"#999"}}
                    />

                    <YAxis
                        tick={{fill:"#999"}}
                    />

                    <Tooltip/>

                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={3}
                        dot={false}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );

}