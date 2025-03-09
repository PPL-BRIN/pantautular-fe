// components/IndonesiaMap.tsx - Presentation component
import React, { useEffect } from "react";
import { useIndonesiaMap } from "../../hooks/useIndonesiaMap";
import { useMapError } from "../../hooks/useMapError";
import MapLoadErrorPopup from "./MapLoadErrorPopup";
import { MapLocation, MapConfig } from "../../types";

interface IndonesiaMapProps {
  locations: MapLocation[];
  config?: Partial<MapConfig>;
  height?: string;
  width?: string;
  onError?: (message: string) => void; // Tambahkan prop onError
}

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({
  locations,
  config = {},
  height = "100vh",
  width = "100vw",
  onError, // Tangani error dari map
}) => {
  const mapContainerId = "chartdiv";
  const { error, setError, clearError } = useMapError();

  const fullConfig: MapConfig = {
    zoomLevel: config.zoomLevel ?? 2,
    centerPoint: config.centerPoint ?? { longitude: 113.9213, latitude: 0.7893 },
  };

  const { mapService } = useIndonesiaMap(mapContainerId, locations, fullConfig);

  useEffect(() => {
    // Tunggu 500ms untuk memastikan mapService tidak sekadar delay dalam inisialisasi
    const timeout = setTimeout(() => {
      if (!mapService) {
        console.log("IndonesiaMap Error: Gagal memuat peta.");
        setError("Gagal memuat peta. Silakan coba lagi.");
        if (onError) onError("Gagal memuat peta. Silakan coba lagi.");
      }
    }, 500);
  
    return () => clearTimeout(timeout);
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