
import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedMimeTypes: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, acceptedMimeTypes }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedMimeTypes}
      />
      <div
        onClick={handleClick}
        className="w-full h-64 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-blue transition-colors bg-gray-900"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p>Click to upload an image</p>
            <p className="text-xs">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};
