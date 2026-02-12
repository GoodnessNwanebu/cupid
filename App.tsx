import React, { useState } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { ProcessingScreen } from './screens/ProcessingScreen';
import { ResultScreen } from './screens/ResultScreen';
import { EndScreen } from './screens/EndScreen';
import { generatePolaroidImage, generateCollagePolaroid } from './utils/canvasGenerator';
import { AppScreen, CollageStyle, GenerationMode, PolaroidData, UploadedFile } from './types';

const INITIAL_MEMORIES: PolaroidData[] = [
  {
    id: '1',
    image: 'https://picsum.photos/400/500?random=1',
    caption: "Beach Day '24",
    date: 'Aug 12, 2024',
    generatedAt: Date.now()
  },
  {
    id: '2',
    image: 'https://picsum.photos/400/500?random=2',
    caption: "Date Night",
    date: 'Sep 05, 2024',
    generatedAt: Date.now()
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.HOME);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.INDIVIDUAL);
  const [generatedPolaroids, setGeneratedPolaroids] = useState<PolaroidData[]>([]);
  const [recentMemories, setRecentMemories] = useState<PolaroidData[]>(INITIAL_MEMORIES);

  const handleImagesSelected = async (files: UploadedFile[], mode: GenerationMode) => {
    setUploadedFiles(files);
    setGenerationMode(mode);
    setCurrentScreen(AppScreen.PROCESSING);
  };

  const handleProcessingComplete = async () => {
    if (uploadedFiles.length === 0) return;

    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    let newPolaroids: PolaroidData[] = [];

    try {
      if (generationMode === GenerationMode.COLLAGE) {
        const imageUris = uploadedFiles.map(f => f.previewUrl);
        const initialOffsets = imageUris.map(() => ({ x: 0.5, y: 0.5 }));
        const collageImage = await generateCollagePolaroid(
          imageUris,
          "Our Moments", // Default caption for collage
          date,
          CollageStyle.GRID,
          { noFrame: true, offsets: initialOffsets }
        );
        newPolaroids = [{
          id: Date.now().toString(),
          image: collageImage,
          caption: "Our Moments",
          date: date,
          generatedAt: Date.now(),
          isCollage: true,
          sourceImages: imageUris,
          imageOffsets: initialOffsets
        }];
      } else {
        const generatedImages = await Promise.all(
          uploadedFiles.map(file => generatePolaroidImage(file.previewUrl, "Captured Forever", date, { noFrame: true }))
        );

        newPolaroids = uploadedFiles.map((file, index) => ({
          id: Date.now().toString() + index,
          image: generatedImages[index],
          caption: "Captured Forever",
          date: date,
          generatedAt: Date.now(),
          sourceImages: [file.previewUrl],
          imageOffsets: [{ x: 0.5, y: 0.5 }]
        }));
      }

      setGeneratedPolaroids(newPolaroids);
      setCurrentScreen(AppScreen.RESULT);
    } catch (err) {
      console.error("Generation failed:", err);
      // Fallback or error state
    }
  };

  const handleSaveAll = (memories: PolaroidData[]) => {
    // 1. Save to local state for "recent memories" on home screen
    setRecentMemories(prev => [...memories, ...prev]);
    // 2. Update generatedPolaroids so EndScreen shows the HIGH-RES versions
    setGeneratedPolaroids(memories);
    // 3. Navigate to End Screen
    setCurrentScreen(AppScreen.END);
  };

  const handleReturnHome = () => {
    setUploadedFiles([]);
    setGeneratedPolaroids([]);
    setCurrentScreen(AppScreen.HOME);
  };

  const handleBackToHome = () => {
    setCurrentScreen(AppScreen.HOME);
  };

  const handleRegenerate = () => {
    setCurrentScreen(AppScreen.HOME);
    setUploadedFiles([]);
    setGeneratedPolaroids([]);
  };

  return (
    <div className="font-sans text-gray-900 antialiased">
      {currentScreen === AppScreen.HOME && (
        <HomeScreen
          onImagesSelected={handleImagesSelected}
          recentMemories={recentMemories}
        />
      )}

      {currentScreen === AppScreen.PROCESSING && (
        <ProcessingScreen onComplete={handleProcessingComplete} />
      )}

      {currentScreen === AppScreen.RESULT && generatedPolaroids.length > 0 && (
        <ResultScreen
          initialData={generatedPolaroids}
          onBack={handleBackToHome}
          onRegenerate={handleRegenerate}
          onSave={handleSaveAll}
        />
      )}

      {currentScreen === AppScreen.END && (
        <EndScreen
          onReturnHome={handleReturnHome}
          polaroids={generatedPolaroids}
        />
      )}
    </div>
  );
}