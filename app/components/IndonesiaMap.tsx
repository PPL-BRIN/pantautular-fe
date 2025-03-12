import React, { useState, useCallback } from "react";
import { useUserLocation } from "../../hooks/useUserLocation";
import { useIndonesiaMap } from "../../hooks/useIndonesiaMap";
import { MapLocation, MapConfig } from "../../types";
import { LocationError } from "../../services/LocationService";
import LocationButton from "./LocationButton";
import LocationPermissionPopup from "./LocationPermissionPopup";
import LocationErrorPopup from "./LocationErrorPopup";

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
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [locationError, setLocationError] = useState<LocationError | null>(null);

  const fullConfig: MapConfig = {
    zoomLevel: config.zoomLevel ?? 2,
    centerPoint: config.centerPoint ?? { longitude: 113.9213, latitude: 0.7893 },
  };

  // Gunakan useIndonesiaMap untuk menangani peta
  const { mapService } = useIndonesiaMap(mapContainerId, locations, fullConfig, onError);

  // Fungsi untuk menangani zoom ke lokasi user
  const handleLocationSuccess = useCallback((latitude: number, longitude: number) => {
    console.log(`Zooming to user location: ${latitude}, ${longitude}`);
    
    if (mapService) {
      mapService.zoomToLocation(latitude, longitude);
    }
  }, [mapService]);

  // Gunakan useUserLocation untuk menangani izin lokasi
  const { handleAllow, handleDeny } = useUserLocation(
    setShowPermissionPopup,
    setLocationError,
    handleLocationSuccess,
    () => setLocationError({ type: "PERMISSION_DENIED", message: "Anda menolak izin lokasi." })
  );

  return (
    <div className="relative w-full h-full">
      <div
        id={mapContainerId}
        data-testid="map-container"
        style={{
          width,
          height,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />

      {/* Tombol izin lokasi */}
      <LocationButton 
        onClick={() => setShowPermissionPopup(true)}
        className="absolute top-4 left-4 z-10"
      />
      
      {/* Popup izin lokasi */}
      <LocationPermissionPopup
        open={showPermissionPopup}
        onClose={() => setShowPermissionPopup(false)}
        onAllow={handleAllow}
        onDeny={handleDeny}
      />
      
      {/* Popup error lokasi */}
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