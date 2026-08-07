import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertTriangle, ShieldAlert, Users, TrendingUp, X, Activity, ShieldCheck } from 'lucide-react';
import "./Dashboard.css";
import { useAlertContext } from "../context/AlertContext";
import { uploadVideo } from "../services/detectionService";
import socket from "../services/websocket";
export default function Dashboard() {
  const { dashboardData } = useAlertContext();
  const [showAlert, setShowAlert] = useState(false);
  const [videoSource, setVideoSource] = useState(null);
  const [alertSector, setAlertSector] = useState(null);
  const [processedVideo, setProcessedVideo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [analysisResult,setAnalysisResult]=useState(null);
  const [liveFrame, setLiveFrame] = useState(null);
  const audioCtxRef = useRef(null);
  useEffect(() => {

      socket.connect();

      socket.on("dashboard_update", (data) => {

          setAnalysisResult((prev) => ({

              ...(prev || {}),

              max_people_count:
                  data.current?.people_count ??
                  data.people_count,

              final_density_level:
                  data.current?.density_level ??
                  data.density_level,

              final_motion_level:
                  data.current?.motion_level ??
                  data.motion_level,

              final_risk_level:
                  data.current?.risk_level ??
                  data.risk_level,

              final_motion_score:
                  data.motion_score,

              risk_message:
                  data.risk_message,

              people_history:
                  data.history?.people ??
                  prev?.people_history ??
                  [],

              density_history:
                  data.history?.density ??
                  prev?.density_history ??
                  [],

              motion_history:
                  data.history?.motion ??
                  prev?.motion_history ??
                  [],

          }));

      });

      socket.on("live_frame", (frame) => {

          setLiveFrame(
              `data:image/jpeg;base64,${frame.image}`
          );

      });

      socket.on("new_alert", (alert) => {

          triggerAlert(alert.camera_id);

      });

      socket.on("processing_complete", (data) => {

          console.log("Finished:", data.camera_id);

          setProcessing(false);

      });

      return () => {

          socket.off("dashboard_update");

          socket.off("live_frame");

          socket.off("new_alert");

          socket.off("processing_complete");

          socket.disconnect();

      };

  }, []);
  
  const handleVideoUpload = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setProcessing(true);
    setProcessedVideo(null);
    setVideoSource(URL.createObjectURL(file));

    try {

        const result = await uploadVideo(file);

        console.log("AI Result:", result);

        setAnalysisResult(result);
        setProcessedVideo(result.processed_video);

        if (
            result.final_risk_level === "HIGH" ||
            result.final_risk_level === "WARNING"
        ) {
            triggerAlert("B");
        }

    } catch (error) {

        console.error("Video processing failed", error);

    } finally {

        setProcessing(false);

    }

};
  const generateMotionPoints = () => {

    if (
      !analysisResult?.motion_history ||
      analysisResult.motion_history.length === 0
    ) {
      return "0,35 200,35";
    }

    const history = analysisResult.motion_history;

    const maxValue = Math.max(...history, 1);

    return history
      .map((value, index) => {

        const x =
          (index / (history.length - 1 || 1)) * 200;

        const y =
          35 - (value / maxValue) * 25;

        return `${x},${y}`;

      })
      .join(" ");

  };
  const generatePeoplePoints = () => {

    if (!analysisResult?.people_history?.length)
      return "0,35 200,35";

    const history = analysisResult.people_history;

    const max = Math.max(...history,1);

    return history.map((value,index)=>{

        const x=(index/(history.length-1||1))*200;

        const y=35-(value/max)*25;

        return `${x},${y}`;

    }).join(" ");

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
              <span style={{ background: 'linear-gradient(90deg, rgba(255,77,77,0.95), rgba(255,143,143,0.95))', color: '#000', padding: '0.25rem 0.85rem', borderRadius: '999px', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.08em' }}>HIGH</span>
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
      
    
      <div className="dashboard-layout">

        {/* LEFT */}
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

    
          <div
            style={{
              flexGrow: 1,
              backgroundColor: "#000",
              position: "relative",
              backgroundImage: "radial-gradient(circle at center, #111 0%, #000 100%)",
            }}
          >
            {showAlert && (
              <div
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "10%",
                  right: "10%",
                  bottom: "10%",
                  border: "4px solid var(--alert-red)",
                  backgroundColor: "rgba(255, 77, 77, 0.1)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              ></div>
            )}
            {videoSource ? (
              <>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Background Video */}
                  <video
                    src={processedVideo || videoSource}
                    autoPlay
                    loop
                    muted
                    controls
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "brightness(0.82)",
                    }}
                  />

                  {/* Live AI Overlay */}
                  {processing && liveFrame && (
                    <img
                      key={liveFrame}
                      src={liveFrame}
                      alt="Live AI Overlay"
                      style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          pointerEvents: "none",
                          opacity: 1,
                          transition: "opacity 80ms linear",
                          willChange: "opacity",
                      }}
                    />
                  )}
                </div>

                {processing && (
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      width: "260px",
                      padding: "16px",
                      background: "rgba(15, 23, 42, 0.55)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "12px",
                      color: "#fff",
                      zIndex: 20,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          border: "3px solid rgba(255,255,255,0.2)",
                          borderTop: "3px solid #00e5ff",
                          borderRadius: "50%",
                          animation: "spin 0.9s linear infinite",
                        }}
                      />

                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "15px",
                          }}
                        >
                          AI Processing
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                          }}
                        >
                          Live analysis running
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <div>👤 Detecting Crowd</div>
                      <div>📊 Density Analysis</div>
                      <div>🏃 Motion Analysis</div>
                      <div>⚠ Risk Assessment</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                className="flex-center"
                style={{
                  height: "100%",
                  color: "var(--text-secondary)",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <span>[ Main Camera AI Feed ]</span>

                <label
                  className="btn-primary"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "var(--panel-grey)",
                    color: "var(--text-primary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Feed Test Video

                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}
          </div>
           
        </div>
        
        {/* RIGHT */}
        <div className="sidebar-metrics">
            
        {/* Technical Sidebar from Screenshot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {/* CROWD METRICS */}
          <div style={{ backgroundColor: '#0d1114', border: '1px solid #1e252b', borderRadius: '4px', padding: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid #1e252b', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ color: '#ffffff', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.8rem' }}>CROWD METRICS</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="flex-between">
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>People count</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem' }}>{analysisResult?.max_people_count ?? "--"}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>Density</span>
                <span style={{ color: '#4fd1c5', fontWeight: 'bold', fontSize: '0.9rem' }}>{analysisResult?.final_density_level ?? "--"}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>Motion score</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem' }}>{analysisResult?.final_motion_score != null? analysisResult.final_motion_score.toFixed(2): "--"}</span>
              </div>
              <div
              style={{
              marginTop:"1rem",
              height:"60px"
              }}
              >

              <svg
              viewBox="0 0 200 40"
              style={{
              width:"100%",
              height:"100%"
              }}
              preserveAspectRatio="none"
              >

              <polyline
              points={generatePeoplePoints()}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              />

              </svg>

              </div>
            </div>
          </div>
        </div>
          {/* RISK STATUS */}
          <div style={{ backgroundColor: '#0d1114', border: '1px solid #1e252b', borderRadius: '4px', padding: '1.25rem' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid #1e252b', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ color: '#ffffff', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.8rem' }}>RISK STATUS</span>
              <span style={{ color: '#4a5568', letterSpacing: '1px', fontSize: '0.7rem' }}>RULE-BASED</span>
            </div>
            <h2
            style={{
            color:
            analysisResult?.final_risk_level==="HIGH"
            ?"#ef4444"
            :analysisResult?.final_risk_level==="WARNING"
            ?"#f59e0b"
            :"#22c55e",

            fontSize:"2rem",

            fontWeight:"700",

            display:"flex",

            alignItems:"center",

            gap:"0.5rem"

            }}
            >

            {

            analysisResult?.final_risk_level==="HIGH"

            ?"🔴"

            :analysisResult?.final_risk_level==="WARNING"

            ?"🟡"

            :"🟢"

            }

            {analysisResult?.final_risk_level??"--"}

            </h2>
            <p style={{ color: "#718096", margin: 0, fontSize: "0.85rem", lineHeight: "1.6" }}>
              {analysisResult?.risk_message || "Upload a video to begin AI analysis."}
            </p>
          </div>

        {/* MOTION PULSE */}
        <div
          style={{
            backgroundColor: "#0d1114",
            border: "1px solid #1e252b",
            borderRadius: "4px",
            padding: "1.25rem",
          }}
        >
          <div style={{ marginBottom: "1.25rem" }}>
            <span
              style={{
                color: "#ffffff",
                letterSpacing: "2px",
                fontWeight: "bold",
                fontSize: "0.8rem",
              }}
            >
              MOTION PULSE
            </span>
          </div>

          {/* Motion Graph */}
          <div
            style={{
              height: "50px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              viewBox="0 0 200 40"
              style={{
                width: "100%",
                height: "100%",
              }}
              preserveAspectRatio="none"
            >
              <polyline
                points={generateMotionPoints()}
                fill="none"
                stroke="#f6ad55"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Current Motion */}
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
            }}
          >
            <span style={{ color: "#718096" }}>
              Current Motion
            </span>

            <span
              style={{
                color: "#ffffff",
                fontWeight: "bold",
              }}
            >
              {analysisResult?.final_motion_score?.toFixed(2) ?? "--"}
            </span>
          </div>

          {/* Motion Level */}
          <div
            style={{
              marginTop: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
            }}
          >
            <span style={{ color: "#718096" }}>
              Motion Level
            </span>

            <span
              style={{
                color:
                  analysisResult?.final_motion_level === "HIGH"
                    ? "#ef4444"
                    : analysisResult?.final_motion_level === "MEDIUM"
                    ? "#f59e0b"
                    : "#22c55e",
                fontWeight: "bold",
              }}
            >
              {analysisResult?.final_motion_level ?? "--"}
            </span>
          </div>
        </div>
        {/* ALERT LOG */}
          <div
            style={{
              backgroundColor: "#0d1114",
              border: "1px solid #1e252b",
              borderRadius: "4px",
              padding: "1.25rem",
            }}
          >
            <div
              className="flex-between"
              style={{
                borderBottom: "1px solid #1e252b",
                paddingBottom: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  letterSpacing: "2px",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                }}
              >
                ALERT LOG
              </span>

              <span
                style={{
                  color: "#64748b",
                  fontSize: "0.8rem",
                }}
              >
                {analysisResult?.risk_events?.length ?? 0}
              </span>
            </div>

            {analysisResult?.risk_events?.length > 0 ? (

              analysisResult.risk_events.map((event, index) => {

                const badgeColor =
                  event.risk_level === "HIGH"
                    ? "#ef4444"
                    : event.risk_level === "WARNING"
                    ? "#f59e0b"
                    : "#22c55e";

                return (

                  <div
                    key={index}
                    style={{
                      backgroundColor: "#11161b",
                      border: "1px solid #1f2937",
                      borderLeft: `4px solid ${badgeColor}`,
                      borderRadius: "8px",
                      padding: "1rem",
                      marginBottom: "0.9rem",
                    }}
                  >

                    <div
                      className="flex-between"
                      style={{
                        marginBottom: "0.8rem",
                        alignItems: "center",
                      }}
                    >

                      <span
                        style={{
                          backgroundColor: badgeColor,
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          letterSpacing: "0.05rem",
                        }}
                      >
                        {event.risk_level}
                      </span>

                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.8rem",
                        }}
                      >
                        Frame #{event.frame}
                      </span>

                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#e2e8f0",
                        fontSize: "0.88rem",
                      }}
                    >
                      <span>👥 People Detected</span>

                      <strong>{event.people_count}</strong>
                    </div>

                  </div>

                );

              })

            ) : (

              <div
                style={{
                  textAlign: "center",
                  padding: "1.5rem 0",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  ✅
                </div>

                <div
                  style={{
                    color: "#cbd5e1",
                    fontWeight: "600",
                  }}
                >
                  No Alerts Detected
                </div>

                <div
                  style={{
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                  }}
                >
                  Crowd conditions are currently stable.
                </div>

              </div>

            )}
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
          0% {
            transform: scale(0.9);
            opacity: 0;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
