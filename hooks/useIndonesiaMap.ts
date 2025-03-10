import { useEffect, useRef, useMemo } from "react";
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

  useEffect(() => {
    if (mapServiceRef.current) {
      mapServiceRef.current.dispose();
      mapServiceRef.current = null;
    }

    mapServiceRef.current = new MapChartService(onError);
    mapServiceRef.current.initialize(containerId, memoizedConfig);
    mapServiceRef.current.populateLocations(memoizedLocations);

    return () => {
      if (mapServiceRef.current) {
        mapServiceRef.current.dispose();
        mapServiceRef.current = null;
      }
    };
  }, [containerId, memoizedLocations, memoizedConfig, onError]);

  return { mapService: mapServiceRef.current };
};