import React, { useState } from 'react';
import { findNearbyPlaces } from '../services/geminiService';
import { MapPin, Loader2, TreePine, Stethoscope } from 'lucide-react';
import { useApp } from '../context/AppContext';

const GeminiMaps: React.FC = () => {
  const { location } = useApp();
  const [places, setPlaces] = useState<{ text: string; grounding?: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<'park' | 'clinic' | null>(null);

  const handleSearch = async (type: 'park' | 'clinic') => {
    setLoading(true);
    setActiveType(type);
    const result = await findNearbyPlaces(location.lat, location.lon, type);
    if (result) {
      setPlaces(result);
    }
    setLoading(false);
  };

  if (!process.env.API_KEY) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mt-6">
      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-health-safe" />
        Find Relief Nearby
      </h3>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handleSearch('park')}
          disabled={loading}
          className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
            activeType === 'park'
              ? 'bg-health-safe text-white shadow-lg shadow-health-safe/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {loading && activeType === 'park' ? <Loader2 className="w-4 h-4 animate-spin"/> : <TreePine className="w-4 h-4" />}
          <span className="text-sm font-medium">Green Spaces</span>
        </button>
        <button
          onClick={() => handleSearch('clinic')}
          disabled={loading}
          className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
            activeType === 'clinic'
              ? 'bg-health-danger text-white shadow-lg shadow-health-danger/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {loading && activeType === 'clinic' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Stethoscope className="w-4 h-4" />}
          <span className="text-sm font-medium">Clinics</span>
        </button>
      </div>

      {places && (
        <div className="animate-fade-in bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
           {/* Render text safely. The prompt text is usually markdown-like. */}
           <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
             {places.text.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>)}
           </div>

           {/* Maps Grounding Chunks */}
           {places.grounding && places.grounding.length > 0 && (
             <div className="mt-4 space-y-2">
               <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Locations Found</h4>
               {places.grounding.map((chunk: any, i: number) => {
                 const mapData = chunk.maps; // Access map data specifically
                 if (!mapData || !mapData.title) return null;
                 
                 return (
                   <a
                     key={i}
                     href={mapData.uri} // Google Maps Link
                     target="_blank"
                     rel="noreferrer"
                     className="block p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-health-safe dark:hover:border-health-safe transition-colors"
                   >
                     <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{mapData.title}</div>
                     <div className="text-xs text-slate-500 mt-1 truncate">{mapData.uri}</div>
                   </a>
                 )
               })}
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default GeminiMaps;
