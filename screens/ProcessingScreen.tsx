import React, { useEffect, useState } from 'react';
import { HeartSolid } from '../components/ui/Icons';

interface ProcessingScreenProps {
  onComplete: () => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2500; // 2.5 seconds simulation
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 500); // Small delay before transition
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cupid-50 to-[#F5F5F7] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[40%] bg-pink-300 rounded-full blur-[100px]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-cupid-200 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-sm flex flex-col items-center">
        {/* Glowing Card Animation */}
        <div className="relative mb-12">
          <div className="w-64 h-80 bg-white rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-100/50 to-transparent" />
            
            {/* Pulsing Heart */}
            <div className="relative z-10 animate-bounce duration-[2000ms]">
              <HeartSolid className="w-20 h-20 text-cupid-brand drop-shadow-lg" />
            </div>

            {/* Simulated Scanning Light */}
            <div className="absolute top-0 left-0 w-full h-2 bg-cupid-brand/20 blur-md animate-[scan_2s_ease-in-out_infinite]" />
          </div>
          
          {/* Back glow */}
          <div className="absolute -inset-4 bg-cupid-brand/20 blur-2xl -z-10 rounded-full" />
        </div>

        {/* Text */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
            Developing your vintage magic...
          </h2>
          <div className="flex items-center justify-center gap-2 text-cupid-brand font-medium text-sm">
             <span>Capturing the spark</span>
             <span className="flex gap-1">
               <span className="w-1 h-1 bg-cupid-brand rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-1 h-1 bg-cupid-brand rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-1 h-1 bg-cupid-brand rounded-full animate-bounce"></span>
             </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs h-1.5 bg-gray-200 rounded-full overflow-hidden mb-16">
          <div 
            className="h-full bg-cupid-brand rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Footer Info */}
        <div className="flex flex-col items-center text-xs text-gray-400 tracking-widest gap-2">
           <div className="flex items-center gap-1.5">
              <HeartSolid className="w-3 h-3 text-gray-300" />
              <span className="font-bold">CUPID</span>
           </div>
           <span>EST. 2024 • VERSION 1.0</span>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(320px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};