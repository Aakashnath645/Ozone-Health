import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sun, MapPin, Shield, Search, Crosshair, Loader2, Download, ChevronRight } from 'lucide-react';
import { searchCity } from '../services/api';
import InstallModal from './InstallModal';

const Settings: React.FC = () => {
  const { theme, setTheme, sensitiveMode, setSensitiveMode, location, setLocation } = useApp();
  const [cityQuery, setCityQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [locating, setLocating] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityQuery) return;
    const results = await searchCity(cityQuery);
    setSearchResults(results);
  };

  const selectCity = (result: any) => {
    setLocation({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      city: result.display_name.split(',')[0],
      display_name: result.display_name
    });
    setSearchResults([]);
    setCityQuery('');
  };

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          city: ''
        });
        setLocating(false);
        setSearchResults([]);
        setCityQuery('');
      },
      (error) => {
        console.error(error);
        setLocating(false);
      }
    );
  };

  return (
    <div className="pt-safe px-6 space-y-6 animate-fade-in min-h-full">
      <InstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
      
      <div className="mt-8 mb-4">
         <h2 className="text-3xl font-light tracking-tight text-slate-800 dark:text-white">Preferences</h2>
         <p className="text-slate-600 dark:text-slate-300 text-sm tracking-wide uppercase mt-1">Customize your experience</p>
      </div>

      {/* Install Card - Glass */}
      <button 
        onClick={() => setShowInstallModal(true)}
        className="w-full bg-indigo-500/90 backdrop-blur-xl text-white p-6 rounded-[2rem] shadow-lg shadow-indigo-200/50 dark:shadow-none flex items-center justify-between group active:scale-95 transition-transform"
      >
         <div className="text-left">
           <div className="font-bold flex items-center gap-2"><Download className="w-5 h-5"/> Install App</div>
           <div className="text-indigo-100 text-sm mt-1">Enable offline mode</div>
         </div>
         <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <ChevronRight className="w-5 h-5" />
         </div>
      </button>

      {/* Location - Glass */}
      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Location
        </h3>
        
        <form onSubmit={handleSearch} className="flex gap-3 mb-2">
          <input 
            type="text" 
            placeholder="Search city..." 
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            className="flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-md h-12 rounded-2xl px-4 text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-white/30"
          />
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="h-12 w-12 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center text-indigo-500 border border-white/30"
          >
            {locating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Crosshair className="w-5 h-5" />}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl overflow-hidden mt-2 border border-slate-200 dark:border-slate-700 z-50 relative">
            {searchResults.map((res) => (
              <div 
                key={res.place_id} 
                onClick={() => selectCity(res)}
                className="p-3 text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                {res.display_name.split(',')[0]}
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">Currently: {location.city}</div>
      </div>

      {/* Toggles - Glass */}
      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] shadow-lg overflow-hidden divide-y divide-white/20 dark:divide-white/5">
         
         {/* Theme */}
         <div className="p-6 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${theme === 'light' ? 'bg-amber-100/80 text-amber-600' : 'bg-indigo-100/80 text-indigo-600'}`}>
                {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </div>
             <div>
               <div className="font-semibold text-slate-800 dark:text-white">Dark Mode</div>
               <div className="text-xs text-slate-500 dark:text-slate-400">Reduce eye strain</div>
             </div>
           </div>
           <button 
             onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
             className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-300/50'}`}
           >
             <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
           </button>
         </div>

         {/* Sensitive */}
         <div className="p-6 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-full bg-rose-100/80 text-rose-600">
                <Shield className="w-5 h-5" />
             </div>
             <div>
               <div className="font-semibold text-slate-800 dark:text-white">Sensitive</div>
               <div className="text-xs text-slate-500 dark:text-slate-400">Lower thresholds</div>
             </div>
           </div>
           <button 
             onClick={() => setSensitiveMode(!sensitiveMode)}
             className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${sensitiveMode ? 'bg-rose-500' : 'bg-slate-300/50'}`}
           >
             <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${sensitiveMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
           </button>
         </div>

      </div>
    </div>
  );
};

export default Settings;