import { useEffect, useRef, useMemo } from "react";
import { MapChartService } from "../services/mapChartService";
import { MapLocation, MapConfig } from "../types";

export const useIndonesiaMap = (
  containerId: string,
  locations: MapLocation[],
  config: MapConfig
) => {
  const mapServiceRef = useRef<MapChartService | null>(null);

  // Memoize locations and config to prevent unnecessary re-renders
  const memoizedLocations = useMemo(() => locations, [JSON.stringify(locations)]);
  const memoizedConfig = useMemo(() => config, [JSON.stringify(config)]);

  useEffect(() => {
    // Dispose of the existing service if it exists
    if (mapServiceRef.current) {
      mapServiceRef.current.dispose();
      mapServiceRef.current = null;
    }

    
    // Create a new map service
    mapServiceRef.current = new MapChartService();

    // Initialize the chart
    mapServiceRef.current.initialize(containerId, memoizedConfig);

    // Add location data
    mapServiceRef.current.populateLocations(memoizedLocations);
    

    // Cleanup function
    return () => {
      if (mapServiceRef.current) {
        mapServiceRef.current.dispose();
        mapServiceRef.current = null;
      }
    };
  }, [containerId, memoizedLocations]);

  return { mapService: mapServiceRef.current };
};