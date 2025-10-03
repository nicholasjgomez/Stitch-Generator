import React, { useState, useRef, useCallback } from 'react';
import { ImageUploadIcon } from './Icons';

interface UploadScreenProps {
  onImageUpload: (file: File) => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null | undefined) => {
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    } else {
      alert('Please upload a valid image file (PNG, JPG, etc.).');
    }
  }, [onImageUpload]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    handleFile(file);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 sm:py-24">
      <div className="w-full max-w-2xl">
        <h2 className="text-3xl sm:text-5xl font-bold text-slate-800 mb-4">From Picture to Pattern in a Flash</h2>
        <p className="text-slate-600 text-lg mb-8 max-w-lg mx-auto">
          Cross-Stitch Genie takes the guesswork out of pattern creation. Upload any image and instantly get a simple, beautiful pattern, ready for your next project.
        </p>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-xl transition-colors ${
            isDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 bg-white'
          }`}
        >
          <ImageUploadIcon className="w-12 h-12 text-slate-400 mb-4" />
          <p className="text-slate-600 mb-2">Drag & drop your image here</p>
          <p className="text-slate-400 text-sm mb-4">or</p>
          <button
            onClick={handleButtonClick}
            className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition-all"
          >
            <ImageUploadIcon className="w-5 h-5" />
            Choose an Image
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default UploadScreen;