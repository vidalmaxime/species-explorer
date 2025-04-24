import React, { useState, useEffect, useRef } from "react";
import { searchTaxa } from "../utils/api";
import { Taxon } from "../types/inaturalist";

interface SearchSpeciesProps {
  onSelect: (taxon: Taxon) => void;
}

export default function SearchSpecies({ onSelect }: SearchSpeciesProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Taxon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for taxa when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim() === "") {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchTaxa(query);
        setResults(data.results);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error searching taxa:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (taxon: Taxon) => {
    setQuery(taxon.preferred_common_name || taxon.name);
    setShowDropdown(false);
    onSelect(taxon);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for species..."
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-gray-800 text-base placeholder:text-gray-500"
          onFocus={() => query && setShowDropdown(true)}
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {results.map((taxon) => (
            <div
              key={taxon.id}
              className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-0"
              onClick={() => handleSelect(taxon)}
            >
              <div className="font-semibold text-gray-800">
                {taxon.preferred_common_name || taxon.name}
              </div>
              <div className="text-sm text-gray-600 italic">
                {taxon.name}
                {taxon.rank ? ` (${taxon.rank})` : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
