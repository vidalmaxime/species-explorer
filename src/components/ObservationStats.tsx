import React from "react";
import { Observation } from "../types/inaturalist";

interface ObservationStatsProps {
  observations: Observation[];
  taxonName: string;
  daysAgo: number;
}

export default function ObservationStats({
  observations,
  taxonName,
  daysAgo,
}: ObservationStatsProps) {
  if (!observations.length) {
    return null;
  }

  // Calculate some basic statistics
  const totalObservations = observations.length;

  // Group observations by date to see days with observations
  const observationsByDate = observations.reduce((acc, obs) => {
    const date = obs.observed_on.split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(obs);
    return acc;
  }, {} as Record<string, Observation[]>);

  const daysWithObservations = Object.keys(observationsByDate).length;

  // Find day with most observations
  let maxObsDay = "";
  let maxObsCount = 0;

  Object.entries(observationsByDate).forEach(([date, obs]) => {
    if (obs.length > maxObsCount) {
      maxObsCount = obs.length;
      maxObsDay = date;
    }
  });

  // Format the date for display
  const formattedMaxObsDay = maxObsDay
    ? new Date(maxObsDay).toLocaleDateString()
    : "";

  return (
    <div className="p-6 bg-white rounded-xl my-6 shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-blue-800 mb-4">
        Observation Statistics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
          <div className="text-sm font-medium text-blue-700 mb-1">
            Total Sightings
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {totalObservations}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
          <div className="text-sm font-medium text-blue-700 mb-1">Species</div>
          <div className="text-2xl font-bold text-blue-600">{taxonName}</div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
          <div className="text-sm font-medium text-blue-700 mb-1">
            Days with Observations
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {daysWithObservations} / {daysAgo}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
          <div className="text-sm font-medium text-blue-700 mb-1">
            Most Active Day
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formattedMaxObsDay} ({maxObsCount})
          </div>
        </div>
      </div>
    </div>
  );
}
