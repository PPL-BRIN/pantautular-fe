import { useEffect, useRef, useState, useMemo } from "react";
import { MapChartService } from "../services/mapChartService";
import { MapLocation, MapConfig } from "../types";

export const useIndonesiaMap = (
  containerId: string,
  locations: MapLocation[],
  config: MapConfig,
) => {
  const mapServiceRef = useRef<MapChartService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const memoizedLocations = useMemo(() => locations, [JSON.stringify(locations)]);

  useEffect(() => {
    let mounted = true;
    
    const initializeMap = async () => {
      try {
        if (mapServiceRef.current) {
          mapServiceRef.current.dispose();
          mapServiceRef.current = null;
        }

        mapServiceRef.current = new MapChartService();
        mapServiceRef.current.initialize(containerId, config);
        mapServiceRef.current.populateLocations(memoizedLocations);

        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        mapServiceRef.current = null;
        if (mounted) setIsInitialized(false);
      }
    };

    initializeMap();

    return () => {
      mounted = false;
      if (mapServiceRef.current) {
        mapServiceRef.current.dispose();
      }
    };
  }, [containerId, memoizedLocations])
  return {
    mapService: mapServiceRef.current,
    isInitialized
  };
};