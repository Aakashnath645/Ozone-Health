import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Wind, Sun, Droplets, MapPin, Activity } from 'lucide-react';
import EnvironmentalNews from './EnvironmentalNews';
import SkeletonCard from './SkeletonCard';

const Dashboard: React.FC = () => {
  const { weather, airQuality, loading, location } = useApp();

  const statusText = useMemo(() => {
    if (!airQuality) return 'Scanning...';
    if (airQuality.aqi <= 50) return 'Excellent Conditions';
    if (airQuality.aqi <= 100) return 'Moderate Air';
    return 'Limit Outdoor Time';
  }, [airQuality]);

  if (loading) return <LoadingView />;

  if (!weather || !airQuality) return <div className="p-8 text-center text-slate-800/50 dark:text-white/50 pt-32 font-thin text-2xl">Sensors Offline</div>;

  return (
    <div className="min-h-full px-6 pt-safe">
      
      {/* Editorial Header */}
      <div className="flex justify-between items-center pt-8 mb-12">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-full border border-white/40 dark:border-white/10 shadow-sm">
          <MapPin className="w-3 h-3 text-slate-700 dark:text-slate-300" />
          <span className="text-xs font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">{location.city}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/30 dark:bg-black/20 backdrop-blur-md border border-white/40 dark:border-white/10 flex items-center justify-center shadow-sm">
          <Activity className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </div>
      </div>

      {/* Hero Score - Editorial Typography */}
      <div className="flex flex-col items-center justify-center text-center mb-16 animate-fade-in">
        <div className="relative">
          <h1 className="text-[10rem] leading-none font-thin tracking-tighter text-slate-800 dark:text-white drop-shadow-sm">
            {airQuality.aqi}
          </h1>
          <span className="absolute -top-4 -right-4 text-xl font-medium text-slate-500 dark:text-slate-400">AQI</span>
        </div>
        <p className="mt-4 text-lg font-medium text-slate-700/80 dark:text-slate-200 tracking-wide">
          {statusText}
        </p>
      </div>

      {/* Glassmorphic Grid */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Weather Card */}
        <div className="group bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg flex flex-col justify-between h-48 active:scale-95 transition-transform duration-300">
           <div className="flex justify-between items-start">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center shadow-inner">
                <Sun className="w-6 h-6 text-amber-500" />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Temp</span>
           </div>
           <div>
             <div className="text-5xl font-thin tracking-tighter text-slate-800 dark:text-white">
               {Math.round(weather.temperature)}°
             </div>
             <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">Clear Sky</div>
           </div>
        </div>

        {/* UV Card */}
        <div className="group bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg flex flex-col justify-between h-48 active:scale-95 transition-transform duration-300">
           <div className="flex justify-between items-start">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner bg-gradient-to-br ${weather.uvIndex > 5 ? 'from-rose-100 to-rose-50' : 'from-teal-100 to-teal-50'}`}>
                <span className={`font-bold text-sm ${weather.uvIndex > 5 ? 'text-rose-600' : 'text-teal-600'}`}>UV</span>
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Index</span>
           </div>
           <div>
             <div className="text-5xl font-thin tracking-tighter text-slate-800 dark:text-white">
               {weather.uvIndex.toFixed(0)}
             </div>
             <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
               {weather.uvIndex > 5 ? 'High Exposure' : 'Safe Levels'}
             </div>
           </div>
        </div>

        {/* Detailed Stats Strip */}
        <div className="col-span-2 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-5 rounded-[2rem] shadow-lg flex items-center justify-around active:scale-[0.98] transition-transform duration-300">
           <div className="flex flex-col items-center gap-1">
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-1">
               <Droplets className="w-5 h-5 text-blue-500" />
             </div>
             <span className="text-xl font-light text-slate-800 dark:text-white">{weather.humidity}%</span>
             <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Humidity</span>
           </div>
           
           <div className="w-[1px] h-12 bg-slate-500/10 dark:bg-white/10"></div>
           
           <div className="flex flex-col items-center gap-1">
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center mb-1">
               <Wind className="w-5 h-5 text-slate-600" />
             </div>
             <span className="text-xl font-light text-slate-800 dark:text-white">{weather.windSpeed}</span>
             <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Wind km/h</span>
           </div>
        </div>
        
        <div className="col-span-2">
          <EnvironmentalNews />
        </div>
      </div>
    </div>
  );
};

const LoadingView = () => (
  <div className="min-h-full px-6 pt-safe">
    <div className="h-64 flex items-center justify-center mb-12">
       <div className="w-48 h-48 rounded-full border-4 border-white/20 border-t-white/80 animate-spin"></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <SkeletonCard className="h-48 w-full" />
      <SkeletonCard className="h-48 w-full" />
      <SkeletonCard className="h-24 col-span-2 w-full" />
    </div>
  </div>
);

export default Dashboard;