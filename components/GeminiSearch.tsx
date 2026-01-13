import React, { useEffect, useState } from 'react';
import { getHealthInsights } from '../services/geminiService';
import { Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

const GeminiSearch: React.FC = () => {
  const { location, airQuality, weather } = useApp();
  const [insight, setInsight] = useState<{ text: string; grounding?: any } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchInsight = async () => {
      if (!location.city || !airQuality || !weather) return;
      setLoading(true);
      const result = await getHealthInsights(location.city, airQuality.aqi, weather.uvIndex);
      if (isMounted && result) {
        setInsight(result);
      }
      setLoading(false);
    };

    fetchInsight();
    return () => { isMounted = false; };
  }, [location.city]);

  if (!process.env.API_KEY) return null;

  const cleanText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
  };

  return (
    <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-lg mt-4 active:scale-[0.98] transition-transform duration-300">
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
           <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white tracking-wide text-sm">AI Health Insight</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm h-16 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing atmosphere...
        </div>
      ) : insight ? (
        <div>
          <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
            {cleanText(insight.text)}
          </p>
          {insight.grounding && (
            <div className="mt-4 flex flex-wrap gap-2">
              {insight.grounding.map((chunk: any, idx: number) => {
                 const url = chunk.web?.uri;
                 const title = chunk.web?.title || 'Source';
                 if (!url) return null;
                 return (
                   <a 
                    key={idx} 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 hover:underline bg-white/40 dark:bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 transition-colors"
                   >
                     {title} <ExternalLink className="w-3 h-3" />
                   </a>
                 )
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Unable to connect to AI grid.</p>
      )}
    </div>
  );
};

export default GeminiSearch;