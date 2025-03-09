"use client";

import React from "react";
import { IndonesiaMap } from "../components/IndonesiaMap";
import { useLocations } from "../../hooks/useLocations";
import { defaultMapConfig } from "../../data/indonesiaLocations";
import Navbar from "../components/Navbar";

export default function MapPage() {
  const { data: locations, isLoading, error } = useLocations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading map data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500">Error: {error.message}</p>
        <p>Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <IndonesiaMap 
      locations={locations} 
      config={defaultMapConfig} 
    />
    </>
  );
}
