export interface Taxon {
  id: number;
  name: string;
  preferred_common_name?: string;
  iconic_taxon_name?: string;
  rank?: string;
  ancestor_ids?: number[];
  is_active?: boolean;
}

export interface TaxonSearchResult {
  total_results: number;
  page: number;
  per_page: number;
  results: Taxon[];
}

export interface Photo {
  id: number;
  url: string;
  attribution: string;
  license_code: string;
}

export interface Observation {
  id: number;
  species_guess: string;
  observed_on: string;
  time_observed_at: string;
  location: [number, number]; // [lat, lng]
  // Fields that may be present in the API response
  latitude?: number;
  longitude?: number;
  // Added geojson field which may be present in API responses
  geojson?: {
    type?: string;
    coordinates?: [number, number]; // [lng, lat] in the API
  };
  taxon: Taxon;
  photos: Photo[];
  uri: string;
  quality_grade: string;
  user: {
    id: number;
    login: string;
    name: string;
  };
}

export interface ObservationSearchResult {
  total_results: number;
  page: number;
  per_page: number;
  results: Observation[];
}
