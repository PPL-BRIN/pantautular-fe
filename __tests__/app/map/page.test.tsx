import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
jest.mock("../../../app/components/NoDataPopup", () => ({
  __esModule: true,
  default: jest.fn(({ onClose }) => (
    <div data-testid="no-data-popup">
      <p>Data Tidak Ditemukan</p>
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
      error: errorMessage, 
      setError: mockSetMapError,
      clearError: mockClearError,
    });

    render(<MapPage />);

    expect(mockSetMapError).toHaveBeenCalledWith(errorMessage);
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
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  test("should show NoDataPopup when locations array is empty", async () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: [],
    });

    render(<MapPage />);

    expect(screen.getByTestId("no-data-popup")).toBeInTheDocument();
    expect(screen.getByText("Data Tidak Ditemukan")).toBeInTheDocument();
  });

  test("should close NoDataPopup when close button is clicked", async () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: [],
    });

    render(<MapPage />);

    expect(screen.getByTestId("no-data-popup")).toBeInTheDocument();

    screen.getByText("Tutup").click();

    await waitFor(() => {
      expect(screen.queryByTestId("no-data-popup")).not.toBeInTheDocument();
    });
  });

  test("should show NoDataPopup when API returns 'No case locations found matching the filters'", async () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: new Error("No case locations found matching the filters"),
      data: null,
    });

    render(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("no-data-popup")).toBeInTheDocument();
      expect(screen.getByText("Data Tidak Ditemukan")).toBeInTheDocument();
    });
  });

  test("should show NoDataPopup when API returns 'No case locations found'", async () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: new Error("No case locations found"),
      data: null,
    });

    render(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("no-data-popup")).toBeInTheDocument();
      expect(screen.getByText("Data Tidak Ditemukan")).toBeInTheDocument();
    });
  });

  test("should show MapLoadErrorPopup when API returns other errors", async () => {
    const errorMessage = "Server error";
    
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: new Error(errorMessage),
      data: null,
    });
    
    (useMapError as jest.Mock).mockReturnValue({
      error: errorMessage,
      setError: mockSetMapError,
      clearError: mockClearError,
    });

    render(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("map-error-popup")).toBeInTheDocument();
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
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