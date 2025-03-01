import { useEffect, useRef } from "react";
import { MapChartService } from "../services/mapChartService";
import { MapLocation, MapConfig } from "../types";

export const useIndonesiaMap = (
  containerId: string,
  locations: MapLocation[],
  config: MapConfig
) => {
  const mapServiceRef = useRef<MapChartService | null>(null);

  useEffect(() => {
    // Create a new map service if it doesn't exist
    if (!mapServiceRef.current) {
      mapServiceRef.current = new MapChartService();
      
      // Initialize the chart
      mapServiceRef.current.initialize(containerId, config);
      
      // Add location data
      mapServiceRef.current.populateLocations(locations);
    }

    // Cleanup function
    return () => {
      if (mapServiceRef.current) {
        mapServiceRef.current.dispose();
        mapServiceRef.current = null;
      }
    };
  }, [containerId, locations, config]);

  return { mapService: mapServiceRef.current };
};
