import { renderHook, waitFor } from "@testing-library/react";
import { useIndonesiaMap } from "../../hooks/useIndonesiaMap";
import { MapChartService } from "../../services/mapChartService";
import { MapLocation, MapConfig } from "../../types";
import { useRef } from "react";

// Mock fungsi-fungsi dari MapChartService
const mockInitialize = jest.fn();
const mockPopulateLocations = jest.fn();
const mockDispose = jest.fn();

// Mock MapChartService agar menggunakan fungsi di atas
jest.mock("../../services/mapChartService", () => {
  return {
    MapChartService: jest.fn().mockImplementation(() => {
      return {
        initialize: mockInitialize,
        populateLocations: mockPopulateLocations,
        dispose: mockDispose,
      };
    }),
  };
});

// Mock useRef dari React
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: jest.fn(),
}));

describe("useIndonesiaMap", () => {
  let mapServiceRef: { current: MapChartService | null };
  const containerId = "chartdiv";
  const mockLocations: MapLocation[] = [
    {
      city: "Jakarta",
      id: "1",
      location__latitude: -6.2,
      location__longitude: 106.8,
    },
    {
      city: "Surabaya",
      id: "2",
      location__latitude: -7.3,
      location__longitude: 112.7,
    },
  ];
  const mockConfig: MapConfig = {
    zoomLevel: 5,
    centerPoint: { longitude: 120, latitude: -5 },
  };
  const mockOnError = jest.fn(); // Mock fungsi error handling

  beforeEach(() => {
    jest.clearAllMocks();
    mapServiceRef = { current: null };
    (useRef as jest.Mock).mockReturnValue(mapServiceRef);
    document.body.innerHTML = `<div id="${containerId}"></div>`;
  });

  test("should return early if mapServiceRef.current is already set", () => {
    mapServiceRef.current = new MapChartService(mockOnError);

    const { rerender } = renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );

    // Re-render hook dengan props yang sama
    rerender();

    // Pastikan dispose dipanggil karena instance sebelumnya harus dibuang
    expect(mockDispose).toHaveBeenCalled();

    // Set kembali mapServiceRef ke null setelah dispose
    mapServiceRef.current = null;
    expect(mapServiceRef.current).toBeNull();
  });

  test("should create a new MapChartService instance on mount", async () => {
    renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );
  
    // Tunggu hingga efek selesai dan populateLocations() dipanggil
    await waitFor(() => {
      expect(mockPopulateLocations).toHaveBeenCalledWith(mockLocations);
    });
  
    // Pastikan MapChartService dibuat sekali
    expect(MapChartService).toHaveBeenCalledTimes(1);
  
    // Pastikan metode initialize() dipanggil
    expect(mockInitialize).toHaveBeenCalledWith(containerId, mockConfig);
  });  

  test("should dispose of MapChartService instance on unmount", () => {
    const { unmount } = renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );

    // Unmount hook, harus memanggil dispose()
    unmount();

    expect(mockDispose).toHaveBeenCalled();
  });

  test("should call onError if an error occurs during initialization", async () => {
    // Simulasikan error dalam inisialisasi
    mockInitialize.mockRejectedValueOnce(new Error("Initialization failed"));

    renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );

    // Tunggu sampai efek selesai dijalankan
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith("Failed to load the map. Please try again.");
    });
  });
});
