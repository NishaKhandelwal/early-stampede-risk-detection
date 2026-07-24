import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import { healthCheck } from "./services/api";//temporary addition
function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth > 768);

  useEffect(() => {
    const testBackend = async () => {
        try {
            const data = await healthCheck();
            console.log("Backend Connected:", data);
        } catch (err) {
            console.error("Backend Not Reachable", err);
        }
    };

    testBackend();
}, []);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />
        
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarExpanded && window.innerWidth <= 768 && (
          <div 
            onClick={() => setIsSidebarExpanded(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 900 }}
          />
        )}
        
        <main className="main-content" style={{ padding: '2rem', flexGrow: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/monitoring" element={<LiveMonitoring />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
