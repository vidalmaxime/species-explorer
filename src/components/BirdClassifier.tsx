"use client";

import React, { useState, useEffect } from "react";
import BirdImageUploader from "./BirdImageUploader";
import BirdClassificationResults from "./BirdClassificationResults";
import { ClassificationResult } from "../utils/modelInference";

interface BirdClassifierProps {
  onSpeciesSelect: (speciesName: string) => void;
}

export default function BirdClassifier({
  onSpeciesSelect,
}: BirdClassifierProps) {
  const [classificationResults, setClassificationResults] = useState<
    ClassificationResult[]
  >([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  // Effect to track when model is ready to use
  useEffect(() => {
    // We'll mark the model as ready after 2 seconds to allow for initial loading
    // In a production app, you would want to check the actual model loading state
    const timer = setTimeout(() => {
      setModelStatus("ready");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClassificationComplete = (results: ClassificationResult[]) => {
    setClassificationResults(results);
    // If we got results, ensure model status is "ready"
    setModelStatus("ready");
  };

  const handleSelectSpecies = (speciesName: string) => {
    onSpeciesSelect(speciesName);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-800">Identify with AI</h2>
        <div className="text-sm text-gray-600 flex items-center">
          <span className="mr-2">Powered by AI</span>
          {modelStatus === "loading" && (
            <span className="text-amber-600 flex items-center">
              <div className="animate-pulse rounded-full h-2 w-2 bg-amber-500 mr-1"></div>
              Loading model...
            </span>
          )}
          {modelStatus === "ready" && (
            <button
              onClick={() => setShowModel(!showModel)}
              className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
            >
              {showModel ? "Hide info" : "Show info"}
            </button>
          )}
          {modelStatus === "error" && (
            <span className="text-red-600">Model failed to load</span>
          )}
        </div>
      </div>

      {showModel && modelStatus === "ready" && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm border border-blue-100">
          <p className="text-gray-700">
            This tool uses the{" "}
            <span className="font-semibold">ViT image classification</span>{" "}
            model which can recognize a wide variety of objects, animals, and
            birds.
          </p>
          <p className="text-gray-700 mt-1">
            Upload a photo, and the AI will identify what&apos;s in the image
            and search for recent observations if it recognizes an animal or
            bird.
          </p>
        </div>
      )}

      {modelStatus === "loading" && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-center mb-4">
          <div className="flex justify-center mb-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-600"></div>
          </div>
          <p className="text-amber-800 font-medium">
            Loading image classification model...
          </p>
          <p className="text-amber-700 text-sm mt-1">
            This may take a moment on the first visit.
          </p>
        </div>
      )}

      <BirdImageUploader
        onClassificationComplete={handleClassificationComplete}
        isClassifying={isClassifying}
        setIsClassifying={setIsClassifying}
      />

      {!isClassifying && classificationResults.length > 0 && (
        <BirdClassificationResults
          results={classificationResults}
          onSelectSpecies={handleSelectSpecies}
        />
      )}
    </div>
  );
}
