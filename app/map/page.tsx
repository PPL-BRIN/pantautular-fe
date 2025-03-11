"use client";

import { useEffect, useState } from "react";
import { IndonesiaMap } from "../components/IndonesiaMap";
import { useLocations } from "../../hooks/useLocations";
import { useMapError } from "../../hooks/useMapError"; // Hook untuk menangani error peta
import { defaultMapConfig } from "../../data/indonesiaLocations";
import Navbar from "../components/Navbar";
import FormFilter from "../components/filter/FormFilter";
import { mapApi } from "../../services/api";
import { MapLocation, FilterState } from "@/types";
import MapLoadErrorPopup from "../components/MapLoadErrorPopup"; // Komponen popup error
import NoDataPopup from "../components/NoDataPopup"; // Komponen popup data tidak ditemukan

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MapPage() {
  const { data: locations, isLoading, error } = useLocations();
  const { error: mapError, setError: setMapError, clearError } = useMapError();
  const [isEmptyData, setIsEmptyData] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    diseases: [],
    locations: [],
    level_of_alertness: 0,
    portals: [],
    start_date: "",
    end_date: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<MapLocation[] | null>(null);

  const apiEndpoint = `${API_BASE_URL}/api/filters/`;

  const handleFilterApply = (filters: FilterState) => {
    setAppliedFilters(filters);
    console.log("Filters applied:", filters);
    setIsFilterOpen(false); // Close filter panel after applying
  };

  useEffect(() => {
    if (locations && locations.length === 0 && !isLoading) {
      console.log(locations.length)
      setIsEmptyData(true);
    }
  }, [locations]);

  useEffect(() => {
    if (error) {
      if (
        error.message.includes("No case locations found matching the filters") ||
        error.message.includes("No case locations found")
      ) {
        setIsEmptyData(true); 
      } else {
        setMapError(error.message); // Tampilkan MapLoadErrorPopup jika error lain
      }
    }
  }, [error, setMapError]);

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        const data = await mapApi.getFilteredLocations(appliedFilters);
        setFilteredData(data);
      } catch (err) {
        console.error("Error fetching filtered data:", err);
      }
    };

    fetchFilteredData();
  }, [appliedFilters]);

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
        {mapError && <MapLoadErrorPopup message={mapError} onClose={clearError} />}
        {isEmptyData && <NoDataPopup onClose={() => setIsEmptyData(false)} />}
        <IndonesiaMap
          locations={filteredData || locations}
          config={defaultMapConfig}
          width="100%"
          height="100%"
        />
        <button
          data-testid="filter-button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="absolute top-4 left-4 bg-white shadow-lg rounded-full p-3 z-10 hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </button>
        
        <div className={`absolute top-20 left-4 z-20 transition-all duration-300 transform ${isFilterOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
          <FormFilter 
            onFilterApply={handleFilterApply}
            apiEndpoint={apiEndpoint}
          />
        </div>
      </div>
    </>
  );
}
