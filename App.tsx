import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import { Loader2 } from 'lucide-react';

// Lazy Load Pages
const Dashboard = lazy(() => import('./components/Dashboard'));
const AirLab = lazy(() => import('./components/AirLab'));
const BioGuard = lazy(() => import('./components/BioGuard'));
const SonicSanctuary = lazy(() => import('./components/SonicSanctuary'));
const Settings = lazy(() => import('./components/Settings'));

// Wrapper to access context for Splash Logic
const AppContent: React.FC = () => {
  const { loading } = useApp();
  const [splashFinished, setSplashFinished] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    // Minimum 2.5s display time
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && minTimePassed) {
      setSplashFinished(true);
    }
  }, [loading, minTimePassed]);

  return (
    <>
      <SplashScreen finish={splashFinished} />
      
      <Router>
        <Layout>
          <Suspense fallback={<div className="h-full w-full bg-slate-50"></div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/air" element={<AirLab />} />
              <Route path="/pollen" element={<BioGuard />} />
              <Route path="/noise" element={<SonicSanctuary />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </>
  );
};

const App: React.FC = () => {
  // Dynamic Manifest Injection
  useEffect(() => {
    const generateManifest = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 192;
      canvas.height = 192;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#14b8a6'; 
        ctx.beginPath();
        ctx.arc(96, 96, 96, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 100px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('O', 96, 96);
      }
      const iconUrl = canvas.toDataURL('image/png');

      const manifest = {
        name: "Ozone Health Shield",
        short_name: "Ozone",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        orientation: "portrait",
        icons: [
          {
            src: iconUrl,
            sizes: "192x192",
            type: "image/png"
          }
        ]
      };

      const stringManifest = JSON.stringify(manifest);
      const blob = new Blob([stringManifest], { type: 'application/json' });
      const manifestURL = URL.createObjectURL(blob);
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = manifestURL;
      document.head.appendChild(link);
    };

    generateManifest();
  }, []);

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;