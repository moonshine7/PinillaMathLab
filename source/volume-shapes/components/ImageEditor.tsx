
import React, { useState, useCallback } from 'react';
import { GenerateContentResponse } from "@google/genai";
import { editImage } from '../services/geminiService';
import { FileUpload } from './FileUpload';
import { Spinner } from './Spinner';
import { Card } from './Card';

export const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setEditedImageUrl(null);
  };

  const handleSubmit = useCallback(async () => {
    if (!prompt || !selectedFile) {
      setError('Please provide an image and a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const response: GenerateContentResponse = await editImage(base64data, selectedFile.type, prompt);

        // FIX: Loop through parts to find image data, as per documentation.
        let foundImage = false;
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const editedBase64 = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            setEditedImageUrl(`data:${mimeType};base64,${editedBase64}`);
            foundImage = true;
            break;
          }
        }

        if (!foundImage) {
          throw new Error('No image data returned from API.');
        }
      };
      reader.onerror = () => {
        throw new Error("Failed to read file for editing.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred while editing the image.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedFile]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className="text-lg font-semibold mb-2">1. Upload Your Image</h3>
            <FileUpload onFileSelect={handleFileSelect} acceptedMimeTypes="image/png, image/jpeg, image/webp" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">2. Describe Your Edit</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Add a retro filter' or 'Make the sky look like a sunset'"
              className="w-full h-32 p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-blue focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt || !selectedFile}
              className="mt-2 w-full bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? <Spinner size="sm" /> : 'Apply Edit'}
            </button>
          </div>
        </div>
      </Card>
      
      {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}

      {isLoading && (
        <Card className="flex flex-col items-center justify-center p-8">
          <Spinner />
          <p className="mt-4 text-gray-300">Applying your edits... Please wait.</p>
        </Card>
      )}

      {editedImageUrl && (
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-center">Your Edited Image</h3>
          <div className="flex justify-center">
            <img src={editedImageUrl} alt="Edited result" className="rounded-lg max-w-full max-h-[60vh] object-contain" />
          </div>
        </Card>
      )}
    </div>
  );
};
