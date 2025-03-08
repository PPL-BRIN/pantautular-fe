import { useState, useEffect } from "react";
import axios from "axios";

interface Location {
  id: string;
  city: string;
  location__latitude: number;
  location__longitude: number;
}

export function useCaseLocations(apiUrl: string) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get<Location[]>(apiUrl);
        setLocations(response.data);
        // setLocations(locationData);
      } catch (err) {
        setError("Failed to fetch location data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [apiUrl]);

  return { locations, loading, error, setError };
}