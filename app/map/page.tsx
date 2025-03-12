"use client";

import React from "react";
import { IndonesiaMap } from "../components/IndonesiaMap";
import { useLocations } from "../../hooks/useLocations";
import { defaultMapConfig } from "../../data/indonesiaLocations";
import Navbar from "../components/Navbar";
import MultiSelectForm, { FilterState } from "../components/filter/MultiSelectForm";

export default function MapPage() {
  const [filterState, setFilterState] = React.useState<FilterState | null>(null);

  const { data: locations, isLoading, error } = useLocations(filterState);

  return (
    <>
      <Navbar />
      <div className="w-full h-[calc(100vh-5rem)] relative">
        <div className="absolute top-4 left-4 bg-white shadow-lg rounded-lg p-4 z-20 max-w-lg">
          <MultiSelectForm
            onSubmitFilterState={setFilterState}
            initialFilterState={filterState}
          />
        </div>
        
        {/* Always render the map container */}
        <div className="relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-lg font-medium">Loading map data...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20">
              <div className="flex flex-col items-center">
                <p className="text-red-500 text-lg font-medium">Error: {error.message}</p>
                <p>Please try refreshing the page</p>
              </div>
            </div>
          )}
          
          {/* IndonesiaMap is always rendered, even during loading */}
          <IndonesiaMap 
            locations={locations || []} 
            config={defaultMapConfig} 
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </>
  );
}
