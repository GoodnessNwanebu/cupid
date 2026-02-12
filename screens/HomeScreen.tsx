import React, { useRef, useState } from 'react';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';
import { HeartDashed } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { PolaroidCard } from '../components/PolaroidCard';
import { PolaroidData, UploadedFile } from '../types';

interface HomeScreenProps {
  onImagesSelected: (files: UploadedFile[]) => void;
  recentMemories: PolaroidData[];
}

interface GridItemProps {
  file: UploadedFile;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

const GridItem: React.FC<GridItemProps> = ({ file, onRemove }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="aspect-square relative group rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100">
      {/* Shimmer Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 shimmer z-0 flex items-center justify-center">
          <HeartDashed className="w-12 h-12 text-cupid-100 animate-pulse" />
        </div>
      )}

      {/* Async Loaded Image */}
      <img
        src={file.previewUrl}
        alt="Preview"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover object-top transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Remove Button */}
      <button
        onClick={(e) => onRemove(file.id, e)}
        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm z-10"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ onImagesSelected, recentMemories }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeFile = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFiles(prev => prev.filter(f => f.id !== idToRemove));
    // Reset file input value so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerateClick = () => {
    if (selectedFiles.length > 0) {
      onImagesSelected(selectedFiles);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-32 relative flex flex-col">
      {/* Header */}
      <header className="flex justify-center items-center px-6 py-6 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-sm z-10">
        <h1 className="font-script text-4xl text-cupid-brand">Cupid</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 flex flex-col max-w-md mx-auto w-full">
        <div className="mb-6 text-center sm:text-left">
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-2">Capture the spark</h2>
          <p className="text-gray-500 text-sm">Transform your moments into vintage magic.</p>
        </div>

        {/* Upload Zone */}
        <div
          className="relative mb-12"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple // Allow multiple files
            onChange={handleFileChange}
          />

          {selectedFiles.length === 0 ? (
            // Empty State
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                aspect-square max-w-[320px] mx-auto relative cursor-pointer group transition-transform duration-300
                ${dragActive ? 'scale-105' : 'hover:scale-[1.02]'}
              `}
            >
              <HeartDashed className={`
                w-full h-full transition-colors duration-300
                ${dragActive ? 'text-cupid-400' : 'text-cupid-200 group-hover:text-cupid-300'}
              `} />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-cupid-50 rounded-full flex items-center justify-center mb-4 text-cupid-brand shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-800 mb-1">Tap to Upload</h3>
                <p className="text-xs text-gray-400">Select multiple photos</p>
              </div>
            </div>
          ) : (
            // Grid State
            <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in duration-300">
              {selectedFiles.map((file) => (
                <GridItem key={file.id} file={file} onRemove={removeFile} />
              ))}

              {/* Add More Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-cupid-200 flex flex-col items-center justify-center text-cupid-400 hover:bg-cupid-50 hover:border-cupid-300 transition-all gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-cupid-100 flex items-center justify-center">
                  <Plus size={20} className="text-cupid-500" />
                </div>
                <span className="text-xs font-medium">Add more</span>
              </button>
            </div>
          )}
        </div>


      </main>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent z-20">
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            onClick={handleGenerateClick}
            disabled={selectedFiles.length === 0}
          >
            {selectedFiles.length > 0
              ? `Generate ${selectedFiles.length} Polaroid${selectedFiles.length > 1 ? 's' : ''}`
              : 'Select Photos'}
          </Button>
        </div>
      </div>
    </div>
  );
};