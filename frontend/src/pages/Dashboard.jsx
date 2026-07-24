import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertTriangle, ShieldAlert, Users, TrendingUp, X } from 'lucide-react';

import { uploadVideo } from "../services/detectionService";
export default function Dashboard() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertSector, setAlertSector] = useState(null);
  const [videoSource, setVideoSource] = useState(null);
  const [analysisResult,setAnalysisResult]=useState(null);
  const audioCtxRef = useRef(null);

  const handleVideoUpload = async (e) => {

    const file = e.target.files[0];

      if (!file) return;


      setVideoSource(URL.createObjectURL(file));


      try {

          const result = await uploadVideo(file);

          console.log(
              "AI Result:",
              result
          );

          setAnalysisResult(result);


          if (
              result.final_risk_level === "HIGH" ||
              result.final_risk_level === "WARNING"
          ) {
              triggerAlert("B");
          }


      } catch(error) {

          console.error(
              "Video processing failed",
              error
          );

      }

  };

  const playAlertSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (err) {
      console.error("Audio playback failed", err);
    }
  };

  const triggerAlert = (sectorId) => {
    setAlertSector(sectorId);
    setShowAlert(true);

    // Play alert sound multiple times to mimic a siren
    playAlertSound();
    setTimeout(playAlertSound, 600);
    setTimeout(playAlertSound, 1200);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {/* Alert Modal Pop-up */}
      {showAlert && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            backgroundColor: 'rgba(20, 20, 20, 0.98)',
            border: '2px solid rgba(255, 77, 77, 0.85)',
            borderRadius: '22px',
            padding: '1.5rem',
            width: '92%',
            maxWidth: '520px',
            textAlign: 'left',
            boxShadow: '0 0 40px rgba(0, 0, 0, 0.6)',
            animation: 'modalPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: '#ff5d5d', fontWeight: '800', letterSpacing: '0.35em', fontSize: '0.78rem' }}>ALERT</span>
              <span style={{ background: 'linear-gradient(90deg, rgba(255,77,77,0.95), rgba(255,143,143,0.95))', color: '#000', padding: '0.25rem 0.85rem', borderRadius: '999px', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.08em' }}>HIGH RISK</span>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.3)', display: 'grid', placeItems: 'center' }}>
                  <AlertTriangle size={26} color="var(--alert-red)" />
                </div>
                <div>
                  <h1 style={{ color: '#fff', margin: '0 0 0.25rem 0', fontSize: '1.35rem' }}>Sector B Alert</h1>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem' }}>Critical crowd density detected at Sector B Bridge. Immediate perimeter control advised.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(255,77,77,0.04)', border: '1px solid rgba(255,77,77,0.12)', borderRadius: '14px', padding: '0.95rem' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Location</div>
                  <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>Sector B Bridge</div>
                </div>
                <div style={{ background: 'rgba(255,77,77,0.04)', border: '1px solid rgba(255,77,77,0.12)', borderRadius: '14px', padding: '0.95rem' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Density</div>
                  <div style={{ color: '#ff9ca3', fontSize: '1rem', fontWeight: '700' }}>Extreme</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.14)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ color: '#f8fafc', fontWeight: '700' }}>Threat Vector</span>
                  <span style={{ color: '#ffb4b4', fontWeight: '700', fontSize: '0.82rem' }}>LOCKDOWN ADVISED</span>
                </div>
                <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '0.85rem' }}>
                  <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, rgba(255,77,77,0.95), rgba(255,143,143,0.95))' }}></div>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>Activate sector lockdown and reroute footfall. Maintain clear access for response teams.</p>
              </div>
            </div>

            <div className="flex-between" style={{ gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowAlert(false)}
                style={{ flex: 1, padding: '1rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.14)', color: '#e2e8f0', borderRadius: '14px', cursor: 'pointer' }}
              >
                Acknowledge
              </button>
              <button
                onClick={() => setShowAlert(false)}
                style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--alert-red)', border: 'none', color: '#fff', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}
              >
                Initiate Lockdown
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Integrated Command Centre</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Zonal Management & Live Monitoring</p>
        </div>
        <button
          className="btn-primary"
          style={{ backgroundColor: 'var(--alert-red)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => triggerAlert('B')}
        >
          <AlertTriangle size={18} /> Simulate Sector B Alert
        </button>
      </div>
      
    
      <div className="dashboard-grid">

        {/* Main Live Camera Focus */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera color="var(--accent-yellow)" size={20} /> LIVE Feed: Sector A (Main Ghat)
            </h3>
            <span style={{
              backgroundColor: 'rgba(255, 77, 77, 0.2)',
              color: 'var(--alert-red)',
              padding: '0.2rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              animation: 'pulse 2s infinite'
            }}>
              RECORDING
            </span>
          </div>

          <div style={{
            flexGrow: 1,
            backgroundColor: '#000',
            position: 'relative',
            backgroundImage: 'radial-gradient(circle at center, #111 0%, #000 100%)'
          }}>
            {/* Mock Bounding Boxes / AI detection */}
            <div style={{ position: 'absolute', top: '30%', left: '40%', width: '120px', height: '150px', border: '2px solid var(--accent-yellow)', backgroundColor: 'rgba(204, 179, 0, 0.1)' }}></div>
            <div style={{ position: 'absolute', top: '25%', left: '20%', width: '80px', height: '100px', border: '2px solid #2ecc71', backgroundColor: 'rgba(46, 204, 113, 0.1)' }}></div>

            {showAlert && (
              <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%', border: '4px solid var(--alert-red)', backgroundColor: 'rgba(255, 77, 77, 0.1)', pointerEvents: 'none' }}></div>
            )}

            {videoSource ? (
              <video
                src={videoSource}
                autoPlay
                loop
                muted
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="flex-center" style={{ height: '100%', color: 'var(--text-secondary)', flexDirection: 'column', gap: '1rem' }}>
                <span>[ Main Camera AI Feed Placeholder ]</span>
                <label className="btn-primary" style={{ cursor: 'pointer', backgroundColor: 'var(--panel-grey)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Feed Test Video
                  <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Technical Sidebar from Screenshot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>

          {/* RISK STATUS */}
          <div style={{ backgroundColor: '#0d1114', border: '1px solid #1e252b', borderRadius: '4px', padding: '1.25rem' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #1e252b', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#ffffff', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.8rem' }}>RISK STATUS</span>
              <span style={{ color: '#4a5568', letterSpacing: '1px', fontSize: '0.7rem' }}>RULE-BASED</span>
            </div>
            <h2 style={{ color: '#f6ad55', margin: '0 0 0.5rem 0', fontSize: '2rem', letterSpacing: '1px' }}>WARNING</h2>
            <p style={{ color: '#718096', margin: 0, fontSize: '0.85rem', lineHeight: '1.6' }}>
              Medium crowd density with<br />moderate/increasing movement.
            </p>
          </div>

          {/* CROWD METRICS */}
          <div style={{ backgroundColor: '#0d1114', border: '1px solid #1e252b', borderRadius: '4px', padding: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid #1e252b', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ color: '#ffffff', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.8rem' }}>CROWD METRICS</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="flex-between">
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>People count</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem' }}>42</span>
              </div>
              <div className="flex-between">
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>Density</span>
                <span style={{ color: '#4fd1c5', fontWeight: 'bold', fontSize: '0.9rem' }}>MEDIUM</span>
              </div>
              <div className="flex-between">
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>Motion score</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem' }}>3.41</span>
              </div>
            </div>
          </div>

          {/* MOTION PULSE */}
          <div style={{ backgroundColor: '#0d1114', border: '1px solid #1e252b', borderRadius: '4px', padding: '1.25rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ color: '#ffffff', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.8rem' }}>MOTION PULSE</span>
            </div>
            <div style={{ height: '50px', display: 'flex', alignItems: 'center' }}>
              <svg viewBox="0 0 200 40" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                <polyline
                  points="0,35 20,32 40,25 60,28 80,18 100,22 120,15 140,20 160,12 180,20 200,16"
                  fill="none"
                  stroke="#f6ad55"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>

          {/* ALERT LOG */}
          <div style={{ backgroundColor: '#0d1114', border: '1px solid #1e252b', borderRadius: '4px', padding: '1.25rem' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #1e252b', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ color: '#ffffff', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.8rem' }}>ALERT LOG</span>
              <span style={{ color: '#4a5568', fontSize: '0.8rem' }}>3</span>
            </div>
            <div style={{ borderLeft: '2px solid #f6ad55', paddingLeft: '1rem' }}>
              <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
                <span style={{ color: '#ffffff', fontSize: '0.85rem' }}>WARNING - moderate</span>
                <span style={{ color: '#4a5568', fontSize: '0.8rem' }}>14:21:58</span>
              </div>
              <div style={{ color: '#ffffff', fontSize: '0.85rem' }}>movement rising...</div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        @keyframes modalPop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
