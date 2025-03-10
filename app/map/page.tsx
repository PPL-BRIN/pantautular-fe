"use client";

import React from "react";
import IndonesiaMap from "../components/IndonesiaMap";
import MapLoadErrorPopup from "../components/MapLoadErrorPopup";
import { useMapError } from "../../hooks/useMapError";

export default function MapPage() {
  const { error, setError, clearError } = useMapError();

  return (
    <div>
      {error && <MapLoadErrorPopup message={error} onClose={clearError} />}
      <IndonesiaMap onError={setError} />
    </div>
  );
}