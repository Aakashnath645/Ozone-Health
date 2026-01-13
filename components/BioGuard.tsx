import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Flower2, Wind, ShieldCheck, AlertTriangle } from 'lucide-react';
import SkeletonCard from './SkeletonCard';

const BioGuard: React.FC = () => {
  const { pollen, loading, sensitiveMode } = useApp();

  // 1. Calculate Allergy Risk & Sneeze Score
  const { riskLevel, advice, visualConfig } = useMemo(() => {
    if (!pollen) return { riskLevel: 'Low', advice: '', visualConfig: { count: 10, speed: '20s' } };

    const max = pollen.maxPollen;
    // Lower threshold if sensitive mode is on
    const thresholdModerate = sensitiveMode ? 15 : 30;
    const thresholdHigh = sensitiveMode ? 60 : 100;

    let level = 'Low';
    let adv = 'Air is clear. Good for outdoor walks.';
    let config = { count: 8, speed: '20s' };

    if (max > thresholdHigh) {
      level = 'High';
      adv = 'High Pollen Count. Keep windows closed.';
      config = { count: 80, speed: '5s' };
    } else if (max > thresholdModerate) {
      level = 'Moderate';
      adv = 'Pollen is present. Carry tissues.';
      config = { count: 35, speed: '10s' };
    }

    return { riskLevel: level, advice: adv, visualConfig: config };
  }, [pollen, sensitiveMode]);

  // 2. Generate Random Particles
  const particles = useMemo(() => {
    return Array.from({ length: visualConfig.count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 6 + 2, // 2px to 8px
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 5 + 's', // randomized duration
    }));
  }, [visualConfig.count]);

  if (loading) return <div className="p-8 pt-safe"><SkeletonCard className="h-96 w-full" /></div>;
  if (!pollen) return <div className="p-10 text-center text-slate-500 font-thin">Data unavailable.</div>;

  return (
    <div className="relative min-h-full">
      
      {/* PARTICLE FIELD VISUALIZER - Absolute to parent, overflow hidden handled by masking in Layout or by keeping particles within bounds */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white/40 dark:bg-white/10 blur-[1px] animate-float"
            style={{
              left: p.left,
              top: '100%', // Start from bottom for float up effect
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: visualConfig.speed, // Speed based on pollen count
              animationDelay: `-${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 pt-safe px-6 space-y-6 animate-fade-in">
        
        <div className="mt-8 mb-4">
           <h2 className="text-3xl font-light tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
             Bio-Guard <Flower2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 opacity-80" />
           </h2>
           <p className="text-slate-600 dark:text-slate-300 text-sm tracking-wide uppercase mt-1">Allergen Radar</p>
        </div>

        {/* Hero Card - Glass */}
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-8 rounded-[3rem] shadow-lg flex flex-col items-center justify-center text-center">
           <div className={`text-xl font-bold uppercase tracking-widest mb-2 ${
             riskLevel === 'High' ? 'text-rose-600 dark:text-rose-400' : 
             riskLevel === 'Moderate' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
           }`}>
             {riskLevel} Risk
           </div>
           
           <div className="text-5xl font-thin text-slate-800 dark:text-white my-4">
             {pollen.maxPollen.toFixed(1)} <span className="text-lg text-slate-500 font-normal">gr/m³</span>
           </div>

           <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-white/30 dark:bg-black/30 px-4 py-2 rounded-full">
             <Wind className="w-4 h-4" />
             <span className="text-sm font-medium">Dominant: <strong>{pollen.dominant}</strong></span>
           </div>
        </div>

        {/* Advice Card */}
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg flex items-start gap-4">
           {riskLevel === 'High' ? <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0" /> : <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />}
           <div>
             <h3 className="font-bold text-slate-800 dark:text-white">Health Advice</h3>
             <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mt-1">
               {advice}
             </p>
           </div>
        </div>

        {/* Pollen Grid Details */}
        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg">
           <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Detailed Breakdown</h3>
           <div className="grid grid-cols-2 gap-y-6 gap-x-4">
             <DetailItem label="Grass" value={pollen.grass} />
             <DetailItem label="Tree (Birch)" value={pollen.birch} />
             <DetailItem label="Tree (Alder)" value={pollen.alder} />
             <DetailItem label="Weed (Ragweed)" value={pollen.ragweed} />
             <DetailItem label="Mugwort" value={pollen.mugwort} />
             <DetailItem label="Olive" value={pollen.olive} />
           </div>
        </div>

      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string, value: number }) => (
  <div className="flex flex-col">
    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">{label}</span>
    <div className="flex items-end gap-1">
      <span className="text-xl font-medium text-slate-800 dark:text-white">{value.toFixed(1)}</span>
    </div>
    <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
      <div 
        className={`h-full rounded-full ${value > 30 ? 'bg-rose-400' : value > 10 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
        style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
      ></div>
    </div>
  </div>
);

export default BioGuard;