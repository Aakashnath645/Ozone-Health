import React, { useState, useEffect } from 'react';

const SplashScreen: React.FC<{ finish: boolean }> = ({ finish }) => {
  const [text, setText] = useState("Inhaling");
  const [shouldRender, setShouldRender] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Text Sequence
    const t1 = setTimeout(() => setText("Analyzing Atmosphere"), 1200);
    const t2 = setTimeout(() => setText("Ready"), 2800);
    
    // Progress Bar Animation
    const t3 = setTimeout(() => setProgress(100), 100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (finish) {
      // Allow fade out transition before unmounting
      const t = setTimeout(() => setShouldRender(false), 1000);
      return () => clearTimeout(t);
    }
  }, [finish]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${finish ? 'opacity-0 scale-110 pointer-events-none blur-sm' : 'opacity-100 scale-100 blur-0'}`}
    >
      {/* Ambient Background Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-300/20 dark:bg-teal-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-300/20 dark:bg-indigo-900/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative flex items-center justify-center mb-16 z-10">
        {/* Expanding Ripples */}
        <div className="absolute flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border border-teal-500/40 dark:border-teal-400/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        </div>
        <div className="absolute flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border border-indigo-500/30 dark:border-indigo-400/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-500"></div>
        </div>

        {/* Central Breathing Core */}
        <div className="relative w-28 h-28 bg-gradient-to-br from-teal-400 to-indigo-600 rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center animate-breathe">
            <div className="w-24 h-24 bg-white/20 dark:bg-black/10 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center">
               <div className="w-20 h-20 bg-gradient-to-tr from-teal-300/50 to-indigo-400/50 rounded-full"></div>
            </div>
        </div>
      </div>
      
      {/* Dynamic Text */}
      <div className="h-12 relative flex flex-col items-center justify-center z-10">
        <span 
          key={text} 
          className="text-xl md:text-2xl font-light tracking-[0.25em] text-slate-600 dark:text-slate-300 uppercase animate-fade-in whitespace-nowrap"
        >
          {text}
        </span>
      </div>
      
      {/* Loading Bar */}
      <div className="mt-8 w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden z-10">
        <div 
          className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full transition-all duration-[3000ms] ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default SplashScreen;