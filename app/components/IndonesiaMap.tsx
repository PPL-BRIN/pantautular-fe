import React, { useState, useRef, useEffect } from "react";
import { useIndonesiaMap } from "../../hooks/useIndonesiaMap";
import { MapLocation, MapConfig } from "../../types";

interface IndonesiaMapProps {
  locations: MapLocation[];
  config?: Partial<MapConfig>;
  height?: string;
  width?: string;
  onError: (message: string) => void;
}

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({
  locations,
  config = {},
  height = "100vh",
  width = "100vw",
  onError,
}) => {
  const mapContainerId = "chartdiv";
  const [errorTriggered, setErrorTriggered] = useState(false);
  const isFirstRender = useRef(true);
  
  // Full configuration with defaults
  const fullConfig: MapConfig = {
    zoomLevel: config.zoomLevel ?? 2,
    centerPoint: config.centerPoint ?? { longitude: 113.9213, latitude: 0.7893 },
  };

  // Wrap the onError callback to prevent repeated initialization after error
  const handleError = (message: string) => {
    if (!errorTriggered) {
      setErrorTriggered(true);
      onError(message);
    }
  };
  
  // Reset error flag when locations or config changes
  useEffect(() => {
    // Skip resetting on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Only reset if we have actual data
    if (locations && locations.length > 0) {
      setErrorTriggered(false);
    }
  }, [locations, config]);

  // Only initialize map if no errors have been triggered
  useIndonesiaMap(
    mapContainerId,
    errorTriggered ? [] : locations, // Empty locations when error is triggered
    fullConfig,
    handleError
  );

  // Return statement exactly as before
  return (
    <div
      id={mapContainerId}
      data-testid="map-container"
      style={{ width, height }}
    />
  );
};