import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { AlertCircle, Wind, CloudFog, ShieldAlert } from 'lucide-react';
import NearbyRelief from './NearbyRelief';
import SkeletonCard from './SkeletonCard';

const AirLab: React.FC = () => {
  const { airQuality, loading, sensitiveMode } = useApp();
  
  // State to hold the exact pixel size of the chart area
  const [chartDims, setChartDims] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure the container size explicitly. 
  // We DO NOT use ResponsiveContainer to avoid the width(-1) crash.
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          const { width, height } = entry.contentRect;
          // Only update if we have valid dimensions
          if (width > 0 && height > 0) {
            // Wrap in rAF to avoid "ResizeObserver loop limit exceeded"
            requestAnimationFrame(() => {
              setChartDims({ width, height });
            });
          }
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [loading]);

  if (loading) return <div className="p-8 pt-safe"><SkeletonCard className="h-96 w-full" /></div>;
  if (!airQuality) return <div className="p-10 text-center text-slate-500 font-thin">Data unavailable.</div>;

  const pm25Threshold = sensitiveMode ? 25 : 35;
  const isLungRisk = airQuality.pm25 > pm25Threshold;

  const data = [
    { name: 'PM2.5', value: airQuality.pm25, limit: 15 },
    { name: 'PM10', value: airQuality.pm10, limit: 45 },
    { name: 'NO2', value: airQuality.no2, limit: 25 },
    { name: 'O3', value: airQuality.o3, limit: 100 },
  ];

  const getBarColor = (val: number, limit: number) => {
    if (val <= limit) return '#14b8a6'; 
    if (val <= limit * 1.5) return '#f59e0b';
    return '#f43f5e';
  };

  return (
    <div className="pt-safe px-6 space-y-6 animate-fade-in min-h-full">
       
       <div className="mt-8 mb-4">
          <h2 className="text-3xl font-light tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            Deep Breath <Wind className="w-6 h-6 text-teal-600 dark:text-teal-400 opacity-80" />
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm tracking-wide uppercase mt-1">Air Quality Breakdown</p>
       </div>

       {isLungRisk && (
         <div className="bg-rose-50/50 dark:bg-rose-900/20 backdrop-blur-md p-6 rounded-[2rem] flex items-start gap-4 shadow-sm border border-rose-200 dark:border-rose-900/50">
           <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0" />
           <div>
             <h3 className="text-lg font-medium text-rose-800 dark:text-rose-200">Lung Risk Warning</h3>
             <p className="text-rose-600 dark:text-rose-300 mt-1 text-sm leading-relaxed">
               PM2.5 is high ({airQuality.pm25}). Consider wearing a mask outdoors.
             </p>
           </div>
         </div>
       )}

       {/* Chart Card */}
       <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg">
         <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Pollutants</h3>
         
         {/* 
            Container serves as the measurement target. 
            Fixed height ensures it has size even before content loads.
         */}
         <div ref={containerRef} className="w-full h-64 relative min-w-0">
           {chartDims.width > 0 && chartDims.height > 0 ? (
             <BarChart 
                width={chartDims.width} 
                height={chartDims.height} 
                data={data} 
                layout="vertical" 
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
             >
                 <XAxis type="number" hide />
                 <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#94a3b8" 
                    width={45} 
                    tick={{fontSize: 12, fill: 'currentColor'} as any} 
                    className="text-slate-500 dark:text-slate-400"
                    tickLine={false} 
                    axisLine={false} 
                 />
                 <Tooltip 
                    cursor={{fill: 'transparent'} as any} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.8)' }} 
                 />
                 <Bar 
                   dataKey="value" 
                   radius={[0, 12, 12, 0] as any} 
                   barSize={24} 
                   background={{ fill: 'rgba(200,200,200,0.1)', radius: [0, 12, 12, 0] as any }}
                 >
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={getBarColor(entry.value, entry.limit)} />
                   ))}
                 </Bar>
             </BarChart>
           ) : (
             // Placeholder while measuring
             <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full animate-pulse mx-4"></div>
             </div>
           )}
         </div>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg">
             <CloudFog className="w-6 h-6 text-slate-500 dark:text-slate-400 mb-2" />
             <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dominant</div>
             <div className="text-xl font-bold text-slate-800 dark:text-white mt-1">{airQuality.dominant}</div>
          </div>
          <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg">
             <AlertCircle className="w-6 h-6 text-slate-500 dark:text-slate-400 mb-2" />
             <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</div>
             <div className="text-xl font-bold text-slate-800 dark:text-white mt-1">
               {airQuality.aqi > 50 ? 'Careful' : 'Good'}
             </div>
          </div>
       </div>

       <NearbyRelief />
    </div>
  );
};

export default AirLab;