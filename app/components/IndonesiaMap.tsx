import React, { useState, useRef, useEffect, useCallback } from "react";
import { useUserLocation } from "../../hooks/useUserLocation";
import { useIndonesiaMap } from "../../hooks/useIndonesiaMap";
import { MapLocation, MapConfig } from "../../types";
import { LocationError } from "../../services/LocationService";
import LocationButton from "./LocationButton";
import LocationPermissionPopup from "./LocationPermissionPopup";
import LocationErrorPopup from "./LocationErrorPopup"

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


  const { mapService } = useIndonesiaMap(mapContainerId, locations, config);

  const handleLocationSuccess = useCallback((latitude: number, longitude: number) => {
    console.log(`Map will zoom to: ${latitude}, ${longitude}`);
    
    if (mapService) {
      // Use the coordinates to update the map
      mapService.zoomToLocation(latitude, longitude);
    }
  }, [mapService]);

  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [locationError, setLocationError] = useState<LocationError | null>(null);

  const { handleAllow, handleDeny } = useUserLocation(
    setShowPermissionPopup,
    setLocationError,
    handleLocationSuccess,
    () => setLocationError({ type: "PERMISSION_DENIED", message: "Anda menolak izin lokasi." })
  );
  
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
    <div className="relative w-full h-full"> {/* Keep relative for absolute children */}
      <div
        id={mapContainerId}
        data-testid="map-container"
        style={{ 
          width, 
          height,
          position: "absolute", // Make map container fill the parent
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />
      
      {/* Location Button - still works with absolute positioning */}
      <LocationButton 
        onClick={() => setShowPermissionPopup(true)}
        className="absolute top-4 left-4 z-10"
      />
      
      {/* Popups remain the same */}
      <LocationPermissionPopup
        open={showPermissionPopup}
        onClose={() => setShowPermissionPopup(false)}
        onAllow={handleAllow}
        onDeny={handleDeny}
      />
      
      {/* Error Popup */}
      {locationError && (
        <LocationErrorPopup
          open={!!locationError}
          errorType={locationError.type}
          onOpenChange={() => setLocationError(null)}
        />
      )}
    </div>
  );
};