"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import {
  classifyBirdImage,
  ClassificationResult,
} from "../utils/modelInference";

interface BirdImageUploaderProps {
  onClassificationComplete: (results: ClassificationResult[]) => void;
  isClassifying: boolean;
  setIsClassifying: (isClassifying: boolean) => void;
}

export default function BirdImageUploader({
  onClassificationComplete,
  isClassifying,
  setIsClassifying,
}: BirdImageUploaderProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFile = async (file: File) => {
    try {
      setErrorMessage(null);

      // Validate that it's an image
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please upload an image file.");
        return;
      }

      // Display the selected image
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);

      // Start classification
      setIsClassifying(true);

      try {
        const results = await classifyBirdImage(file);
        onClassificationComplete(results);
      } catch (error) {
        console.error("Classification error:", error);
        // Provide a more helpful error message based on the error
        if (error instanceof Error) {
          const errorMsg = error.message || "";
          if (errorMsg.includes("locate file") || errorMsg.includes("model")) {
            setErrorMessage(
              "Unable to load the bird classification model. Check your internet connection or try again later."
            );
          } else {
            setErrorMessage("Error classifying the image. Please try again.");
          }
        } else {
          setErrorMessage("Error classifying the image. Please try again.");
        }
      } finally {
        setIsClassifying(false);
      }
    } catch (error) {
      console.error("Error handling file:", error);
      setErrorMessage("Error processing the image. Please try again.");
      setIsClassifying(false);
    }
  };

  // Handle file input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Trigger file input click
  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors
          ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white"
          }
          ${
            isClassifying
              ? "opacity-70 pointer-events-none"
              : "hover:bg-slate-50"
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        {/* Image Preview */}
        {selectedImage ? (
          <div className="mb-4 relative">
            <img
              src={selectedImage}
              alt="Bird preview"
              className="max-h-64 max-w-full rounded-md shadow-sm"
            />
          </div>
        ) : (
          <div className="text-center mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Text and Input */}
        <div className="text-center">
          <p className="text-sm text-gray-700 font-medium mb-1">
            {selectedImage
              ? "Click or drag to upload a different image"
              : "Click or drag and drop an image to identify"}
          </p>
          <p className="text-xs text-gray-500 mb-2">Supports JPG, PNG, GIF</p>

          {isClassifying && (
            <div className="flex items-center justify-center mt-4">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-sm text-blue-600 font-medium">
                Analyzing image...
              </p>
            </div>
          )}

          {errorMessage && (
            <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded-md border border-red-100">
              {errorMessage}
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          id="fileInput"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isClassifying}
        />
      </div>
    </div>
  );
}
