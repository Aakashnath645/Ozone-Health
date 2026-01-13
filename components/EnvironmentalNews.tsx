import React, { useMemo } from 'react';
import { Newspaper, ExternalLink, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const EnvironmentalNews: React.FC = () => {
  const { location, airQuality, weather, pollen } = useApp();

  // 1. Deterministic Analysis Engine (Replaces AI)
  const briefing = useMemo(() => {
    if (!airQuality || !weather) return "Collecting environmental data...";

    const parts = [];
    
    // Air Quality Logic
    if (airQuality.aqi > 100) {
      parts.push(`Air quality in ${location.city} is currently unhealthy. Active filtration recommended.`);
    } else if (airQuality.aqi > 50) {
      parts.push(`Moderate air pollution detected. Sensitive individuals should limit prolonged outdoor exertion.`);
    } else {
      parts.push(`Air quality is excellent today.`);
    }

    // Weather/UV Logic
    if (weather.uvIndex > 6) {
      parts.push("Solar intensity is high; skin protection is mandatory.");
    } else if (weather.uvIndex > 3) {
      parts.push("Moderate UV levels present.");
    }

    // Pollen Logic (if available)
    if (pollen && pollen.maxPollen > 30) {
      parts.push(`High levels of ${pollen.dominant} pollen detected.`);
    }

    return parts.join(" ");
  }, [airQuality, weather, pollen, location.city]);

  const newsUrl = `https://news.google.com/search?q=${encodeURIComponent(location.city + " Air Quality Weather Health")}`;

  return (
    <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg mt-4 active:scale-[0.98] transition-transform duration-300 group">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
             <Newspaper className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white tracking-wide text-sm">Daily Briefing</h3>
        </div>
        
        {airQuality && airQuality.aqi > 100 ? (
            <AlertCircle className="w-5 h-5 text-rose-500" />
        ) : (
            <CheckCircle2 className="w-5 h-5 text-teal-500" />
        )}
      </div>

      <div>
        <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
          {briefing}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10 flex flex-col sm:flex-row gap-3">
          <a 
            href={newsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 transition-colors border border-white/20"
          >
            <TrendingUp className="w-3 h-3" />
            Local Health News
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalNews;