
import React, { useState, useEffect } from 'react';
import { useVeo } from '../hooks/useVeo';
import { FileUpload } from './FileUpload';
import { Spinner } from './Spinner';
import { Card } from './Card';

// FIX: Removed local declaration of window.aistudio to use global type.
export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);

  const { isLoading, videoUrl, error, loadingMessage, generate, reset } = useVeo();

  useEffect(() => {
    const checkApiKey = async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } else {
            // Fallback for environments where aistudio is not available
            setApiKeySelected(!!process.env.API_KEY);
        }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        try {
            await window.aistudio.openSelectKey();
            // Assume success after opening dialog to handle race condition
            setApiKeySelected(true);
        } catch(e) {
            console.error("Error opening API key selection dialog", e);
        }
      }
  };
  
  // If error is related to API key, reset the state to show the button again
  useEffect(() => {
      if (error && error.includes("API key is invalid")) {
          setApiKeySelected(false);
          reset();
      }
  }, [error, reset]);


  const handleSubmit = () => {
    if (selectedFile && prompt) {
      generate(selectedFile, prompt, aspectRatio);
    }
  };
  
  if (apiKeySelected === null) {
      return (
        <div className="flex justify-center items-center h-64">
            <Spinner />
        </div>
      )
  }

  if (!apiKeySelected) {
    return (
        <Card className="text-center">
            <h2 className="text-xl font-bold mb-4">API Key Required for Video Generation</h2>
            <p className="mb-4 text-gray-300">The Veo model requires an API key to generate videos. Please select a key to continue.</p>
            <p className="mb-6 text-sm text-gray-400">For more information on billing, please visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">ai.google.dev/gemini-api/docs/billing</a>.</p>
            <button
                onClick={handleSelectKey}
                className="bg-brand-blue text-white font-bold py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
            >
                Select API Key
            </button>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">1. Upload a Starting Image</h3>
            <FileUpload onFileSelect={setSelectedFile} acceptedMimeTypes="image/png, image/jpeg, image/webp" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">2. Describe the Video</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'A cinematic shot of this car driving through a neon-lit city at night'"
              className="w-full h-32 p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-blue focus:outline-none"
              disabled={isLoading}
            />
            <h3 className="text-lg font-semibold my-2">3. Select Aspect Ratio</h3>
            <div className="flex space-x-4">
              {(['16:9', '9:16'] as const).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-4 py-2 rounded-md transition-colors ${aspectRatio === ratio ? 'bg-brand-blue text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
            <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt || !selectedFile}
                className="w-full md:w-1/2 bg-brand-blue text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed text-lg"
            >
                {isLoading ? 'Generating...' : 'Generate Video'}
            </button>
        </div>
      </Card>

      {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}

      {isLoading && (
        <Card className="flex flex-col items-center justify-center p-8">
          <Spinner size="lg"/>
          <p className="mt-4 text-gray-300 font-semibold">{loadingMessage}</p>
          <p className="mt-2 text-sm text-gray-400">Video generation can take several minutes.</p>
        </Card>
      )}

      {videoUrl && (
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-center">Your Generated Video</h3>
          <div className="flex justify-center bg-black rounded-lg">
            <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-[70vh] rounded-lg" />
          </div>
        </Card>
      )}
    </div>
  );
};
