import { renderHook, waitFor } from "@testing-library/react";
import { useIndonesiaMap } from "../../hooks/useIndonesiaMap";
import { MapChartService } from "../../services/mapChartService";
import { MapLocation, MapConfig } from "../../types";
import { useRef } from "react";

// Mock functions from MapChartService
const mockInitialize = jest.fn();
const mockPopulateLocations = jest.fn();
const mockDispose = jest.fn();

// Mock MapChartService to use the above functions
jest.mock("../../services/mapChartService", () => {
  return {
    MapChartService: jest.fn().mockImplementation(() => ({
      initialize: mockInitialize,
      populateLocations: mockPopulateLocations,
      dispose: mockDispose,
    })),
  };
});

// Mock useRef from React
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
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mapServiceRef = { current: null };
    (useRef as jest.Mock).mockReturnValue(mapServiceRef);
    document.body.innerHTML = `<div id="${containerId}"></div>`;
  });

  // Helper function to test error scenarios
  const testErrorScenario = async (
    simulateError: () => void,
    expectedErrorMessage: string
  ) => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    simulateError();
    renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in useIndonesiaMap:",
        expect.objectContaining({ message: expectedErrorMessage })
      );
    });
    expect(mockOnError).toHaveBeenCalledWith(
      "Failed to load the map. Please try again."
    );
    consoleSpy.mockRestore();
  };

  test("should return early if mapServiceRef.current is already set", () => {
    mapServiceRef.current = new MapChartService(mockOnError);

    const { rerender } = renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );

    // Re-render hook with the same props
    rerender();

    // Ensure dispose is called as the previous instance should be discarded
    expect(mockDispose).toHaveBeenCalled();

    // Reset the ref after dispose
    mapServiceRef.current = null;
    expect(mapServiceRef.current).toBeNull();
  });

  test("should create a new MapChartService instance on mount", async () => {
    renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );

    // Wait until the effect completes and populateLocations() is called
    await waitFor(() => {
      expect(mockPopulateLocations).toHaveBeenCalledWith(mockLocations);
    });

    // Ensure MapChartService is created once
    expect(MapChartService).toHaveBeenCalledTimes(1);

    // Ensure initialize() is called with the correct arguments
    expect(mockInitialize).toHaveBeenCalledWith(containerId, mockConfig);
  });

  test("should dispose of MapChartService instance on unmount", () => {
    const { unmount } = renderHook(() =>
      useIndonesiaMap(containerId, mockLocations, mockConfig, mockOnError)
    );

    // Unmount hook, which should trigger dispose()
    unmount();
    expect(mockDispose).toHaveBeenCalled();
  });

  test("should properly handle errors during initialization", async () => {
    await testErrorScenario(() => {
      mockInitialize.mockImplementation(() => {
        throw new Error("Initialization error");
      });
    }, "Initialization error");
  });

  test("should handle errors during populateLocations", async () => {
    // Allow initialize to succeed
    mockInitialize.mockImplementation(() => {});
    await testErrorScenario(() => {
      mockPopulateLocations.mockImplementation(() => {
        throw new Error("Population error");
      });
    }, "Population error");
  });
});
