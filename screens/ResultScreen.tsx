import React, { useState } from 'react';
import { Download, Check, Edit2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PolaroidCard } from '../components/PolaroidCard';
import { generatePolaroidImage, generateCollagePolaroid } from '../utils/canvasGenerator';
import { CollageStyle, PolaroidData } from '../types';

interface ResultScreenProps {
  initialData: PolaroidData[];
  onBack: () => void;
  onRegenerate: () => void;
  onSave: (data: PolaroidData[]) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  initialData,
  onBack,
  onRegenerate,
  onSave
}) => {
  const [polaroids, setPolaroids] = useState<PolaroidData[]>(initialData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [collageStyle, setCollageStyle] = useState<CollageStyle>(CollageStyle.GRID);
  const [offsets, setOffsets] = useState<{ x: number, y: number }[]>(
    initialData[0].imageOffsets || Array(initialData[0].sourceImages?.length || 4).fill({ x: 0.5, y: 0.5 })
  );
  const [dragState, setDragState] = useState<{ activeSlot: number, startX: number, startY: number, startOffset: { x: number, y: number } } | null>(null);
  const currentPolaroid = polaroids[currentIndex];

  const handleStyleChange = (newStyle: CollageStyle) => {
    if (!currentPolaroid.isCollage || !currentPolaroid.sourceImages) return;

    setCollageStyle(newStyle);

    // Sync the style to the data object so the UI stays synced on re-render
    const updatedPolaroids = [...polaroids];
    updatedPolaroids[currentIndex] = {
      ...currentPolaroid,
      collageStyle: newStyle
    };
    setPolaroids(updatedPolaroids);
  };

  const getSlotIndex = (e: React.MouseEvent | React.TouchEvent, rect: DOMRect) => {
    if (!currentPolaroid.isCollage) return 0;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;

    const count = currentPolaroid.sourceImages?.length || 0;

    if (collageStyle === CollageStyle.GRID) {
      if (count === 2) return relY < 0.5 ? 0 : 1;
      if (count === 3) {
        if (relY < 0.55) return 0;
        return relX < 0.5 ? 1 : 2;
      }
      if (count === 4) {
        if (relY < 0.5) return relX < 0.5 ? 0 : 1;
        return relX < 0.5 ? 2 : 3;
      }
    } else { // Scrapbook - using simple quadrant mapping for interaction
      if (count === 2) {
        return (relX + relY < 1) ? 0 : 1;
      }
      if (count === 3) {
        if (relY < 0.45) return 0;
        return relX < 0.5 ? 1 : 2;
      }
      if (relY < 0.5) return relX < 0.5 ? 0 : 1;
      return relX < 0.5 ? 2 : 3;
    }
    return 0;
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const slotIdx = getSlotIndex(e, rect);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragState({
      activeSlot: slotIdx,
      startX: clientX,
      startY: clientY,
      startOffset: { ...offsets[slotIdx] }
    });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (clientX - dragState.startX) / rect.width;
    const dy = (clientY - dragState.startY) / rect.height;

    const newOffsets = [...offsets];
    newOffsets[dragState.activeSlot] = {
      x: Math.max(0, Math.min(1, dragState.startOffset.x - dx)),
      y: Math.max(0, Math.min(1, dragState.startOffset.y - dy))
    };
    setOffsets(newOffsets);
  };

  const handleDragEnd = () => {
    if (!dragState) return;

    // Sync offsets to the polaroid data
    const updatedPolaroids = [...polaroids];
    updatedPolaroids[currentIndex] = {
      ...currentPolaroid,
      imageOffsets: offsets
    };
    setPolaroids(updatedPolaroids);
    setDragState(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    console.log("Starting batch save/share process...");

    try {
      const results = [];
      for (const polaroid of polaroids) {
        let finalImage: string;

        if (polaroid.isCollage && polaroid.sourceImages) {
          // Final Bake from sources to ensure perfect framing/quality
          finalImage = await generateCollagePolaroid(
            polaroid.sourceImages,
            polaroid.caption,
            polaroid.date,
            polaroid.collageStyle || CollageStyle.GRID,
            { noFrame: false, offsets: polaroid.imageOffsets || Array(polaroid.sourceImages.length).fill({ x: 0.5, y: 0.5 }) }
          );
        } else if (polaroid.sourceImages?.[0]) {
          finalImage = await generatePolaroidImage(
            polaroid.sourceImages[0],
            polaroid.caption,
            polaroid.date,
            { noFrame: false, offset: (polaroid.imageOffsets?.[0] || { x: 0.5, y: 0.5 }) }
          );
        } else {
          finalImage = polaroid.image;
        }

        const filename = `cupid-${polaroid.caption.toLowerCase().replace(/\s+/g, '-')}-${polaroid.id.slice(-4)}.jpg`;

        const res = await fetch(finalImage);
        const blob = await res.blob();
        results.push({
          dataUrl: finalImage,
          file: new File([blob], filename, { type: 'image/jpeg' })
        });
      }

      const files = results.map(r => r.file);
      const dataUrls = results.map(r => r.dataUrl);

      // PERSIST HIGH-RES IMAGES:
      const finalPolaroids = polaroids.map((p, i) => ({
        ...p,
        image: results[i].dataUrl
      }));
      setPolaroids(finalPolaroids);

      // PLATFORM DETECTION
      const isAndroid = /Android/i.test(navigator.userAgent);
      const canShareFiles = navigator.share && navigator.canShare && navigator.canShare({ files });

      if (!isAndroid && canShareFiles) {
        console.log("Calling Web Share API (iOS/Desktop)...");
        await navigator.share({
          files: files,
          title: 'My Cupid Memories',
          text: 'Check out our Valentine polaroids! ❤️'
        });
      } else {
        console.log(isAndroid ? "Android detected: Forcing direct download..." : "Share not supported: Falling back to download...");
        for (let i = 0; i < dataUrls.length; i++) {
          const link = document.createElement('a');
          link.download = results[i].file.name;
          link.href = dataUrls[i];
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          if (i < dataUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      onSave(finalPolaroids);
    } catch (error) {
      console.error("Error in batch save/share:", error);
      if (error instanceof Error && error.name !== 'AbortError') {
        alert("Failed to save images. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleCaptionChange = (newCaption: string) => {
    const updatedPolaroids = [...polaroids];
    updatedPolaroids[currentIndex] = {
      ...currentPolaroid,
      caption: newCaption
    };
    setPolaroids(updatedPolaroids);
  };

  const nextSlide = () => {
    if (currentIndex < polaroids.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsEditing(false);

      // Load offsets for the next polaroid
      const nextP = polaroids[nextIdx];
      setOffsets(nextP.imageOffsets || Array(nextP.sourceImages?.length || 4).fill({ x: 0.5, y: 0.5 }));
      setCollageStyle(nextP.collageStyle || CollageStyle.GRID);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setIsEditing(false);

      // Load offsets for the prev polaroid
      const prevP = polaroids[prevIdx];
      setOffsets(prevP.imageOffsets || Array(prevP.sourceImages?.length || 4).fill({ x: 0.5, y: 0.5 }));
      setCollageStyle(prevP.collageStyle || CollageStyle.GRID);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col relative pb-32">
      {/* Header */}
      <header className="flex justify-center items-center px-6 py-6 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-sm z-10">
        <h1 className="font-serif text-lg font-bold text-gray-900">
          Your Polaroids
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 flex flex-col items-center max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Captured Forever</h2>
          <p className="text-gray-500 text-sm">Your romantic memories are ready.</p>
        </div>

        {/* Style Picker (only for Collage) */}
        {currentPolaroid.isCollage && (
          <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-full border border-gray-200 mb-6 w-fit mx-auto">
            <button
              onClick={() => handleStyleChange(CollageStyle.GRID)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${collageStyle === CollageStyle.GRID
                ? 'bg-white shadow-sm text-cupid-brand'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Classic Grid
            </button>
            <button
              onClick={() => handleStyleChange(CollageStyle.SCRAPBOOK)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${collageStyle === CollageStyle.SCRAPBOOK
                ? 'bg-white shadow-sm text-cupid-brand'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Scrapbook
            </button>
          </div>
        )}

        {/* Carousel Area */}
        <div className="w-full relative flex items-center justify-center mb-8">

          {/* Prev Button */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => prevSlide()}
            disabled={currentIndex === 0}
            className={`
              absolute left-0 z-10 p-2 rounded-full bg-white shadow-md text-gray-700 transition-opacity
              ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:text-cupid-brand'}
            `}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Polaroid Preview */}
          <div
            className="w-full max-w-[300px] relative group px-2 cursor-move select-none touch-none"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div>
              <PolaroidCard
                data={currentPolaroid}
                className="w-full"
                livePreview={true}
                collageStyle={collageStyle}
                interactiveOffsets={offsets}
                variant="preview"
                isEditing={isEditing}
                onCaptionChange={handleCaptionChange}
              />
            </div>

            {!dragState && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Drag photo to pan
              </div>
            )}

            {/* Floating Edit Button */}
            <div className="absolute bottom-20 right-6 z-20">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={toggleEdit}
                className={`
                  w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all duration-200
                  ${isEditing
                    ? 'bg-cupid-brand text-white hover:bg-cupid-600 rotate-0'
                    : 'bg-white/90 backdrop-blur text-gray-600 hover:text-cupid-brand hover:scale-110'
                  }
                `}
              >
                {isEditing ? <Check size={18} /> : <Edit2 size={16} />}
              </button>
            </div>
          </div>

          {/* Next Button */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => nextSlide()}
            disabled={currentIndex === polaroids.length - 1}
            className={`
              absolute right-0 z-10 p-2 rounded-full bg-white shadow-md text-gray-700 transition-opacity
              ${currentIndex === polaroids.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:text-cupid-brand'}
            `}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </main>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent z-20">
        <div className="max-w-md mx-auto w-full">
          <Button
            fullWidth
            onClick={handleSave}
            disabled={isSaving}
            icon={isSaving ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          >
            {isSaving ? '' : 'Download Polaroids'}
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50 whitespace-nowrap">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <Check size={12} className="text-white stroke-[3px]" />
          </div>
          <span className="text-sm font-medium">Saved to your Gallery</span>
        </div>
      )}
    </div>
  );
};