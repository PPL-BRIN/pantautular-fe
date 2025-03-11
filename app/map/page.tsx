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
      <>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
          Loading map data...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)]">
          <p className="text-red-500">Error: {error.message}</p>
          <p>Please try refreshing the page</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="w-full h-[calc(100vh-5rem)] relative">
        <IndonesiaMap 
          locations={locations} 
          config={defaultMapConfig} 
          width="100%"
          height="100%"
        />
      </div>
    </>
  );
}
