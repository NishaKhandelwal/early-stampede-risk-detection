import React from 'react';
import { Camera, Maximize2 } from 'lucide-react';

export default function LiveMonitoring() {
  const cameras = [
    { id: 1, name: 'Main Entrance', status: 'Warning', density: 'High' },
    { id: 2, name: 'North Hallway', status: 'Normal', density: 'Low' },
    { id: 3, name: 'South Exit', status: 'Normal', density: 'Medium' },
    { id: 4, name: 'Food Court', status: 'Warning', density: 'High' },
  ];

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Live Monitoring</h1>
          <p style={{ margin: '0.5rem 0 0 0' }}>Real-time camera feeds with AI bounding boxes.</p>
        </div>
        <button className="btn-primary">
          <Camera size={18} /> Add Camera
        </button>
      </div>

      <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {cameras.map(cam => (
          <div key={cam.id} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ 
              height: '250px', 
              backgroundColor: '#000', 
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ opacity: 0.5 }}>Camera Feed {cam.id} Not Connected</span>
              
              {cam.status === 'Warning' && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: 'var(--accent-yellow)',
                  color: '#000',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  animation: 'pulse 2s infinite'
                }}>
                  HIGH DENSITY
                </div>
              )}
            </div>
            
            <div className="flex-between" style={{ padding: '1rem 1.5rem' }}>
              <div>
                <h4 style={{ margin: 0 }}>{cam.name}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status: {cam.status}</span>
              </div>
              <button style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-secondary)',
                cursor: 'pointer' 
              }}>
                <Maximize2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
