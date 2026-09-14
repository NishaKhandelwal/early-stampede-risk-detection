import React, { useState, useEffect, useRef } from 'react';
import { Camera, AlertTriangle, ShieldAlert, Users, TrendingUp, X, Activity, ShieldCheck } from 'lucide-react';
import "./Dashboard.css";
import { useAlertContext } from "../context/AlertContext";
import { getCameras } from "../services/cameraService";
export default function Dashboard() {
  const { dashboardData, liveFrames, alerts } = useAlertContext();
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertSector, setAlertSector] = useState(null);
  const [liveAnalysis, setLiveAnalysis] = useState(null);
  const displayAnalysis = liveAnalysis;
  const MAIN_CAMERA_ID = selectedCameraId;
  const mainCameraData =
    MAIN_CAMERA_ID
      ? dashboardData?.[MAIN_CAMERA_ID] || null
      : null;

  const mainLiveFrame =
    MAIN_CAMERA_ID
      ? liveFrames?.[MAIN_CAMERA_ID] || null
      : null;

  const selectedCamera =
    cameras.find(
      (camera) => camera.camera_id === MAIN_CAMERA_ID
    ) || null;
  const runningCameras = cameras.filter(
    (camera) => camera.status === "running"
  );

  const camerasOnline = runningCameras.length;

  const totalPeopleDetected = runningCameras.reduce(
    (total, camera) => {
      const data = dashboardData?.[camera.camera_id];

      const people =
        data?.current?.people_count ??
        data?.people_count ??
        0;

      return total + people;
    },
    0
  );

  const recentAlertCount = alerts.length;
  const currentRisk =
    mainCameraData?.current?.risk_level ??
    mainCameraData?.risk_level ??
    displayAnalysis?.final_risk_level ??
    "LOW";

  const currentDensity =
    mainCameraData?.current?.density_level ??
    mainCameraData?.density_level ??
    displayAnalysis?.final_density_level ??
    "LOW";

  const currentMotion =
    mainCameraData?.current?.motion_level ??
    mainCameraData?.motion_level ??
    displayAnalysis?.final_motion_level ??
    "LOW";

  const currentPeople =
    mainCameraData?.current?.people_count ??
    mainCameraData?.people_count ??
    displayAnalysis?.max_people_count ??
    0;
  const getRiskRecommendation = (risk) => {
    switch (String(risk).toUpperCase()) {
      case "WARNING":
      case "MEDIUM":
        return "Monitor the area and control crowd flow if required.";

      case "HIGH":
        return "Immediate attention required. Monitor the area and manage crowd movement.";

      case "CRITICAL":
      case "EXTREME":
        return "Critical crowd condition detected. Initiate appropriate emergency response procedures.";

      default:
        return "Crowd conditions are currently stable.";
    }
  };

  const getRiskColor = (risk) => {
    switch (String(risk).toUpperCase()) {
      case "CRITICAL":
      case "EXTREME":
      case "HIGH":
        return "#ef4444";

      case "WARNING":
      case "MEDIUM":
        return "#f59e0b";

      default:
        return "#22c55e";
    }
  };

  const currentRiskColor = getRiskColor(currentRisk);
  const riskRecommendation = getRiskRecommendation(currentRisk);
  const mainLiveFrameSrc =
    mainLiveFrame
      ? mainLiveFrame.startsWith("data:image")
        ? mainLiveFrame
        : `data:image/jpeg;base64,${mainLiveFrame}`
      : null;

  const audioCtxRef = useRef(null);
  useEffect(() => {
    let mounted = true;

    const loadCameras = async () => {
      try {
        const data = await getCameras();

        const cameraList = Array.isArray(data)
          ? data
          : data?.cameras || [];

        if (!mounted) return;

        setCameras(cameraList);

        setSelectedCameraId((current) => {
          if (
            current &&
            cameraList.some(
              (camera) => camera.camera_id === current
            )
          ) {
            return current;
          }

          const runningCamera = cameraList.find(
            (camera) => camera.status === "running"
          );

          if (runningCamera) {
            return runningCamera.camera_id;
          }

          return cameraList[0]?.camera_id || "";
        });
      } catch (error) {
        console.error(
          "Failed to load cameras for dashboard:",
          error
        );

        if (mounted) {
          setCameras([]);
        }
      }
    };

    loadCameras();

    const interval = setInterval(loadCameras, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
  useEffect(() => {
    if (!mainCameraData) return;

    const data = mainCameraData;

    setLiveAnalysis((prev) => ({
        ...(prev || {}),

        max_people_count:
            data.current?.people_count ??
            data.people_count ??
            prev?.max_people_count ??
            0,

        final_density_level:
            data.current?.density_level ??
            data.density_level ??
            prev?.final_density_level ??
            "LOW",

        final_motion_level:
            data.current?.motion_level ??
            data.motion_level ??
            prev?.final_motion_level ??
            "LOW",

        final_risk_level:
            data.current?.risk_level ??
            data.risk_level ??
            prev?.final_risk_level ??
            "LOW",

        final_motion_score:
            data.motion_score ??
            data.current?.motion_score ??
            prev?.final_motion_score ??
            0,

        risk_message:
            data.risk_message ??
            data.current?.risk_message ??
            prev?.risk_message,

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

        risk_events:
            data.risk_events ??
            prev?.risk_events ??
            [],
    }));
}, [mainCameraData]);
  const generateMotionPoints = () => {

    if (
      !displayAnalysis?.motion_history ||
      displayAnalysis.motion_history.length === 0
    ) {
      return "0,35 200,35";
    }

    const history = displayAnalysis.motion_history;

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

    if (!displayAnalysis?.people_history?.length)
      return "0,35 200,35";

    const history = displayAnalysis.people_history;

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
          <div
            style={{
              backgroundColor: "rgba(20, 20, 20, 0.98)",
              border: `2px solid ${currentRiskColor}`,
              borderRadius: "22px",
              padding: "1.5rem",
              width: "92%",
              maxWidth: "520px",
              textAlign: "left",
              boxShadow: "0 0 40px rgba(0, 0, 0, 0.6)",
              animation:
                "modalPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <span
                style={{
                  color: currentRiskColor,
                  fontWeight: "800",
                  letterSpacing: "0.25em",
                  fontSize: "0.78rem",
                }}
              >
                SYSTEM ALERT
              </span>

              <span
                style={{
                  background: currentRiskColor,
                  color: "#000",
                  padding: "0.25rem 0.85rem",
                  borderRadius: "999px",
                  fontWeight: "700",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                }}
              >
                {currentRisk}
              </span>
            </div>

            {/* Camera information */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  backgroundColor: `${currentRiskColor}1F`,
                  border: `1px solid ${currentRiskColor}55`,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <AlertTriangle
                  size={26}
                  color={currentRiskColor}
                />
              </div>

              <div>
                <h1
                  style={{
                    color: "#fff",
                    margin: "0 0 0.25rem 0",
                    fontSize: "1.35rem",
                  }}
                >
                  {MAIN_CAMERA_ID || "Selected Camera"}
                </h1>

                <p
                  style={{
                    margin: 0,
                    color: "#cbd5e1",
                    fontSize: "0.9rem",
                  }}
                >
                  {selectedCamera?.status === "running"
                    ? "Live surveillance alert"
                    : "Camera is not currently running"}
                </p>
              </div>
            </div>

            {/* Current metrics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "0.9rem",
                }}
              >
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    marginBottom: "0.4rem",
                  }}
                >
                  PEOPLE
                </div>

                <div
                  style={{
                    color: "#fff",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                  }}
                >
                  {currentPeople}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "0.9rem",
                }}
              >
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    marginBottom: "0.4rem",
                  }}
                >
                  DENSITY
                </div>

                <div
                  style={{
                    color: "#fff",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                  }}
                >
                  {currentDensity}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "0.9rem",
                }}
              >
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    marginBottom: "0.4rem",
                  }}
                >
                  MOTION
                </div>

                <div
                  style={{
                    color: "#fff",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                  }}
                >
                  {currentMotion}
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div
              style={{
                background: `${currentRiskColor}0D`,
                border: `1px solid ${currentRiskColor}33`,
                borderRadius: "14px",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  color: "#f8fafc",
                  fontWeight: "700",
                  marginBottom: "0.5rem",
                }}
              >
                Recommended Action
              </div>

              <p
                style={{
                  color: "#cbd5e1",
                  fontSize: "0.9rem",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                {riskRecommendation}
              </p>
            </div>

            {/* Actions */}
            <div
              className="flex-between"
              style={{
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button
                onClick={() => setShowAlert(false)}
                style={{
                  flex: 1,
                  padding: "1rem",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "#e2e8f0",
                  borderRadius: "14px",
                  cursor: "pointer",
                }}
              >
                Acknowledge
              </button>

              <button
                onClick={() => setShowAlert(false)}
                style={{
                  flex: 1,
                  padding: "1rem",
                  backgroundColor: currentRiskColor,
                  border: "none",
                  color: "#fff",
                  borderRadius: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Close Alert
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Integrated Command Centre</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
            Zonal Management & Live Monitoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>

          {cameras.length > 0 && (
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              style={{
                background: "#0d1114",
                color: "#fff",
                border: "1px solid #1e252b",
                borderRadius: "8px",
                padding: "0.65rem 0.9rem",
                outline: "none",
              }}
            >
              {cameras.map((camera) => (
                <option
                  key={camera.camera_id}
                  value={camera.camera_id}
                >
                  {camera.camera_id}
                </option>
              ))}
            </select>
          )}

          <button
            className="btn-primary"
            style={{
              backgroundColor: 'var(--alert-red)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onClick={() => triggerAlert('B')}
          >
            <AlertTriangle size={18} /> Test Demo Alert
          </button>

        </div>
      </div>
      {/* ================================= */}
      {/* Dashboard — SYSTEM STATUS */}
      {/* ================================= */}

      <div
        className="panel"
        style={{
          marginBottom: "1.5rem",
          padding: "1.25rem 1.5rem",
        }}
      >
        <div
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
            SYSTEM STATUS
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >

          {/* CAMERAS ONLINE */}
          <div>
            <div
              style={{
                color: "#718096",
                fontSize: "0.8rem",
                marginBottom: "0.35rem",
              }}
            >
              CAMERAS ONLINE
            </div>

            <div
              style={{
                color: "#22c55e",
                fontSize: "1.8rem",
                fontWeight: "700",
              }}
            >
              {camerasOnline}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "0.75rem",
              }}
            >
              of {cameras.length} registered
            </div>
          </div>


          {/* PEOPLE DETECTED */}
          <div>
            <div
              style={{
                color: "#718096",
                fontSize: "0.8rem",
                marginBottom: "0.35rem",
              }}
            >
              PEOPLE DETECTED
            </div>

            <div
              style={{
                color: "#ffffff",
                fontSize: "1.8rem",
                fontWeight: "700",
              }}
            >
              {totalPeopleDetected}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "0.75rem",
              }}
            >
              across online cameras
            </div>
          </div>


          {/* RECENT ALERTS */}
          <div>
            <div
              style={{
                color:
                  recentAlertCount > 0
                    ? "#ef4444"
                    : "#22c55e",
                fontSize: "0.8rem",
                marginBottom: "0.35rem",
              }}
            >
              RECENT ALERTS
            </div>

            <div
              style={{
                color:
                  recentAlertCount > 0
                    ? "#ef4444"
                    : "#22c55e",
                fontSize: "1.8rem",
                fontWeight: "700",
              }}
            >
              {recentAlertCount}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "0.75rem",
              }}
            >
              detected this session
            </div>
          </div>

        </div>
      </div>
    
      <div className="dashboard-layout">

        {/* LEFT */}
        {/* Main Live Camera Focus */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera color="var(--accent-yellow)" size={20} />LIVE Feed: {MAIN_CAMERA_ID}
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
              {selectedCamera?.status === "running"
                ? "ONLINE"
                : selectedCamera?.status?.toUpperCase() || "OFFLINE"}
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
            {mainLiveFrameSrc ? (
              <div
                  style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                  }}
              >
                  <img
                      key={mainLiveFrameSrc}
                      src={mainLiveFrameSrc}
                      alt={`Live AI Feed ${MAIN_CAMERA_ID}`}
                      style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "brightness(0.82)",
                      }}
                  />

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
                      />
                  )}

                  <div
                      style={{
                          position: "absolute",
                          top: "20px",
                          left: "20px",
                          padding: "0.5rem 0.8rem",
                          background: "rgba(0,0,0,0.65)",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          zIndex: 3,
                      }}
                  >
                      LIVE · {MAIN_CAMERA_ID}
                  </div>
              </div>
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
                  <Camera size={36} style={{ opacity: 0.5 }} />

                  <span>
                      No live feed available for {MAIN_CAMERA_ID || "selected camera"}
                  </span>

                  <span
                      style={{
                          fontSize: "0.8rem",
                          color: "#64748b",
                      }}
                  >
                      Start the camera from Live Monitoring.
                  </span>
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
                <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem' }}>{displayAnalysis?.max_people_count ?? "--"}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>Density</span>
                <span style={{ color: '#4fd1c5', fontWeight: 'bold', fontSize: '0.9rem' }}>{displayAnalysis?.final_density_level ?? "--"}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: '#718096', fontSize: '0.9rem' }}>Motion score</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem' }}>{displayAnalysis?.final_motion_score != null? displayAnalysis.final_motion_score.toFixed(2): "--"}</span>
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
            displayAnalysis?.final_risk_level==="HIGH"
            ?"#ef4444"
            :displayAnalysis?.final_risk_level==="WARNING"
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

            displayAnalysis?.final_risk_level==="HIGH"

            ?"🔴"

            :displayAnalysis?.final_risk_level==="WARNING"

            ?"🟡"

            :"🟢"

            }

            {displayAnalysis?.final_risk_level??"--"}

            </h2>
            <p style={{ color: "#718096", margin: 0, fontSize: "0.85rem", lineHeight: "1.6" }}>
              {displayAnalysis?.risk_message || "Upload a video to begin AI analysis."}
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
              {displayAnalysis?.final_motion_score?.toFixed(2) ?? "--"}
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
                  displayAnalysis?.final_motion_level === "HIGH"
                    ? "#ef4444"
                    : displayAnalysis?.final_motion_level === "MEDIUM"
                    ? "#f59e0b"
                    : "#22c55e",
                fontWeight: "bold",
              }}
            >
              {displayAnalysis?.final_motion_level ?? "--"}
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
                {displayAnalysis?.risk_events?.length ?? 0}
              </span>
            </div>

            {displayAnalysis?.risk_events?.length > 0 ? (

              displayAnalysis.risk_events.map((event, index) => {

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
      {/* ================================= */}
      {/* CAMERA OVERVIEW */}
      {/* ================================= */}

      <div
        className="panel"
        style={{
          marginTop: "1.5rem",
          padding: "1.25rem",
        }}
      >
        <div
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
            CAMERA OVERVIEW
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
          }}
        >
          {cameras.length === 0 ? (
            <div
              style={{
                color: "#64748b",
                padding: "1rem 0",
              }}
            >
              No cameras registered.
            </div>
          ) : (
            cameras.map((camera) => {
              const data =
                dashboardData?.[camera.camera_id];

              const people =
                data?.current?.people_count ??
                data?.people_count ??
                0;

              const risk =
                data?.current?.risk_level ??
                data?.risk_level ??
                "LOW";

              const isRunning =
                camera.status === "running";

              return (
                <button
                  key={camera.camera_id}
                  onClick={() =>
                    setSelectedCameraId(
                      camera.camera_id
                    )
                  }
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(150px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(90px, 0.7fr)",
                    gap: "1rem",
                    alignItems: "center",
                    padding: "0.9rem 1rem",
                    background:
                      camera.camera_id ===
                      selectedCameraId
                        ? "rgba(59, 130, 246, 0.08)"
                        : "#11161b",
                    border:
                      camera.camera_id ===
                      selectedCameraId
                        ? "1px solid rgba(59,130,246,0.35)"
                        : "1px solid #1f2937",
                    borderRadius: "8px",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >

                  <span style={{ fontWeight: "700" }}>
                    {camera.camera_id}
                  </span>

                  <span
                    style={{
                      color: isRunning
                        ? "#22c55e"
                        : "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    ●{" "}
                    {isRunning
                      ? "ONLINE"
                      : String(
                          camera.status ||
                            "OFFLINE"
                        ).toUpperCase()}
                  </span>

                  <span style={{ color: "#cbd5e1" }}>
                    👥 {people} people
                  </span>

                  <span
                    style={{
                      color:
                        risk === "HIGH"
                          ? "#ef4444"
                          : risk === "WARNING"
                          ? "#f59e0b"
                          : "#22c55e",
                      fontWeight: "700",
                    }}
                  >
                    {risk}
                  </span>

                </button>
              );
            })
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
