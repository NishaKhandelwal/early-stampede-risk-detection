import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export default function Alerts() {
  const alerts = [
    { id: 1, type: 'critical', message: 'Density threshold exceeded at Main Entrance.', time: '2 mins ago', location: 'Main Entrance' },
    { id: 2, type: 'warning', message: 'Abnormal flow detected.', time: '15 mins ago', location: 'Food Court' },
    { id: 3, type: 'resolved', message: 'Crowd dispersed.', time: '1 hour ago', location: 'South Exit' },
  ];

  const getIcon = (type) => {
    if (type === 'critical') return <ShieldAlert size={24} color="var(--alert-red)" />;
    if (type === 'warning') return <AlertTriangle size={24} color="var(--accent-yellow)" />;
    return <CheckCircle size={24} color="#2ecc71" />;
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>System Alerts</h1>
          <p style={{ margin: '0.5rem 0 0 0' }}>Log of detected risks and warnings.</p>
        </div>
        <button className="btn-primary" style={{ backgroundColor: 'var(--panel-grey)', color: 'var(--text-primary)' }}>
          Acknowledge All
        </button>
      </div>

      <div className="panel" style={{ padding: '0' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {alerts.map((alert, index) => (
            <div key={alert.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '1.5rem',
              borderBottom: index !== alerts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              gap: '1.5rem'
            }}>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: alert.type === 'critical' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(255,255,255,0.05)',
                borderRadius: '50%'
              }}>
                {getIcon(alert.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: alert.type === 'critical' ? 'var(--alert-red)' : 'var(--text-primary)' }}>
                  {alert.message}
                </h4>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} /> {alert.time}
                  </span>
                  <span>•</span>
                  <span>Location: {alert.location}</span>
                </div>
              </div>

              {alert.type !== 'resolved' && (
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  Review
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
