"use client";

import { useEffect, useState } from "react";
import { IndonesiaMap } from "../components/IndonesiaMap";
import { useLocations } from "../../hooks/useLocations";
import { useMapError } from "../../hooks/useMapError"; // Hook untuk menangani error peta
import { defaultMapConfig } from "../../data/indonesiaLocations";
import Navbar from "../components/Navbar";
import MapLoadErrorPopup from "../components/MapLoadErrorPopup"; // Komponen popup error
import NoDataPopup from "../components/NoDataPopup"; 
import MultiSelectForm, { FilterState } from "../components/filter/MultiSelectForm";

export default function MapPage() {
  const defaultFilterState: FilterState = {
    diseases: [],
    locations: [],
    level_of_alertness: 0,
    portals: [],
    start_date: null,
    end_date: null,
  };
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);
  const { data: locations, isLoading, error } = useLocations(filterState);
  const { error: mapError, setError: setMapError, clearError } = useMapError();
  const [isEmptyData, setIsEmptyData] = useState(false);

  useEffect(() => {
    if (error) {
      if (error.message.includes("No case locations found")) {
        setIsEmptyData(true);
      } else {
        setMapError(error.message);
      }
    }
  }, [error, setMapError]);

  useEffect(() => {
    if (!mapError && !error && locations != null && locations.length === 0 && !isLoading) {
      setIsEmptyData(true);
    }
  }, [locations, isLoading, mapError, error]);

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

  let popup = null;
  if (mapError) {
    popup = <MapLoadErrorPopup message={mapError} onClose={clearError} />;
  } else if (isEmptyData) {
    popup = <NoDataPopup onClose={() => setIsEmptyData(false)} />;
  }

  return (
    <>
      <Navbar />
      <div className="w-full h-[calc(100vh-5rem)] relative">
        <div className="absolute top-4 left-4 bg-white shadow-lg rounded-lg p-4 z-10 max-w-lg">
          <MultiSelectForm
            onSubmitFilterState={setFilterState}
            initialFilterState={filterState}
            onError={(message) => setMapError(message)}
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
          
          {/* {error && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20">
              <div className="flex flex-col items-center">
                <p className="text-red-500 text-lg font-medium">Error: {error.message}</p>
                <p>Please try refreshing the page</p>
              </div>
            </div>
          )} */}
          
          {/* IndonesiaMap is always rendered, even during loading */}
          {popup}
          <IndonesiaMap 
            locations={locations || []} 
            config={defaultMapConfig} 
            width="100%"
            height="100%"
            onError={(message) => setMapError(message)}
          />
        </div>
      </div>
    </>
  );
}