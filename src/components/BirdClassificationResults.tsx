"use client";

import React from "react";
import { ClassificationResult } from "../utils/modelInference";

interface BirdClassificationResultsProps {
  results: ClassificationResult[];
  onSelectSpecies: (speciesName: string) => void;
}

export default function BirdClassificationResults({
  results,
  onSelectSpecies,
}: BirdClassificationResultsProps) {
  // If no results, don't render anything
  if (!results || results.length === 0) {
    return null;
  }

  // Format percentage for display
  const formatPercentage = (score: number) => {
    return (score * 100).toFixed(1) + "%";
  };

  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-blue-800 mb-3">
        Classification Results
      </h3>

      {/* Top result with action button */}
      <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h4 className="font-bold text-gray-800">{results[0].commonName}</h4>
            <p className="text-sm text-gray-600 italic">{results[0].label}</p>
          </div>
          <div className="text-lg font-bold text-blue-600">
            {formatPercentage(results[0].score)}
          </div>
        </div>
        <button
          onClick={() => onSelectSpecies(results[0].commonName)}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Search for this bird
        </button>
      </div>

      {/* Alternative results */}
      {results.length > 1 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Other possibilities:
          </h4>
          <div className="space-y-2">
            {results.slice(1, 4).map((result, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelectSpecies(result.commonName)}
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {result.commonName}
                  </p>
                  <p className="text-xs text-gray-600 italic">{result.label}</p>
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {formatPercentage(result.score)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
