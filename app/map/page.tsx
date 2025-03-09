"use client";

import React, { useEffect } from "react";
import IndonesiaMap from "../components/IndonesiaMap";
import MapLoadErrorPopup from "../components/MapLoadErrorPopup";
import { useMapError } from "../../hooks/useMapError";
import { useCaseLocations } from "../../hooks/useCaseLocations";

export default function MapPage() {
  const { error, setError, clearError } = useMapError();
  const { locations, error: fetchError } = useCaseLocations();

  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError, setError]);

  return (
    <div>
      {error && <MapLoadErrorPopup message={error} onClose={clearError} />}
      <IndonesiaMap onError={setError} locations={locations} />
    </div>
  );
}