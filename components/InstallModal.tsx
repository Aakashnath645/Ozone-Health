import React from 'react';
import { Share, MoreVertical, X, Smartphone } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-health-safe to-health-extreme rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Install Ozone</h2>
          <p className="text-slate-500 text-sm mt-2">
            Add this app to your home screen for the best full-screen experience.
          </p>
        </div>

        <div className="space-y-4 text-left">
          {/* iOS Instructions */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2 flex items-center gap-2">
              <span className="text-xl"></span> iPhone / iPad
            </h3>
            <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside">
              <li>Tap the <Share className="w-3 h-3 inline mx-1" /> <strong>Share</strong> button in your browser toolbar.</li>
              <li>Scroll down and select <strong>Add to Home Screen</strong>.</li>
            </ol>
          </div>

          {/* Android Instructions */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2 flex items-center gap-2">
              <span className="text-lg">🤖</span> Android
            </h3>
            <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside">
              <li>Tap the <MoreVertical className="w-3 h-3 inline mx-1" /> <strong>Menu</strong> icon (3 dots).</li>
              <li>Select <strong>Install App</strong> or <strong>Add to Home screen</strong>.</li>
            </ol>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="mt-6 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default InstallModal;