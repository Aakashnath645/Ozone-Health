import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wind, Flower2, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { airQuality } = useApp();
  
  const navItems = [
    { to: "/", icon: Home },
    { to: "/air", icon: Wind },
    { to: "/pollen", icon: Flower2 },
    { to: "/settings", icon: Settings },
  ];

  // Calculate global background based on AQI
  const auroraGradient = useMemo(() => {
    if (!airQuality) return 'from-slate-200 to-slate-50 dark:from-slate-900 dark:to-slate-950';

    const aqi = airQuality.aqi;
    if (aqi <= 50) {
      // Good: Teal/Mint
      return 'from-teal-400 via-emerald-200 to-white dark:from-teal-900 dark:via-emerald-900 dark:to-slate-950';
    } else if (aqi <= 100) {
      // Moderate: Yellow/Orange
      return 'from-yellow-300 via-orange-200 to-white dark:from-yellow-900/80 dark:via-orange-900/80 dark:to-slate-950';
    } else {
      // Unhealthy: Rose/Violet
      return 'from-rose-400 via-violet-300 to-white dark:from-rose-900 dark:via-violet-900 dark:to-slate-950';
    }
  }, [airQuality]);

  return (
    // Outer Container (Desktop Centering)
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-black md:p-8 relative overflow-hidden">
      
      {/* Phone Frame */}
      <div className="w-full h-[100dvh] md:h-[850px] md:w-[420px] bg-white dark:bg-slate-950 md:rounded-[40px] shadow-2xl md:ring-8 ring-slate-900/5 dark:ring-slate-800 relative flex flex-col overflow-hidden transition-all duration-1000">
        
        {/* Dynamic Mesh Gradient Background */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${auroraGradient} animate-aurora bg-[length:200%_200%] transition-colors duration-[2000ms]`}
        ></div>

        {/* Scrollable Content Area - pb-32 ensures content clears floating nav */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth relative z-10">
          {children}
        </main>

        {/* Floating Glass Navigation */}
        <nav className="fixed md:absolute bottom-6 left-6 right-6 md:left-8 md:right-8 h-20 bg-white/30 dark:bg-black/30 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 dark:border-white/10 z-[90] flex items-center justify-between px-2 sm:px-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-center flex-1 h-full rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-500/70 dark:text-slate-400/70 hover:text-slate-700 dark:hover:text-slate-200"
                }`
              }
            >
              {({ isActive }) => (
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                   isActive ? "bg-white/50 dark:bg-white/10 shadow-sm backdrop-blur-md scale-105" : "group-active:scale-95"
                }`}>
                  <item.icon className="w-6 h-6" strokeWidth={2} />
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/20 dark:bg-white/20 rounded-full md:hidden pointer-events-none z-50 mb-safe"></div>
      </div>
    </div>
  );
};

export default Layout;