import { useState, useEffect } from 'react';
import { MapLocation, FilterState } from '../types';
import { mapApi } from '../services/api';

export const useLocations = (filterState: FilterState) => {
  const [data, setData] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const locations = await mapApi.getFilteredLocations(filterState);
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
  }, [filterState]);

  return { data, isLoading, error };
};