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
import { COLLAGE_CONFIGS } from '../utils/layoutConstants';

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

  // Collages are "loaded" immediately for showing overlays
  useEffect(() => {
    if (livePreview) {
      setIsLoaded(true);
    }
  }, [livePreview]);

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
              <div
                className="w-full h-full flex flex-col box-border"
                style={{
                  gap: `${COLLAGE_CONFIGS.GRID.GUTTER * 100}%`,
                  padding: `${COLLAGE_CONFIGS.GRID.MARGIN * 100}%`
                }}
              >
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
                    <div className="flex-1 overflow-hidden relative" style={{ marginTop: `${COLLAGE_CONFIGS.GRID.GUTTER * 100}%` }}>
                      <img src={data.sourceImages[1]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[1]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[1]?.y ?? 0.5) * 100}%` }} />
                    </div>
                  </>
                )}
                {data.sourceImages.length === 3 && (
                  <>
                    <div className="flex-[1.2] overflow-hidden relative">
                      <img src={data.sourceImages[0]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[0]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[0]?.y ?? 0.5) * 100}%` }} />
                    </div>
                    <div
                      className="flex-1 flex"
                      style={{ gap: `${COLLAGE_CONFIGS.GRID.GUTTER * 100}%`, marginTop: `${COLLAGE_CONFIGS.GRID.GUTTER * 100}%` }}
                    >
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
                    <div
                      className="flex-1 flex"
                      style={{ gap: `${COLLAGE_CONFIGS.GRID.GUTTER * 100}%` }}
                    >
                      <div className="flex-1 overflow-hidden relative">
                        <img src={data.sourceImages[0]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[0]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[0]?.y ?? 0.5) * 100}%` }} />
                      </div>
                      <div className="flex-1 overflow-hidden relative">
                        <img src={data.sourceImages[1]} className="w-full h-full object-cover" style={{ objectPosition: `${(interactiveOffsets?.[1]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[1]?.y ?? 0.5) * 100}%` }} />
                      </div>
                    </div>
                    <div
                      className="flex-1 flex"
                      style={{ gap: `${COLLAGE_CONFIGS.GRID.GUTTER * 100}%`, marginTop: `${COLLAGE_CONFIGS.GRID.GUTTER * 100}%` }}
                    >
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
                {/* Doodles (Static representative version for UI) */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <div className="absolute top-[15%] left-[15%] text-[48px] text-gray-400 rotate-12 select-none">❤️</div>
                  <div className="absolute bottom-[25%] right-[8%] text-[36px] text-gray-400 -rotate-12 select-none">✨</div>
                  <div className="absolute top-[45%] right-[25%] text-[24px] text-gray-400 rotate-45 select-none">💫</div>
                  <div className="absolute top-[10%] right-[10%] text-[28px] text-gray-400 -rotate-6 select-none">✨</div>
                  <div className="absolute bottom-[15%] left-[20%] text-[32px] text-gray-400 rotate-12 select-none">🎀</div>
                </div>

                {(() => {
                  const count = data.sourceImages.length as 2 | 3 | 4;
                  const layout = COLLAGE_CONFIGS.SCRAPBOOK.layouts[count] || COLLAGE_CONFIGS.SCRAPBOOK.layouts[2];
                  return layout.map((c, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        width: `${c.w * 100}%`,
                        height: `${c.h * 100}%`,
                        top: `${c.y * 100}%`,
                        left: `${c.x * 100}%`,
                        transform: `rotate(${c.rotation}deg)`,
                        zIndex: i + 1
                      }}
                    >
                      {/* Additive White Frame (matches canvas generator padding) */}
                      <div
                        className="absolute bg-white shadow-md pointer-events-none"
                        style={{
                          top: '-8%',
                          left: '-8%',
                          right: '-8%',
                          bottom: '-25%',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          zIndex: -1
                        }}
                      />

                      {/* Photo Area (The true panning zone) */}
                      <div className="w-full h-full bg-gray-50 overflow-hidden relative">
                        <img
                          src={data.sourceImages![i]}
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition: `${(interactiveOffsets?.[i]?.x ?? 0.5) * 100}% ${(interactiveOffsets?.[i]?.y ?? 0.5) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ));
                })()}
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

        {/* Analog Overlays for Preview - Hidden during Live Panning for functional feel */}
        {isPreview && isLoaded && !livePreview && (
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