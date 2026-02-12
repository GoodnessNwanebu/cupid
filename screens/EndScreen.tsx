import React from 'react';
import { ChevronLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { HeartSolid } from '../components/ui/Icons';
import { PolaroidData } from '../types';

interface EndScreenProps {
  onReturnHome: () => void;
  polaroids: PolaroidData[];
}

export const EndScreen: React.FC<EndScreenProps> = ({ onReturnHome, polaroids }) => {
  // Use the first two images for the stack, or fallbacks if something went wrong
  const frontImage = polaroids[0]?.image || 'https://picsum.photos/400/500';
  const backImage = polaroids[1]?.image || polaroids[0]?.image || 'https://picsum.photos/400/501';

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] pb-32">

      {/* Header - Using Grid for reliable alignment */}
      <header className="grid grid-cols-[48px_1fr_48px] items-center px-6 py-6 sticky top-0 z-10">
        <div className="flex justify-start">
          <button onClick={onReturnHome} className="p-2 -ml-2 text-cupid-brand hover:bg-cupid-50 rounded-full transition-colors flex items-center justify-center">
            <ChevronLeft className="w-8 h-8" />
          </button>
        </div>
        <div className="flex justify-center items-center">
          <h1 className="font-script text-4xl text-cupid-brand pt-2 leading-none">
            Cupid
          </h1>
        </div>
        <div /> {/* Empty spacer for right side balance */}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 flex flex-col items-center justify-center max-w-md mx-auto w-full -mt-10 relative z-10">

        {/* Floating Hearts Decoration */}
        <div className="absolute top-1/4 left-10 text-cupid-200 animate-pulse">
          <HeartSolid className="w-8 h-8 rotate-[-15deg]" />
        </div>
        <div className="absolute top-1/3 right-8 text-cupid-200 animate-pulse [animation-delay:0.5s]">
          <HeartSolid className="w-12 h-12 rotate-[10deg]" />
        </div>

        {/* Polaroid Stack Visual */}
        <div className="relative w-64 h-64 mb-12 flex items-center justify-center">

          {/* Back Card */}
          <div className="absolute w-48 aspect-[4/5] shadow-lg transform rotate-[-10deg] translate-x-[-15px] translate-y-2 rounded-sm overflow-hidden border-4 border-white/50">
            <img src={backImage} alt="Memory" className="w-full h-full object-cover opacity-60" />
          </div>

          {/* Front Card */}
          <div className="absolute w-48 aspect-[4/5] shadow-xl transform rotate-[5deg] translate-x-[15px] rounded-sm z-10 overflow-hidden border-4 border-white">
            <img src={frontImage} alt="Memory" className="w-full h-full object-cover" />
          </div>

          {/* Center Heart Badge */}
          <div className="absolute z-20 bg-cupid-brand rounded-full w-20 h-20 flex items-center justify-center shadow-glow border-4 border-white animate-in zoom-in duration-500">
            <HeartSolid className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-8 relative z-10">
          <h2 className="font-poppins text-2xl font-semibold text-gray-900 leading-tight">
            We hope these polaroids make your Valentine's Day special
          </h2>

          <div className="flex items-center justify-center gap-4 text-cupid-brand/80">
            <div className="h-0.5 bg-cupid-brand w-12 rounded-full" />
            <p className="font-poppins text-lg font-medium">Happy Valentine's Day from the Cupid team</p>
            <div className="h-0.5 bg-cupid-brand w-12 rounded-full" />
          </div>
        </div>

      </main>

      {/* Background soft blur */}
      <div className="fixed bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-0" />

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent z-50">
        <div className="max-w-md mx-auto w-full">
          <Button
            fullWidth
            onClick={onReturnHome}
            icon={<Home size={20} />}
          >
            RETURN HOME
          </Button>
        </div>
      </div>
    </div>
  );
};