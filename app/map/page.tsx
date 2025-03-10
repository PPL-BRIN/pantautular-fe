"use client";

import { useEffect, useState } from "react";
import { IndonesiaMap } from "../components/IndonesiaMap";
import { useLocations } from "../../hooks/useLocations";
import { useMapError } from "../../hooks/useMapError"; // Hook untuk menangani error peta
import { defaultMapConfig } from "../../data/indonesiaLocations";
import Navbar from "../components/Navbar";
import MapLoadErrorPopup from "../components/MapLoadErrorPopup"; // Komponen popup error
import NoDataPopup from "../components/NoDataPopup"; // Komponen popup data tidak ditemukan

export default function MapPage() {
  const { data: locations, isLoading, error } = useLocations();
  const { error: mapError, setError: setMapError, clearError } = useMapError();
  const [isEmptyData, setIsEmptyData] = useState(false);

  useEffect(() => {
    if (error) {
      setMapError(error.message);
    }
  }, [error, setMapError]);

  useEffect(() => {
    if (locations && locations.length === 0 && !isLoading) {
      console.log(locations.length)
      setIsEmptyData(true);
    }
  }, [locations]);

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
    <>
      <Navbar />
      <div className="w-full h-[calc(100vh-5rem)] relative">
        {mapError && <MapLoadErrorPopup message={mapError} onClose={clearError} />}
        {isEmptyData && <NoDataPopup onClose={() => setIsEmptyData(false)} />}
        <IndonesiaMap
          locations={locations}
          config={defaultMapConfig}
          width="100%"
          height="100%"
          onError={(message) => setMapError(message)}
        />
      </div>
    </>
  );
}