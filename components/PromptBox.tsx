
import React from 'react';
import { SparklesIcon } from './icons';

interface PromptBoxProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isReady: boolean;
}

export const PromptBox: React.FC<PromptBoxProps> = ({ prompt, setPrompt, onGenerate, isLoading, isReady }) => {
  return (
    <div className="bg-gray-500/10 backdrop-blur-xl border border-gray-400/20 rounded-2xl p-6 flex flex-col">
      <h2 className="text-lg font-semibold text-white">Enter Your Command</h2>
      <p className="text-sm text-gray-400 mt-1 mb-4">Describe the edit you want to make in the selected area.</p>
      
      <div className="p-[2px] rounded-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient">
          <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'add a futuristic helmet on its head' or 'make the car red'"
              className="w-full bg-gray-900 text-gray-200 placeholder-gray-500 rounded-[10px] p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 resize-y min-h-[150px]"
          />
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !isReady}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            Generate
          </>
        )}
      </button>
      {!isReady && !isLoading && (
        <p className="text-xs text-center text-gray-500 mt-3">Upload an image and draw a selection to enable.</p>
      )}
    </div>
  );
};
