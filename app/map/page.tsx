"use client";

import React, { useEffect } from "react";
import { SelectedCountProvider } from "../context/SelectCountContex"
import { IndonesiaMap } from "../components/IndonesiaMap"; // Import the map component
import { useLocations } from "../../hooks/useLocations";
import { useMapError } from "../../hooks/useMapError";
import { defaultMapConfig } from "../../data/indonesiaLocations";
import Navbar from "../components/Navbar";
import MapLoadErrorPopup from "../components/MapLoadErrorPopup";

export default function MapPage() {
  const { data: locations, isLoading, error } = useLocations();
  const { error: mapError, setError: setMapError, clearError } = useMapError();

  useEffect(() => {
    console.log("useLocations Error:", error);
    if (error) {
      setMapError(error.message);
    }
  }, [error, setMapError]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
          Loading map data...
        </div>
      </>
    );
  }

  return (
    <SelectedCountProvider> {/* Wrap MapPage with SelectedCountProvider */}
      <Navbar />
      <div className="w-full h-[calc(100vh-5rem)] relative">
        {mapError && <MapLoadErrorPopup message={mapError} onClose={clearError} />}
        <IndonesiaMap 
          locations={locations} 
          config={defaultMapConfig} 
          width="100%"
          height="100%"
          onError={(message) => {
            setMapError(message);
          }}
        />
      </div>
    </SelectedCountProvider>
  );
}
