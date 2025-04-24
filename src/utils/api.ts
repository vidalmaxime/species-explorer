import axios from "axios";
import { subDays, format } from "date-fns";
import {
  Observation,
  ObservationSearchResult,
  TaxonSearchResult,
} from "../types/inaturalist";

const BASE_URL = "https://api.inaturalist.org/v1";

export async function searchTaxa(query: string): Promise<TaxonSearchResult> {
  if (!query || query.trim() === "") {
    return { total_results: 0, page: 1, per_page: 10, results: [] };
  }

  const response = await axios.get(`${BASE_URL}/taxa`, {
    params: {
      q: query,
      per_page: 10,
      locale: "en",
    },
  });

  return response.data;
}

export async function getObservations(
  taxonId: number,
  daysAgo: number = 30
): Promise<ObservationSearchResult> {
  const today = new Date();
  const pastDate = subDays(today, daysAgo);

  const d1 = format(pastDate, "yyyy-MM-dd");
  const d2 = format(today, "yyyy-MM-dd");

  const response = await axios.get(`${BASE_URL}/observations`, {
    params: {
      taxon_id: taxonId,
      d1: d1,
      d2: d2,
      per_page: 200, // Request a good number of observations
      order_by: "observed_on",
      order: "desc",
      verifiable: "true",
      photos: "true",
    },
  });

  // Process the response to ensure location data is correctly formatted
  const data = response.data;

  // Log some debug information about the response
  console.log(`API returned ${data?.results?.length || 0} observations`);
  if (data?.results?.length > 0) {
    const firstObs = data.results[0];
    console.log("First observation data structure:", {
      id: firstObs.id,
      coordinates: firstObs.geojson?.coordinates,
      lat: firstObs.latitude,
      lng: firstObs.longitude,
      location: firstObs.location,
    });
  }

  // Ensure each observation has a properly formatted location array
  if (data && data.results && Array.isArray(data.results)) {
    data.results = data.results.map((obs: any) => {
      // Check if the observation has geojson coordinates
      if (
        obs &&
        obs.geojson &&
        obs.geojson.coordinates &&
        Array.isArray(obs.geojson.coordinates)
      ) {
        // iNaturalist API returns coordinates as [lng, lat], but our app expects [lat, lng]
        const [lng, lat] = obs.geojson.coordinates;
        if (typeof lng === "number" && typeof lat === "number") {
          obs.location = [lat, lng];
        }
      }
      // Fallback to latitude/longitude if available
      else if (
        obs &&
        typeof obs.latitude === "number" &&
        typeof obs.longitude === "number"
      ) {
        obs.location = [obs.latitude, obs.longitude];
      }

      return obs;
    });
  }

  return data;
}

export function getPhotoUrl(observation: Observation): string {
  if (observation.photos && observation.photos.length > 0) {
    // Return medium-sized photo if available
    return observation.photos[0].url.replace("square", "medium");
  }
  return "";
}
