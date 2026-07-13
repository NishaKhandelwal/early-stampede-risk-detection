import React from 'react';
import { Download } from 'lucide-react';

export default function Analytics() {
    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Analytics & Reports</h1>
                    <p style={{ margin: '0.5rem 0 0 0' }}>Historical data, trends, and risk assessments.</p>
                </div>
                <button className="btn-primary">
                    <Download size={18} /> Export Data
                </button>
            </div>

            <div className="grid-layout">
                <div className="panel" style={{ minHeight: '400px', gridColumn: '1 / -1' }}>
                    <h3>Weekly Peak Density Trends</h3>
                    <div className="flex-center" style={{ height: '300px', color: 'var(--text-secondary)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius)' }}>
                        [ Main Chart Area Placeholder ]
                    </div>
                </div>

                <div className="panel">
                    <h3>High Risk Zones</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0' }}>
                        <li className="flex-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span>Main Entrance</span>
                            <span style={{ color: 'var(--accent-yellow)', fontWeight: 'bold' }}>42 Incidents</span>
                        </li>
                        <li className="flex-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span>Food Court</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>18 Incidents</span>
                        </li>
                        <li className="flex-between" style={{ padding: '0.75rem 0' }}>
                            <span>South Exit</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>5 Incidents</span>
                        </li>
                    </ul>
                </div>

                <div className="panel">
                    <h3>Average Clear Time</h3>
                    <div className="flex-center" style={{ height: '100%', flexDirection: 'column' }}>
                        <h1 style={{ margin: 0, fontSize: '3rem', color: 'var(--accent-yellow)' }}>4.5</h1>
                        <p>Minutes</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
