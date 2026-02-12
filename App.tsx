import React, { useState } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { ProcessingScreen } from './screens/ProcessingScreen';
import { ResultScreen } from './screens/ResultScreen';
import { EndScreen } from './screens/EndScreen';
import { AppScreen, PolaroidData, UploadedFile } from './types';

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
  const [generatedPolaroids, setGeneratedPolaroids] = useState<PolaroidData[]>([]);
  const [recentMemories, setRecentMemories] = useState<PolaroidData[]>(INITIAL_MEMORIES);

  const handleImagesSelected = async (files: UploadedFile[]) => {
    setUploadedFiles(files);
    setCurrentScreen(AppScreen.PROCESSING);
  };

  const handleProcessingComplete = async () => {
    if (uploadedFiles.length === 0) return;

    // Generate formatted date for the caption
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Create polaroids with default text (Client side only)
    const newPolaroids = uploadedFiles.map((file, index) => {
      return {
        id: Date.now().toString() + index,
        image: file.previewUrl,
        caption: "Captured Forever", // Static default caption since we removed AI
        date: date,
        generatedAt: Date.now()
      } as PolaroidData;
    });

    setGeneratedPolaroids(newPolaroids);
    setCurrentScreen(AppScreen.RESULT);
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