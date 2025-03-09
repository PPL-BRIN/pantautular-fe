// components/IndonesiaMap.tsx - Presentation component
import React, { useEffect } from "react";
import { useIndonesiaMap } from "../../hooks/useIndonesiaMap";
import { useMapError } from "../../hooks/useMapError";
import MapLoadErrorPopup from "./MapLoadErrorPopup";
import { MapLocation, MapConfig } from "../../types";

export const MAP_LOAD_TIMEOUT = 500;

interface IndonesiaMapProps {
  locations: MapLocation[];
  config?: Partial<MapConfig>;
  height?: string;
  width?: string;
  onError?: (message: string) => void;
}

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({
  locations,
  config = {},
  height = "100vh",
  width = "100vw",
  onError,
}) => {
  const mapContainerId = "chartdiv";
  const { error, setError, clearError } = useMapError();

  const fullConfig: MapConfig = {
    zoomLevel: config.zoomLevel ?? 2,
    centerPoint: config.centerPoint ?? { longitude: 113.9213, latitude: 0.7893 },
  };

  const { mapService } = useIndonesiaMap(mapContainerId, locations, fullConfig);

  // Use the exported constant
  useEffect(() => {
    // Create a handler function for better readability and testability
    const handleMapLoadTimeout = () => {
      if (!mapService) {
        setError("Gagal memuat peta. Silakan coba lagi.");
        if (onError) onError("Gagal memuat peta. Silakan coba lagi.");
      }
      // Jika tidak, mapService tersedia - tidak lakukan apa-apa
    };
  
    // Selalu buat timer terlepas dari status mapService
    const timer = setTimeout(handleMapLoadTimeout, MAP_LOAD_TIMEOUT);
    return () => clearTimeout(timer);
  }, [mapService, setError, onError]);

  return (
    <>
      {error && <MapLoadErrorPopup message={error} onClose={clearError} />}
      <div
        id={mapContainerId}
        data-testid="map-container"
        style={{ width, height }}
      />
    </>
  );
};