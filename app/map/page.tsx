"use client";

import React from "react";
import IndonesiaMap from "../components/IndonesiaMap";
import MapLoadErrorPopup from "../components/MapLoadErrorPopup";
import { useMapError } from "../../hooks/useMapError";
import { useCaseLocations } from "../../hooks/useCaseLocations";

export default function MapPage() {
  const { error, setError, clearError } = useMapError();
  const { locations, error: fetchError } = useCaseLocations("/api/locations");

  return (
    <div>
      {error && <MapLoadErrorPopup message={error} onClose={clearError} />}
      {fetchError && <MapLoadErrorPopup message={fetchError} onClose={() => {}} />}
      <IndonesiaMap onError={setError} locations={locations} />
    </div>
  );
}