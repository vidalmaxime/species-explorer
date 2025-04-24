"use client";

import { useState, useRef } from "react";
import SearchSpecies from "../components/SearchSpecies";
import DaysSelector from "../components/DaysSelector";
import ObservationMap from "../components/ObservationMap";
import ObservationStats from "../components/ObservationStats";
import BirdClassifier from "../components/BirdClassifier";
import { Taxon, Observation } from "../types/inaturalist";
import { getObservations, searchTaxa } from "../utils/api";

export default function Home() {
  const [selectedTaxon, setSelectedTaxon] = useState<Taxon | null>(null);
  const [daysAgo, setDaysAgo] = useState<number>(30);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleTaxonSelect = async (taxon: Taxon) => {
    setSelectedTaxon(taxon);
    setIsLoading(true);
    setError(null);

    try {
      const data = await getObservations(taxon.id, daysAgo);
      setObservations(data.results);
    } catch (err) {
      console.error("Error fetching observations:", err);
      setError("Failed to fetch observations. Please try again.");
      setObservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDaysChange = async (days: number) => {
    setDaysAgo(days);

    if (selectedTaxon) {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getObservations(selectedTaxon.id, days);
        setObservations(data.results);
      } catch (err) {
        console.error("Error fetching observations:", err);
        setError("Failed to fetch observations. Please try again.");
        setObservations([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle species selection from the bird classifier
  const handleSpeciesSelect = async (speciesName: string) => {
    try {
      setSearchText(speciesName);
      setIsLoading(true);
      setError(null);

      // Search for the species in iNaturalist
      const searchResults = await searchTaxa(speciesName);

      if (searchResults.results && searchResults.results.length > 0) {
        // Select the first matching taxon
        const taxon = searchResults.results[0];
        setSelectedTaxon(taxon);

        // Fetch observations for this taxon
        const data = await getObservations(taxon.id, daysAgo);
        setObservations(data.results);
      } else {
        setError(`No species found matching "${speciesName}"`);
        setSelectedTaxon(null);
        setObservations([]);
      }
    } catch (err) {
      console.error("Error searching for species:", err);
      setError("Failed to search for this species. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h1 className="text-3xl font-bold mb-3 text-blue-800">
            Species Explorer
          </h1>
          <p className="text-gray-700 mb-6 text-lg">
            Search for species and view their recent observations on a map
          </p>

          <div className="flex flex-col md:flex-row gap-6 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Search Species
              </label>
              <SearchSpecies onSelect={handleTaxonSelect} />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <DaysSelector value={daysAgo} onChange={handleDaysChange} />
            </div>
          </div>
        </header>

        {/* Bird Classifier Section */}
        <BirdClassifier onSpeciesSelect={handleSpeciesSelect} />

        {error && (
          <div className="p-5 mb-6 bg-red-50 text-red-700 rounded-lg border border-red-100 shadow-sm font-medium">
            {error}
          </div>
        )}

        {selectedTaxon && (
          <ObservationStats
            observations={observations}
            taxonName={
              selectedTaxon.preferred_common_name || selectedTaxon.name
            }
            daysAgo={daysAgo}
          />
        )}

        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-6">
          <ObservationMap observations={observations} isLoading={isLoading} />
        </div>

        {selectedTaxon && observations.length === 0 && !isLoading && (
          <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-slate-100">
            <p className="text-lg text-gray-700 font-medium">
              No observations found for{" "}
              {selectedTaxon.preferred_common_name || selectedTaxon.name} in the
              past {daysAgo} days.
            </p>
            <p className="text-gray-600 mt-2">
              Try increasing the time range or searching for a different
              species.
            </p>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-gray-600 text-sm">
        <p>
          Data provided by{" "}
          <a
            href="https://www.inaturalist.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            iNaturalist
          </a>
        </p>
      </footer>
    </main>
  );
}
