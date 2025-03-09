import { useState, useEffect } from "react";
import { DataFetcher } from "../interfaces/DataFetcher";
import { AxiosFetcher } from "../services/AxiosFetcher";

interface Location {
  id: string;
  city: string;
  location__latitude: number;
  location__longitude: number;
}

interface UseCaseLocationsConfig {
  apiUrl?: string;
  apiKey?: string;
  fetcher?: DataFetcher;
}

export function useCaseLocations({
  apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/cases/locations/`,
  apiKey = process.env.NEXT_PUBLIC_API_KEY as string,
  fetcher = new AxiosFetcher(),
}: UseCaseLocationsConfig = {}) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await fetcher.fetchData<Location[]>(apiUrl, { "X-API-KEY": apiKey });
        setLocations(data);
      } catch (err) {
        setError("Gagal mengambil data kasus. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [apiUrl, apiKey, fetcher]);

  return { locations, loading, error, setError };
}