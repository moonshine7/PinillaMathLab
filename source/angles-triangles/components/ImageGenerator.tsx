import React, { useState } from 'react';
import { generateGeometryImage } from '../services/geminiService';
import { AspectRatio, ImageSize } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('A futuristic city designed with perfectly parallel highways and transversal bridges, neon lights, 4k render.');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.K1);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const imgData = await generateGeometryImage(prompt, aspectRatio, imageSize);
      setGeneratedImage(imgData);
    } catch (err) {
      setError("Failed to generate image. Ensure you have access to Gemini 3 Pro Image Preview or check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <div>
            <h2 className="text-xl font-bold text-slate-800">Visualizer</h2>
            <p className="text-sm text-slate-500">Create custom geometry art or memory aids.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prompt</label>
            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                rows={3}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aspect Ratio</label>
                <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                >
                    <option value={AspectRatio.SQUARE}>Square (1:1)</option>
                    <option value={AspectRatio.LANDSCAPE}>Landscape (16:9)</option>
                    <option value={AspectRatio.PORTRAIT}>Portrait (9:16)</option>
                    <option value={AspectRatio.WIDE}>Wide (21:9)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Size</label>
                <select 
                    value={imageSize} 
                    onChange={(e) => setImageSize(e.target.value as ImageSize)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                >
                    <option value={ImageSize.K1}>1K</option>
                    <option value={ImageSize.K2}>2K (Pro)</option>
                    <option value={ImageSize.K4}>4K (Pro)</option>
                </select>
            </div>
        </div>

        <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-pink-600 text-white py-2 rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
        >
            {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
            ) : 'Generate Visual'}
        </button>

        {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}

        {generatedImage && (
            <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                <img src={generatedImage} alt="Generated geometry art" className="w-full h-auto" />
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;