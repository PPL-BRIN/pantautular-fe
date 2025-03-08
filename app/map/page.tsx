"use client";

import React, { useEffect } from "react";
import IndonesiaMap from "../components/IndonesiaMap";
import MapLoadErrorPopup from "../components/MapLoadErrorPopup";
import { useMapError } from "../../hooks/useMapError";
import { useCaseLocations } from "../../hooks/useCaseLocations";

export default function MapPage() {
  const { error, setError, clearError } = useMapError();

  // sesuaikan API URL untuk fetch data lokasi
  const { locations, error: fetchError } = useCaseLocations("/api/locations");

  // Jika terjadi fetch error, set error ke useMapError agar bisa dikontrol dari satu sumber
  useEffect(() => {
    if (fetchError) {
      setError("Gagal mengambil data kasus. Silakan coba lagi.");
    }
  }, [fetchError, setError]);

  return (
    <div>
      {error && <MapLoadErrorPopup message={error} onClose={clearError} />}
      <IndonesiaMap onError={setError} locations={locations} />
    </div>
  );
}