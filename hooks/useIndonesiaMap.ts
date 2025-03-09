import { useEffect, useRef, useMemo } from "react";
import { MapChartService } from "../services/mapChartService";
import { MapLocation, MapConfig } from "../types";

export const useIndonesiaMap = (
  containerId: string,
  locations: MapLocation[],
  config: MapConfig
) => {
  const mapServiceRef = useRef<MapChartService | null>(null);

  useEffect(() => {
    if (mapServiceRef.current) {
      mapServiceRef.current.dispose();
      mapServiceRef.current = null;
    }

    try {
      mapServiceRef.current = new MapChartService();
      mapServiceRef.current.initialize(containerId, config);
      mapServiceRef.current.populateLocations(locations);
    } catch (error) {
      console.error("Error initializing map:", error);
      mapServiceRef.current = null; // Hanya jika ada error nyata
    }
  }, [containerId, locations, config]);

  return { mapService: mapServiceRef.current ?? null };
};