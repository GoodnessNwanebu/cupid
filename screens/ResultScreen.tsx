import React, { useState } from 'react';
import { Download, Check, Edit2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PolaroidCard } from '../components/PolaroidCard';
import { PolaroidData } from '../types';
import { generatePolaroidImage } from '../utils/canvasGenerator';

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

  const currentPolaroid = polaroids[currentIndex];

  const handleSave = async () => {
    setIsSaving(true);
    console.log("Starting batch save/share process...");

    try {
      // Parallelize generation to stay within the "User Activation" window
      const results = await Promise.all(polaroids.map(async (polaroid) => {
        const dataUrl = await generatePolaroidImage(polaroid.image, polaroid.caption, polaroid.date);
        const filename = `cupid-${polaroid.caption.toLowerCase().replace(/\s+/g, '-')}-${polaroid.id.slice(-4)}.jpg`;

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return {
          dataUrl,
          file: new File([blob], filename, { type: 'image/jpeg' })
        };
      }));

      const files = results.map(r => r.file);
      const dataUrls = results.map(r => r.dataUrl);

      // PERSIST HIGH-RES IMAGES:
      // Update the polaroids with the high-res dataUrls so they carry over to EndScreen
      const finalPolaroids = polaroids.map((p, i) => ({
        ...p,
        image: results[i].dataUrl
      }));
      setPolaroids(finalPolaroids);

      // Check if Web Share API supports file sharing
      if (navigator.share && navigator.canShare && navigator.canShare({ files })) {
        console.log("Calling Web Share API...");
        await navigator.share({
          files: files,
          title: 'My Cupid Memories',
          text: 'Check out our Valentine polaroids! ❤️'
        });
      } else {
        console.log("Falling back to sequential download...");
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
      setCurrentIndex(prev => prev + 1);
      setIsEditing(false);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsEditing(false);
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

        {/* Carousel Area */}
        <div className="w-full relative flex items-center justify-center mb-8">

          {/* Prev Button */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`
              absolute left-0 z-10 p-2 rounded-full bg-white shadow-md text-gray-700 transition-opacity
              ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:text-cupid-brand'}
            `}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Polaroid Preview */}
          <div className="w-full max-w-[300px] relative group px-2">
            <div className="transition-all duration-300 transform">
              <PolaroidCard
                data={currentPolaroid}
                className="w-full"
                variant="preview"
                isEditing={isEditing}
                onCaptionChange={handleCaptionChange}
              />
            </div>

            {/* Floating Edit Button */}
            <div className="absolute bottom-20 right-6 z-20">
              <button
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
            onClick={nextSlide}
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
            {isSaving ? 'Generating...' : 'Download Polaroids'}
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