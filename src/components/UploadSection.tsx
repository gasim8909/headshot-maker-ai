'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || '10485760'); // 10MB default

export default function UploadSection({ onImageUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    // Check file type
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      return 'Please upload a JPEG or PNG image.';
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${MAX_FILE_SIZE / 1048576}MB limit.`;
    }
    
    return null;
  };

  const processFile = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
      if (onImageUpload) {
        onImageUpload(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Upload Your Photo</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Upload a clear photo of your face. For best results, use an image where your face is centered, well-lit, and against a simple background.
        </p>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'
        } ${previewImage ? 'p-4' : 'p-10'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {previewImage ? (
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 mb-4">
              <Image 
                src={previewImage} 
                alt="Preview" 
                fill
                objectFit="contain"
                className="rounded-md"
              />
            </div>
            <button 
              onClick={handleButtonClick} 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Choose a different photo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="mb-2 text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (MAX. {MAX_FILE_SIZE / 1048576}MB)</p>
            <button
              type="button"
              onClick={handleButtonClick}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Select File
            </button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg, image/png"
          onChange={handleChange}
          className="hidden"
        />
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}