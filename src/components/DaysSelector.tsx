import React from "react";

interface DaysSelectorProps {
  value: number;
  onChange: (days: number) => void;
}

const presetOptions = [7, 14, 30, 60, 90];

export default function DaysSelector({ value, onChange }: DaysSelectorProps) {
  return (
    <div className="flex items-center space-x-3">
      <label
        htmlFor="days-selector"
        className="text-sm font-medium text-gray-800"
      >
        Sightings in the past
      </label>
      <select
        id="days-selector"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-800 font-medium shadow-sm bg-white"
      >
        {presetOptions.map((days) => (
          <option key={days} value={days}>
            {days} days
          </option>
        ))}
      </select>
    </div>
  );
}
