import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Clock, Sunrise, Sunset, BatteryCharging, Flame } from 'lucide-react';
import SkeletonCard from './SkeletonCard';

const SolarStation: React.FC = () => {
  const { weather, loading } = useApp();
  const [skinType, setSkinType] = useState<number>(2);

  const calculations = useMemo(() => {
    if (!weather) return { burnMinutes: 0, vitaminMinutes: 0 };
    const uv = Math.max(0.1, weather.uvIndex);
    const burnFactor = skinType === 1 ? 1 : skinType === 2 ? 2.5 : 5;
    const burnMinutes = Math.round((200 * burnFactor) / uv);
    const vitaminMinutes = Math.round(burnMinutes * 0.4);
    return { burnMinutes, vitaminMinutes };
  }, [weather, skinType]);

  const sunProgress = useMemo(() => {
    if (!weather) return 0;
    const now = new Date();
    const start = new Date(weather.sunrise).getTime();
    const end = new Date(weather.sunset).getTime();
    const current = now.getTime();
    if (current < start) return 0;
    if (current > end) return 100;
    return ((current - start) / (end - start)) * 100;
  }, [weather]);

  if (loading) return <div className="p-8 pt-safe"><SkeletonCard className="h-96 w-full" /></div>;
  if (!weather) return <div className="p-10 text-center text-slate-500 font-thin">Data unavailable.</div>;

  return (
    <div className="pt-safe px-6 space-y-6 animate-fade-in min-h-full">
       
       <div className="mt-8 mb-4">
          <h2 className="text-3xl font-light tracking-tight text-slate-800 dark:text-white">Solar Rhythm</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm tracking-wide uppercase mt-1">UV & Light Tracker</p>
       </div>

       {/* Hero Dial - Glass */}
       <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-8 rounded-[3rem] shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-teal-400 via-amber-400 to-rose-500 opacity-50"></div>
          <span className="text-6xl font-light text-slate-800 dark:text-white tracking-tighter">{weather.uvIndex.toFixed(1)}</span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest mt-2">UV Index</span>
          <div className="mt-6 w-full h-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-teal-400 via-amber-400 to-rose-500" style={{ width: `${(weather.uvIndex / 12) * 100}%` }}></div>
          </div>
       </div>

       {/* Exposure Calc - Glass */}
       <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg space-y-6">
         <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
           <Clock className="w-5 h-5" />
           <span className="font-medium">Safe Exposure</span>
         </div>
         
         <div className="flex bg-white/30 dark:bg-white/5 p-1 rounded-2xl">
           {[1, 2, 3].map((type) => (
             <button 
               key={type}
               onClick={() => setSkinType(type)} 
               className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${skinType === type ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
             >
               {type === 1 ? 'Fair' : type === 2 ? 'Medium' : 'Dark'}
             </button>
           ))}
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
               <BatteryCharging className="w-5 h-5 text-emerald-500 mb-2" />
               <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{calculations.vitaminMinutes}m</div>
               <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Vit D.</div>
            </div>
            <div className="bg-rose-50/50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
               <Flame className="w-5 h-5 text-rose-500 mb-2" />
               <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">{calculations.burnMinutes > 240 ? '4h+' : calculations.burnMinutes + 'm'}</div>
               <div className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Burn</div>
            </div>
         </div>
       </div>

       {/* Daylight Cycle - Glass */}
       <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg flex justify-between items-center">
          <div className="text-center">
             <Sunrise className="w-6 h-6 text-amber-400 mx-auto mb-1" />
             <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{new Date(weather.sunrise).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
          
          <div className="flex-1 mx-4 h-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full relative">
             <div className="absolute top-0 left-0 h-full bg-amber-400/50 rounded-full" style={{ width: `${sunProgress}%` }}></div>
             <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full shadow-sm" style={{ left: `${sunProgress}%` }}></div>
          </div>

          <div className="text-center">
             <Sunset className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
             <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{new Date(weather.sunset).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
       </div>

    </div>
  );
};

export default SolarStation;