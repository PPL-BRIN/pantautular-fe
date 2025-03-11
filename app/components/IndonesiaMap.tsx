import React, { useEffect, useRef } from "react";
import { useIndonesiaMap } from "../../hooks/useIndonesiaMap";
import { useMapError } from "../../hooks/useMapError";
import MapLoadErrorPopup from "./MapLoadErrorPopup";
import { MapLocation, MapConfig } from "../../types";
import { useMapStore } from "@/store/store";

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

  const { mapService } = useIndonesiaMap(mapContainerId, locations, fullConfig); // Use the map service without passing selected count directly
  const isReady = !!mapService;

  const isReadyRef = useRef(isReady);

  // Update ref every time isReady changes
  useEffect(() => {
    isReadyRef.current = isReady;
    console.log("isReadyRef updated:", isReadyRef.current);
  }, [isReady]);

  // Error handling with timeout
  useEffect(() => {
    if (isReady) {
      console.log("Map already ready, skipping error timer");
      return;
    }
    
    console.log("Setting up error timer");
    let isMounted = true;
    
    const timer = setTimeout(() => {
      console.log("Error timer fired, checking isReady ref:", isReadyRef.current);
      if (isMounted && !isReadyRef.current) {
        console.log("Setting error - map not ready after timeout");
        setError("Gagal memuat peta. Silakan coba lagi.");
        if (onError) onError("Gagal memuat peta. Silakan coba lagi.");
      }
    }, MAP_LOAD_TIMEOUT);
    
    return () => {
      isMounted = false;
      console.log("Cleaning up error timer");
      clearTimeout(timer);
    };
  }, [isReady, onError, setError]);

  // Get countSelectedPoints from Zustand store
  const countSelectedPoints = useMapStore((state) => state.countSelectedPoints);

  return (
    <>
      {error && <MapLoadErrorPopup message={error} onClose={clearError} />}
      
      {/* Indicator for countSelectedPoints */}
      <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1000 }}>
        <span style={{ fontSize: "16px", fontWeight: "bold", color: "white", backgroundColor: "rgba(0,0,0,0.6)", padding: "5px", borderRadius: "10px" }}>
          {`Selected Points: ${countSelectedPoints}`}
        </span>
      </div>

      <div
        id={mapContainerId}
        data-testid="map-container"
        style={{ width, height }}
      />
    </>
  );
};
