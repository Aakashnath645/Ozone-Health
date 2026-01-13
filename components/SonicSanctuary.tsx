import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Waves, ShieldCheck, Volume2, AlertCircle } from 'lucide-react';

const SonicSanctuary: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0); // 0-100 scale
  const [dbCategory, setDbCategory] = useState<'Quiet' | 'Moderate' | 'Loud'>('Quiet');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopAudio = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
      }
      audioContextRef.current = null;
    }
    setIsListening(false);
    setVolume(0);
    setDbCategory('Quiet');
  }, []);

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      sourceRef.current.connect(analyserRef.current);
      
      setIsListening(true);
      analyzeLoop();
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required to measure noise levels.");
    }
  };

  const analyzeLoop = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS (Root Mean Square) for average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    
    // Map RMS to a 0-100 visual scale (approximate)
    // RMS from byte frequency is 0-255. 
    // Quiet room is usually ~10-20. Loud talking ~50-80.
    const visualVol = Math.min(100, (rms / 128) * 100 * 2); 
    
    // Smooth transition
    setVolume(prev => prev + (visualVol - prev) * 0.1);

    // Categorize
    // Note: This is an uncalibrated web approximation, not scientific dB
    if (visualVol > 60) setDbCategory('Loud');
    else if (visualVol > 30) setDbCategory('Moderate');
    else setDbCategory('Quiet');

    rafRef.current = requestAnimationFrame(analyzeLoop);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  // Visual Styles based on state
  const getTheme = () => {
    switch (dbCategory) {
      case 'Loud': return {
        bg: 'from-violet-500/20 to-fuchsia-500/20',
        ring: 'border-violet-400',
        text: 'text-violet-600 dark:text-violet-300',
        icon: AlertCircle,
        advice: 'High Stress. Use Headphones.',
        rippleSpeed: '1s'
      };
      case 'Moderate': return {
        bg: 'from-blue-400/20 to-cyan-400/20',
        ring: 'border-blue-400',
        text: 'text-blue-600 dark:text-blue-300',
        icon: Volume2,
        advice: 'Conversation Level.',
        rippleSpeed: '3s'
      };
      default: return { // Quiet
        bg: 'from-teal-400/20 to-emerald-400/20',
        ring: 'border-teal-400',
        text: 'text-teal-600 dark:text-teal-300',
        icon: ShieldCheck,
        advice: 'Perfect for Deep Work.',
        rippleSpeed: '0s' // Still
      };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div className="pt-safe px-6 space-y-6 animate-fade-in min-h-full">
       
       <div className="mt-8 mb-4">
          <h2 className="text-3xl font-light tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            Sonic Sanctuary
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm tracking-wide uppercase mt-1">Ambient Noise Monitor</p>
       </div>

       {/* Main Visualizer Card */}
       <div className="relative h-[50vh] w-full bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[3rem] shadow-lg flex flex-col items-center justify-center overflow-hidden transition-all duration-700">
          
          {/* Privacy Notice Overlay */}
          <div className="absolute top-6 px-6 text-center z-20">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-md">
               <ShieldCheck className="w-3 h-3 text-slate-500" />
               <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                 Analyzed Locally • No Recording
               </span>
            </div>
          </div>

          {/* THE POND - Visualizer */}
          <div className="relative z-10 flex items-center justify-center">
             
             {/* Center Core */}
             <div className={`relative z-20 w-32 h-32 rounded-full bg-gradient-to-br ${theme.bg} backdrop-blur-md border-2 ${theme.ring} flex items-center justify-center shadow-xl transition-all duration-500`}>
                <Icon className={`w-10 h-10 ${theme.text} transition-all duration-500`} strokeWidth={1.5} />
             </div>

             {/* Ripples - Only active if listening */}
             {isListening && (
               <>
                 <div className={`absolute z-10 w-32 h-32 rounded-full border ${theme.ring} opacity-50 animate-ping`} style={{ animationDuration: theme.rippleSpeed }}></div>
                 {dbCategory !== 'Quiet' && (
                   <div className={`absolute z-0 w-48 h-48 rounded-full border ${theme.ring} opacity-30 animate-ping`} style={{ animationDuration: theme.rippleSpeed, animationDelay: '0.5s' }}></div>
                 )}
                 {dbCategory === 'Loud' && (
                   <div className={`absolute z-0 w-64 h-64 rounded-full border ${theme.ring} opacity-20 animate-ping`} style={{ animationDuration: theme.rippleSpeed, animationDelay: '0.2s' }}></div>
                 )}
               </>
             )}
             
             {/* Still Water Reflection Effect when Quiet */}
             {isListening && dbCategory === 'Quiet' && (
               <div className="absolute w-96 h-96 bg-gradient-to-t from-teal-500/5 to-transparent rounded-full opacity-50 blur-3xl"></div>
             )}

          </div>

          {/* Status Text */}
          <div className="absolute bottom-10 z-20 text-center transition-all duration-500">
             <h3 className={`text-2xl font-light tracking-tight ${theme.text} mb-1`}>
               {isListening ? dbCategory : 'Silence'}
             </h3>
             <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
               {isListening ? theme.advice : 'Tap microphone to measure'}
             </p>
          </div>
       </div>

       {/* Controls */}
       <div className="flex justify-center">
         <button 
           onClick={isListening ? stopAudio : startAudio}
           className={`group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg active:scale-95 ${isListening ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
         >
           {isListening ? (
             <>
               <MicOff className="w-5 h-5" />
               <span className="font-bold">Stop Monitor</span>
             </>
           ) : (
             <>
               <Mic className="w-5 h-5" />
               <span className="font-bold">Start Listening</span>
             </>
           )}
           
           {/* Glow Effect for Button */}
           {!isListening && (
             <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 animate-pulse"></div>
           )}
         </button>
       </div>

    </div>
  );
};

export default SonicSanctuary;