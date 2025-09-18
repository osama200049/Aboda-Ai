
import React, { useState, useCallback } from 'react';
import { ImageEditor } from './components/ImageEditor';
import { PromptBox } from './components/PromptBox';
import { Loader } from './components/Loader';
import { Header } from './components/Header';
import { UploadIcon, SparklesIcon, DownloadIcon, UndoIcon, CompareIcon } from './components/icons';
import type { Point } from './types';
import { callGeminiImageEditor } from './services/geminiService';

interface Selection {
  points: Point[];
  dimensions: { width: number; height: number };
}

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null);
        setError(null);
        setSelection(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLassoComplete = useCallback((points: Point[], dimensions: { width: number; height: number }) => {
    setSelection({ points, dimensions });
  }, []);

  const handleGenerate = async () => {
    if (!originalImage || !selection || selection.points.length < 3 || !prompt.trim()) {
      setError('Please upload an image, select an area with the lasso, and enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const resultBase64 = await callGeminiImageEditor(originalImage, selection.points, selection.dimensions, prompt);
      setEditedImage(resultBase64);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
      if (!editedImage) return;
      const link = document.createElement('a');
      link.href = editedImage;
      const mimeType = editedImage.substring(editedImage.indexOf(':') + 1, editedImage.indexOf(';'));
      const extension = mimeType.split('/')[1] || 'png';
      link.download = `aboda-ai-edit.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  const handleUndo = () => {
      setEditedImage(null);
      setSelection(null);
      setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 flex flex-col items-center gap-8">
          <div className="w-full max-w-4xl flex flex-col gap-8">
            <div className="aspect-video bg-black/30 rounded-2xl border border-gray-700/50 flex items-center justify-center p-4 relative">
              {!originalImage ? (
                <div className="text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <label htmlFor="file-upload" className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors">
                    Upload Image
                  </label>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                </div>
              ) : editedImage ? (
                 <>
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-gray-900/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                        <SparklesIcon className="h-4 w-4 text-purple-400" />
                        <span>Generated Image</span>
                    </div>
                     <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onMouseDown={() => setIsComparing(true)}
                          onMouseUp={() => setIsComparing(false)}
                          onMouseLeave={() => setIsComparing(false)}
                          onTouchStart={() => setIsComparing(true)}
                          onTouchEnd={() => setIsComparing(false)}
                          className="flex items-center gap-2 bg-gray-900/50 backdrop-blur-sm px-3 py-2 rounded-full text-sm hover:bg-indigo-600/70 transition-colors cursor-pointer"
                          aria-label="Hold to compare with original image"
                        >
                          <CompareIcon className="h-4 w-4" />
                          <span>Compare</span>
                        </button>
                        <button
                          onClick={handleUndo}
                          className="flex items-center gap-2 bg-gray-900/50 backdrop-blur-sm px-3 py-2 rounded-full text-sm hover:bg-indigo-600/70 transition-colors cursor-pointer"
                          aria-label="Undo generation"
                        >
                          <UndoIcon className="h-4 w-4" />
                          <span>Undo</span>
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 bg-gray-900/50 backdrop-blur-sm px-3 py-2 rounded-full text-sm hover:bg-indigo-600/70 transition-colors cursor-pointer"
                            aria-label="Download generated image"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            <span>Download</span>
                        </button>
                     </div>
                    <img src={isComparing ? originalImage : editedImage} alt={isComparing ? "Original image" : "Edited result"} className="max-w-full max-h-full object-contain rounded-lg" />
                </>
              ) : (
                <ImageEditor imageSrc={originalImage} onLassoComplete={handleLassoComplete} />
              )}
            </div>
          </div>
          <div className="w-full max-w-4xl">
            <PromptBox
              prompt={prompt}
              setPrompt={setPrompt}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              isReady={!!originalImage && !!selection && selection.points.length > 2}
            />
             {error && (
                <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            {isLoading && <Loader />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
