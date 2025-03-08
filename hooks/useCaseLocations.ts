import { useState, useEffect } from "react";
import axios from "axios";

interface Location {
  id: string;
  city: string;
  location__latitude: number;
  location__longitude: number;
}

export function useCaseLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get<Location[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/cases/locations/`, // URL API
          {
            headers: {
              "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY as string, // API Key dari .env
            },
          }
        );
        setLocations(response.data);
      } catch (err) {
        setError("Gagal mengambil data kasus. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, loading, error, setError };
}