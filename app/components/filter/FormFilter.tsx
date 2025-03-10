"use client";

import { useState, useEffect } from "react";
import { MultiSelect } from "./MultiSelect";
import { DateRangePickerComponent } from "./DateRangePicker";

interface FilterOptions {
  diseases: string[];
  locations: string[];
  news: string[];
}

interface FormFilterProps {
  onFilterApply: (filters: FilterState) => void;
  apiEndpoint?: string;
}

interface FilterState {
  diseases: string[];
  locations: string[];
  level_of_alertness: number;
  portals: string[];
  start_date: string;
  end_date: string;
}

export default function FormFilter({ onFilterApply, apiEndpoint = "http://127.0.0.1:8000/api/filters/" }: FormFilterProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    diseases: [],
    locations: [],
    news: [],
  });

  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedNews, setSelectedNews] = useState<string[]>([]);
  const [alertLevel, setAlertLevel] = useState(0);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFilters() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(apiEndpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching filter data: ${response.status}`);
        }
        
        const data = await response.json();
        setFilterOptions(data);
      } catch (error) {
        console.error("Error fetching filter data:", error);
        setError("Gagal memuat data filter. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFilters();
  }, [apiEndpoint]);

  function resetFilters() {
    setSelectedDiseases([]);
    setSelectedLocations([]);
    setSelectedNews([]);
    setAlertLevel(0);
    setDateRange({ start: "", end: "" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const filterState: FilterState = {
      diseases: selectedDiseases,
      locations: selectedLocations,
      level_of_alertness: alertLevel,
      portals: selectedNews,
      start_date: dateRange.start,
      end_date: dateRange.end,
    };
    
    onFilterApply(filterState);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="block mb-2">
            <span className="text-gray-700">Jenis Penyakit</span>
          </label>
          <MultiSelect
            options={filterOptions.diseases}
            selected={selectedDiseases}
            onChange={setSelectedDiseases}
            placeholder="Pilih jenis penyakit"
          />
          
          <label className="block mt-4 mb-2">
            <span className="text-gray-700">Lokasi</span>
          </label>
          <MultiSelect
            options={filterOptions.locations}
            selected={selectedLocations}
            onChange={setSelectedLocations}
            placeholder="Provinsi atau kabupaten/kota"
          />
          
          <label className="block mt-4 mb-2">
            <span className="text-gray-700">Sumber Berita</span>
          </label>
          <MultiSelect
            options={filterOptions.news}
            selected={selectedNews}
            onChange={setSelectedNews}
            placeholder="Pilih sumber berita"
          />
          
          <label className="block mt-4 mb-2">
            <span className="text-gray-700">Tingkat Kewaspadaan</span>
          </label>
          <div className="border border-gray-300 rounded-md pb-1 pr-3 flex items-center justify-between shadow-sm mb-4">
            <span className="text-gray-400 pl-3">Tingkat Kewaspadaan:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-3xl transition-all ${
                    star <= alertLevel ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setAlertLevel(star)}
                >
                  {star <= alertLevel ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>
          
          <label className="block mb-2">
            <span className="text-gray-700">Tanggal</span>
          </label>
          <DateRangePickerComponent 
            dateRange={dateRange} 
            setDateRange={setDateRange}
          />

          <div className="flex flex-row justify-end space-x-2 mt-8">
            <button 
              type="button"
              onClick={resetFilters}
              className="w-2/6 bg-white text-blue-600 border border-blue-600 p-2 rounded-md hover:bg-gray-50 transition-colors">
              Atur Ulang
            </button>

            <button 
              type="submit" 
              className="w-2/6 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors">
              Terapkan
            </button>
          </div>
        </form>
      )}
    </div>
  );
}