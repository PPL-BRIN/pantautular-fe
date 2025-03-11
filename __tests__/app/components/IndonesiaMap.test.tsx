import { renderHook, waitFor } from "@testing-library/react";
import { useIndonesiaMap } from "../../../hooks/useIndonesiaMap";
import { MapChartService } from "../../../services/mapChartService";
import { useRef } from "react";

// Mock fungsi-fungsi dari MapChartService
const mockInitialize = jest.fn();
const mockPopulateLocations = jest.fn();
const mockDispose = jest.fn();

// Mock MapChartService
jest.mock("../../../services/mapChartService", () => ({
  MapChartService: jest.fn().mockImplementation(() => ({
    initialize: mockInitialize,
    populateLocations: mockPopulateLocations,
    dispose: mockDispose,
  })),
}));

// Mock useRef dari React
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: jest.fn(),
}));

describe("useIndonesiaMap", () => {
  let mapServiceRef: { current: MapChartService | null };
  const containerId = "chartdiv";
  const mockLocations = [
    { city: "Jakarta", id: "1", location__latitude: -6.2, location__longitude: 106.8 },
    { city: "Surabaya", id: "2", location__latitude: -7.3, location__longitude: 112.7 },
  ];
  const mockConfig = { zoomLevel: 2, centerPoint: { longitude: 113.9213, latitude: 0.7893 } };
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mapServiceRef = { current: null };
    (useRef as jest.Mock).mockReturnValue(mapServiceRef);
    document.body.innerHTML = `<div id="${containerId}"></div>`;
  });

  test("should dispose and reinitialize when mapServiceRef.current exists", async () => {
    mapServiceRef.current = { initialize: jest.fn(), populateLocations: jest.fn(), dispose: mockDispose };

    const { result } = renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );

    await waitFor(() => {
      expect(mockDispose).toHaveBeenCalledTimes(1);
      expect(MapChartService).toHaveBeenCalledTimes(1);
      expect(mockInitialize).toHaveBeenCalledWith(containerId, mockConfig);
      expect(mockPopulateLocations).toHaveBeenCalledWith(mockLocations);
      expect(mapServiceRef.current).not.toBeNull(); // Check ref directly
    });
  });

  // Fixed Test
  test("should initialize MapChartService with memoized values on mount", async () => {
    const { result } = renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );

    await waitFor(() => {
      expect(MapChartService).toHaveBeenCalledTimes(1);
      expect(mockInitialize).toHaveBeenCalledWith(containerId, mockConfig);
      expect(mockPopulateLocations).toHaveBeenCalledWith(mockLocations);
      expect(mapServiceRef.current).not.toBeNull(); // Check ref directly
      expect(mockDispose).not.toHaveBeenCalled();
    });
  });

  test("should dispose MapChartService on unmount", async () => {
    const { unmount } = renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledWith(containerId, mockConfig);
      expect(mapServiceRef.current).not.toBeNull();
    });

    unmount();

    await waitFor(() => {
      expect(mockDispose).toHaveBeenCalledTimes(1);
      expect(mapServiceRef.current).toBeNull();
    });
  });

  test("should handle errors during populateLocations", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    mockInitialize.mockImplementation(() => {});
    mockPopulateLocations.mockImplementation(() => {
      throw new Error("Population error");
    });

    renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in useIndonesiaMap:",
        expect.objectContaining({ message: "Population error" })
      );
      expect(mockOnError).toHaveBeenCalledWith("Failed to load the map. Please try again.");
    });

    consoleSpy.mockRestore();
  });

  test("should properly handle errors during initialization", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    mockInitialize.mockImplementation(() => {
      throw new Error("Initialization error");
    });

    renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in useIndonesiaMap:",
        expect.objectContaining({ message: "Initialization error" })
      );
      expect(mockOnError).toHaveBeenCalledWith("Failed to load the map. Please try again.");
    });

    consoleSpy.mockRestore();
  });
});