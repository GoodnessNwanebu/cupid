import React, { useRef, useEffect } from 'react';
import { PolaroidData } from '../types';

interface PolaroidCardProps {
  data: PolaroidData;
  className?: string;
  onClick?: () => void;
  variant?: 'preview' | 'thumbnail';
  isEditing?: boolean;
  onCaptionChange?: (caption: string) => void;
  showCaption?: boolean;
  livePreview?: boolean;
  collageStyle?: CollageStyle;
  interactiveOffsets?: { x: number, y: number }[];
}

import { CollageStyle } from '../types';

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  data,
  className = '',
  onClick,
  variant = 'preview',
  isEditing = false,
  onCaptionChange,
  showCaption = true,
  livePreview = false,
  collageStyle = CollageStyle.GRID,
  interactiveOffsets
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
        bg-[#FAF9F6] shadow-polaroid transform transition-transform duration-300
        ${isPreview ? 'p-[6.6%] pb-[26%] rotate-1 hover:rotate-0' : 'p-2 hover:-translate-y-1 cursor-pointer'}
        aspect-[12/17]
        ${className}
      `}
      onClick={onClick}
    >
      {/* Image Area */}
      <div className={`bg-gray-100 overflow-hidden relative select-none touch-none ${isPreview ? 'mb-0' : 'mb-2'} aspect-[4/5]`}>
        {livePreview && data.sourceImages && data.sourceImages.length > 0 ? (
          <div className="w-full h-full relative">
            {collageStyle === CollageStyle.GRID ? (
              <div className="w-full h-full flex flex-col gap-[3%] p-[2%] box-border">
                {data.sourceImages.length === 1 && (
                  <img
                    src={data.sourceImages[0]}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: `${(interactiveOffsets?.[0]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[0]?.y ?? 0.5) * 100}%` }}
                  />
                )}
                {data.sourceImages.length === 2 && (
                  <>
                    <div className="flex-1 overflow-hidden relative">
                      <img src={data.sourceImages[0]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[0]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[0]?.y ?? 0.5) * 100}%` }} />
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                      <img src={data.sourceImages[1]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[1]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[1]?.y ?? 0.5) * 100}%` }} />
                    </div>
                  </>
                )}
                {data.sourceImages.length === 3 && (
                  <>
                    <div className="flex-[1.1] overflow-hidden relative">
                      <img src={data.sourceImages[0]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[0]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[0]?.y ?? 0.5) * 100}%` }} />
                    </div>
                    <div className="flex-1 flex gap-[3%]">
                      <div className="flex-1 overflow-hidden relative">
                        <img src={data.sourceImages[1]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[1]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[1]?.y ?? 0.5) * 100}%` }} />
                      </div>
                      <div className="flex-1 overflow-hidden relative">
                        <img src={data.sourceImages[2]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[2]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[2]?.y ?? 0.5) * 100}%` }} />
                      </div>
                    </div>
                  </>
                )}
                {data.sourceImages.length >= 4 && (
                  <>
                    <div className="flex-1 flex gap-[3%]">
                      <div className="flex-1 overflow-hidden relative">
                        <img src={data.sourceImages[0]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[0]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[0]?.y ?? 0.5) * 100}%` }} />
                      </div>
                      <div className="flex-1 overflow-hidden relative">
                        <img src={data.sourceImages[1]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[1]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[1]?.y ?? 0.5) * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex-1 flex gap-[3%]">
                      <div className="flex-1 overflow-hidden relative">
                        <img src={data.sourceImages[2]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[2]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[2]?.y ?? 0.5) * 100}%` }} />
                      </div>
                      <div className="flex-1 overflow-hidden relative">
                        <img src={data.sourceImages[3]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[3]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[3]?.y ?? 0.5) * 100}%` }} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Scrapbook Layout */
              <div className="w-full h-full relative">
                {/* Doodles (Static representative version for UI) */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-[20%] left-[20%] text-[40px] text-gray-400 rotate-12">❤️</div>
                  <div className="absolute bottom-[30%] right-[10%] text-[30px] text-gray-400 -rotate-12">✨</div>
                  <div className="absolute top-[50%] right-[30%] text-[20px] text-gray-400 rotate-45">✨</div>
                </div>

                {data.sourceImages.map((src, i) => {
                  const configs = [
                    { w: '60%', h: '45%', t: '10%', l: '10%', r: '-5deg' },
                    { w: '60%', h: '45%', b: '15%', r: '10%', r_deg: '6deg' },
                    { w: '55%', h: '40%', t: '40%', l: '15%', r: '-3deg' },
                    { w: '55%', h: '40%', b: '10%', l: '35%', r: '4deg' },
                  ];
                  const c = configs[i % configs.length];
                  return (
                    <div
                      key={i}
                      className="absolute bg-white p-1 pb-4 shadow-md overflow-hidden"
                      style={{
                        width: c.w,
                        height: c.h,
                        top: c.t,
                        left: c.l,
                        bottom: c.b,
                        right: c.r,
                        transform: `rotate(${c.r_deg || c.r})`
                      }}
                    >
                      <img
                        src={src}
                        className="w-full h-[80%] object-cover"
                        style={{ objectPosition: `${(interactiveOffsets?.[i]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[i]?.y ?? 0.5) * 100}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <img
            src={data.image}
            alt="Polaroid memory"
            className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
            style={{
              filter: isPreview ? 'contrast(1.1) brightness(1.1) saturate(1.1)' : 'none'
            }}
          />
        )}

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
      {isPreview && showCaption && (
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

      {!isPreview && showCaption && (
        <div className="text-center pb-1">
          <p className="font-script text-lg text-gray-800 truncate">{data.caption}</p>
        </div>
      )}
    </div>
  );
};