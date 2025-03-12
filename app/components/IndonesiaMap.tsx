import React, { useState, useCallback } from "react";
import { useUserLocation } from "../../hooks/useUserLocation";
import { useIndonesiaMap } from "../../hooks/useIndonesiaMap";
import { MapLocation, MapConfig } from "../../types";
import { LocationError } from "../../services/LocationService";
// import LocationButton from "./LocationButton";
import LocationPermissionPopup from "./LocationPermissionPopup";
<<<<<<< HEAD
import LocationErrorPopup from "./LocationErrorPopup"
import DashboardButton from "./floating_buttons/DashboardButton";
import WarningButton from "./floating_buttons/WarningButton";
import FilterButton from "./floating_buttons/FilterButton";
import LocationButton from "./floating_buttons/LocationButton";
import {MapButton} from "./floating_buttons/MapButton";
=======
import LocationErrorPopup from "./LocationErrorPopup";
>>>>>>> origin/pbi-c03-integrate_form_popup_location

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
<<<<<<< HEAD
    console.log("Zooming to user location: ${latitude}, ${longitude}");
=======
    console.log(`Zooming to user location: ${latitude}, ${longitude}`);
>>>>>>> origin/pbi-c03-integrate_form_popup_location
    
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

<<<<<<< HEAD
  // Return statement exactly as before
=======
>>>>>>> origin/pbi-c03-integrate_form_popup_location
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
<<<<<<< HEAD
      
      <div className="absolute top-4 left-4 flex gap-4">
        <FilterButton />
        <LocationButton onClick={() => setShowPermissionPopup(true)}/>
        <WarningButton />
      </div>
      <div className="absolute top-4 right-5 flex gap-2">
        <DashboardButton />
        <MapButton />
      </div>
=======

      {/* Tombol izin lokasi */}
      <LocationButton 
        onClick={() => setShowPermissionPopup(true)}
        className="absolute top-4 left-4 z-10"
      />
>>>>>>> origin/pbi-c03-integrate_form_popup_location
      
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