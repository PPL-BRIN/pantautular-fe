import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MapPage from "../../../app/map/page";
import { useLocations } from "../../../hooks/useLocations";
import { useMapError } from "../../../hooks/useMapError";

// Mock dependencies
jest.mock("../../../hooks/useLocations");
jest.mock("../../../hooks/useMapError");
jest.mock("../../../app/components/IndonesiaMap", () => ({
  IndonesiaMap: jest.fn(() => (
    <div data-testid="map-container" id="chartdiv" style={{ width: "100vw", height: "100vh" }} />
  )),
}));
jest.mock("../../../app/components/MapLoadErrorPopup", () => ({
  __esModule: true,
  default: jest.fn(({ message, onClose }) => (
    <div data-testid="map-error-popup">
      <p>{message}</p>
      <button onClick={onClose}>Tutup</button>
    </div>
  )),
}));

describe("MapPage Component", () => {
  const mockSetMapError = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMapError as jest.Mock).mockReturnValue({
      error: null,
      setError: mockSetMapError,
      clearError: mockClearError,
    });
  });

  test("should show loading state", () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      data: null,
    });

    render(<MapPage />);
    expect(screen.getByText("Loading map data...")).toBeInTheDocument();
  });

  test("should show error state when fetching locations fails", () => {
    const errorMessage = "Failed to fetch locations";

    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: new Error(errorMessage),
      data: null,
    });

    (useMapError as jest.Mock).mockReturnValue({
      error: errorMessage, // Pastikan error ini muncul dalam UI
      setError: mockSetMapError,
      clearError: mockClearError,
    });

    render(<MapPage />);

    // Pastikan error dikirim ke useMapError
    expect(mockSetMapError).toHaveBeenCalledWith(errorMessage);

    // Pastikan popup error muncul di UI
    expect(screen.getByTestId("map-error-popup")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("should render map when locations data is available", () => {
    const mockLocations = [
      { id: "1", city: "Jakarta", location__latitude: -6.2088, location__longitude: 106.8456 },
      { id: "2", city: "Surabaya", location__latitude: -7.2575, location__longitude: 112.7521 },
    ];

    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockLocations,
    });

    render(<MapPage />);

    // Pastikan elemen map ditampilkan
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  test("should handle empty locations array", () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: [],
    });

    render(<MapPage />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  test("should handle null locations data", () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: null,
    });

    render(<MapPage />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  test("should show error popup when map fails to load", () => {
    (useMapError as jest.Mock).mockReturnValue({
      error: "Gagal memuat peta. Silakan coba lagi.",
      setError: mockSetMapError,
      clearError: mockClearError,
    });

    render(<MapPage />);

    expect(screen.getByTestId("map-error-popup")).toBeInTheDocument();
    expect(screen.getByText("Gagal memuat peta. Silakan coba lagi.")).toBeInTheDocument();
  });

  test("should call clearError when closing map error popup", () => {
    (useMapError as jest.Mock).mockReturnValue({
      error: "Gagal memuat peta. Silakan coba lagi.",
      setError: mockSetMapError,
      clearError: mockClearError,
    });

    render(<MapPage />);

    screen.getByText("Tutup").click();
    expect(mockClearError).toHaveBeenCalled();
  });

  test("should call setMapError when IndonesiaMap triggers onError", () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: [
        { id: "1", city: "Jakarta", location__latitude: -6.2088, location__longitude: 106.8456 },
      ],
    });
  
    const IndonesiaMapModule = require("../../../app/components/IndonesiaMap");
    const originalIndonesiaMap = IndonesiaMapModule.IndonesiaMap;
    
    IndonesiaMapModule.IndonesiaMap = jest.fn(({ onError }) => {
      React.useEffect(() => {
        if (onError) {
          onError("Map loading failed test");
        }
      }, [onError]);
      
      return <div data-testid="map-container">Map Component</div>;
    });
  
    render(<MapPage />);
  
    expect(mockSetMapError).toHaveBeenCalledWith("Map loading failed test");
  
    IndonesiaMapModule.IndonesiaMap = originalIndonesiaMap;
  });
});