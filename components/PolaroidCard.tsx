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

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div 
      className={`
        bg-[#FFFDF8] shadow-polaroid transform transition-transform duration-300
        ${isPreview ? 'p-4 sm:p-6 rotate-1 hover:rotate-0' : 'p-2 hover:-translate-y-1 cursor-pointer'}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Image Area */}
      <div className={`bg-gray-100 overflow-hidden ${isPreview ? 'mb-6 aspect-[4/5]' : 'mb-2 aspect-square'}`}>
        <img 
          src={data.image} 
          alt="Polaroid memory" 
          className="w-full h-full object-cover transition-all duration-500"
          style={{
             // Universal Analog Preview:
             // 1. No Sepia (Preserves colors)
             // 2. Brightness/Contrast boost (Flash effect)
             // 3. Saturation boost (Counteracts perceived fade)
             filter: 'contrast(1.1) brightness(1.1) saturate(1.1)'
          }}
        />
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