
import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import { Spinner } from './Spinner';
import { Card } from './Card';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!prompt) {
      setError('Please provide a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const response = await generateImage(prompt);
      const imageBytes = response.generatedImages[0]?.image?.imageBytes;

      if (imageBytes) {
        setGeneratedImageUrl(`data:image/png;base64,${imageBytes}`);
      } else {
        throw new Error('No image data returned from API.');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred while generating the image.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);
  
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-2">Describe the image you want to create</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'A photorealistic image of a cat wearing a tiny wizard hat'"
            className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-blue focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !prompt}
            className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner size="sm" /> : 'Generate'}
          </button>
        </div>
      </Card>

      {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}

      {isLoading && (
        <Card className="flex flex-col items-center justify-center p-8">
          <Spinner />
          <p className="mt-4 text-gray-300">Creating your image...</p>
        </Card>
      )}

      {generatedImageUrl && (
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-center">Generated Image</h3>
          <div className="flex justify-center">
            <img src={generatedImageUrl} alt="Generated result" className="rounded-lg max-w-full max-h-[60vh] object-contain" />
          </div>
        </Card>
      )}
    </div>
  );
};
