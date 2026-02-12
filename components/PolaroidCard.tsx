import React, { useRef, useEffect } from 'react';
import { PolaroidData } from '../types';

interface PolaroidCardProps {
  data: PolaroidData;
  className?: string;
  onClick?: () => void;
  variant?: 'preview' | 'thumbnail';
  isEditing?: boolean;
  onCaptionChange?: (caption: string) => void;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  data,
  className = '',
  onClick,
  variant = 'preview',
  isEditing = false,
  onCaptionChange
}) => {
  const isPreview = variant === 'preview';
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={`
        bg-[#FFFDF8] shadow-polaroid transform transition-transform duration-300
        ${isPreview ? 'p-[6.6%] pb-[26%] rotate-1 hover:rotate-0' : 'p-2 hover:-translate-y-1 cursor-pointer'}
        aspect-[12/17]
        ${className}
      `}
      onClick={onClick}
    >
      {/* Image Area */}
      <div className={`bg-gray-100 overflow-hidden relative ${isPreview ? 'mb-0' : 'mb-2'} aspect-[4/5]`}>
        <img
          src={data.image}
          alt="Polaroid memory"
          className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          style={{
            filter: isPreview ? 'contrast(1.1) brightness(1.1) saturate(1.1)' : 'none'
          }}
        />

        {/* Analog Overlays for Preview */}
        {isPreview && isLoaded && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-1000">
            {/* Film Fade (Shadow Lift) */}
            <div className="absolute inset-0 bg-[#141423] mix-blend-screen opacity-20" />

            {/* Warm Sunlight Hint */}
            <div className="absolute inset-0 bg-orange-400 mix-blend-overlay opacity-10" />

            {/* Subtle Grain Overlay (using noise pattern) */}
            <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
          </div>
        )}
      </div>

      {/* Caption Area */}
      {isPreview && (
        <div className="text-center px-2">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={data.caption}
              onChange={(e) => onCaptionChange?.(e.target.value)}
              className="font-script text-3xl text-gray-800 mb-2 w-full text-center bg-transparent outline-none border-b border-cupid-brand/30 focus:border-cupid-brand placeholder-gray-300 pb-1 px-0"
              placeholder="Write a caption..."
            />
          ) : (
            <p className="font-script text-3xl text-gray-800 mb-2 leading-relaxed min-h-[44px]">{data.caption}</p>
          )}
          <p className="text-xs text-gray-400 font-sans tracking-wide uppercase">{data.date}</p>
        </div>
      )}

      {!isPreview && (
        <div className="text-center pb-1">
          <p className="font-script text-lg text-gray-800 truncate">{data.caption}</p>
        </div>
      )}
    </div>
  );
};