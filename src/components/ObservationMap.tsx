import React from "react";
import dynamic from "next/dynamic";
import { Observation } from "../types/inaturalist";

// Dynamically import Leaflet components with no SSR
const MapWithNoSSR = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[70vh] bg-slate-50 flex items-center justify-center">
      <div className="text-center bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse h-12 w-12 rounded-full bg-blue-100 mx-auto mb-4"></div>
        <p className="text-gray-800 font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

interface ObservationMapProps {
  observations: Observation[];
  isLoading: boolean;
}

export default function ObservationMap({
  observations,
  isLoading,
}: ObservationMapProps) {
  return (
    <div className="w-full h-[70vh] relative border border-gray-300 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-3 font-medium text-gray-800">
              Loading observations...
            </p>
          </div>
        </div>
      )}
      <MapWithNoSSR observations={observations} />
    </div>
  );
}
