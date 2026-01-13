import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, TreePine, Stethoscope } from 'lucide-react';

const NearbyRelief: React.FC = () => {
  const { location } = useApp();

  const handleSearch = (term: string) => {
    // Construct Google Maps search query
    const query = location.city ? `${term} near ${location.city}` : `${term} near me`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg mt-6 active:scale-[0.99] transition-transform duration-300">
      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-health-safe" />
        Find Relief Nearby
      </h3>

      <div className="flex gap-3">
        <button
          onClick={() => handleSearch('parks and green spaces')}
          className="flex-1 py-4 px-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-white/50 dark:bg-white/5 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 group border border-white/20 shadow-sm"
        >
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-full group-hover:bg-white/20 transition-colors">
            <TreePine className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide group-hover:text-white text-slate-600 dark:text-slate-300">Green Spaces</span>
        </button>
        
        <button
          onClick={() => handleSearch('respiratory clinics pulmonology')}
          className="flex-1 py-4 px-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-white/50 dark:bg-white/5 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 group border border-white/20 shadow-sm"
        >
          <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-full group-hover:bg-white/20 transition-colors">
            <Stethoscope className="w-6 h-6 text-rose-500 dark:text-rose-400 group-hover:text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide group-hover:text-white text-slate-600 dark:text-slate-300">Clinics</span>
        </button>
      </div>
    </div>
  );
};

export default NearbyRelief;