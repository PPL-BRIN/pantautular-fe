import { useState, useEffect } from 'react';
import { MapLocation } from '../types';
import { mapApi } from '../services/api';

export const useLocations = () => {
  const [data, setData] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const locations = await mapApi.getLocations();
        setData(locations);
      } catch (err) {
        console.error('Error in useLocations:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch locations'));
        // Optionally set fallback data
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};