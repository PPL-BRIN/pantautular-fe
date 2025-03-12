import { useEffect, useRef, useMemo, useCallback } from "react";
import { MapChartService } from "../services/mapChartService";
import { MapLocation, MapConfig } from "../types";

export const useIndonesiaMap = (
  containerId: string,
  locations: MapLocation[],
  config: MapConfig,
  onError: (message: string) => void
) => {
  const mapServiceRef = useRef<MapChartService | null>(null);

  const memoizedLocations = useMemo(() => locations, [JSON.stringify(locations)]);
  const memoizedConfig = useMemo(() => config, [JSON.stringify(config)]);

  const showUserLocation = useCallback((latitude: number, longitude: number) => {
    if (mapServiceRef.current) {
      mapServiceRef.current.zoomToLocation(latitude, longitude);
    }
  }, []);

  useEffect(() => {
    if (mapServiceRef.current) {
      mapServiceRef.current.dispose();
      mapServiceRef.current = null;
    }

    const mapService = new MapChartService(onError);
    mapServiceRef.current = mapService;

    const initializeMap = async () => {
      try {
        mapService.initialize(containerId, memoizedConfig); // Pastikan menangani error async
        mapService.populateLocations(memoizedLocations);
      } catch (error) {
        console.error("Error in useIndonesiaMap:", error);
        onError("Failed to load the map. Please try again.");
      }
    };

    initializeMap(); // Jalankan fungsi async

    return () => {
      if (mapServiceRef.current) {
        mapServiceRef.current.dispose();
        mapServiceRef.current = null;
      }
    };
  }, [containerId, memoizedLocations, memoizedConfig, onError]);

  return { mapService: mapServiceRef.current, showUserLocation };
};