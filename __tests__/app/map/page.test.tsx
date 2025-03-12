import { useEffect } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MapPage from "../../../app/map/page";
import { useLocations } from "../../../hooks/useLocations";
import { useMapError } from "../../../hooks/useMapError";

// Mock dependencies
jest.mock("../../../hooks/useLocations");
jest.mock("../../../hooks/useMapError");

// Create a reusable mock component with improved onClose handler access
let mockNoDataPopupOnClose: (() => void) | null = null;

// Mock IndonesiaMap component
const MockIndonesiaMap = (props: { onError?: (message: string) => void }) => {
  useEffect(() => {
    props.onError?.("Map loading failed test");
  }, [props.onError]);
  return <div data-testid="map-container">Map Component</div>;
};

jest.mock("../../../app/components/IndonesiaMap", () => ({
  IndonesiaMap: (props: any) => <MockIndonesiaMap {...props} />,
}));

jest.mock("../../../app/components/MapLoadErrorPopup", () => ({
  __esModule: true,
  default: jest.fn(({ message, onClose }) => (
    <div data-testid="map-error-popup">
      <p>{message}</p>
      <button onClick={onClose} data-testid="close-error-popup">Tutup</button>
    </div>
  )),
}));

jest.mock("../../../app/components/NoDataPopup", () => ({
  __esModule: true,
  default: jest.fn(({ onClose }) => {
    // Store the onClose handler for testing
    mockNoDataPopupOnClose = onClose;
    return (
      <div data-testid="no-data-popup">
        <p>Data Tidak Ditemukan</p>
        <button onClick={onClose} data-testid="close-no-data-popup">Tutup</button>
      </div>
    );
  }),
}));

describe("MapPage Component", () => {
  const mockSetMapError = jest.fn();
  const mockClearError = jest.fn();

  // Setup helper functions to reduce duplication
  const renderComponent = (useLocationsMock: { isLoading: boolean; error: Error | null; data: any[] | null | undefined }) => {
    jest.clearAllMocks();
    mockNoDataPopupOnClose = null;
    
    (useMapError as jest.Mock).mockReturnValue({
      error: useLocationsMock.error?.message ?? null,
      setError: mockSetMapError,
      clearError: mockClearError,
    });
    (useLocations as jest.Mock).mockReturnValue(useLocationsMock);
    return render(<MapPage />);
  };
  
  // Helper to check for presence of a component
  const expectComponentToBePresent = (testId: string) => {
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  };
  
  // Helper to check for absence of a component
  const expectComponentToBeAbsent = (testId: string) => {
    expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
  };

  test("should show loading state", () => {
    renderComponent({ isLoading: true, error: null, data: [] });
    expect(screen.getByText("Loading map data...")).toBeInTheDocument();
  });

  test("should show map error popup when server error occurs", async () => {
    renderComponent({ isLoading: false, error: new Error("Server error"), data: [] });
    await waitFor(() => expectComponentToBePresent("map-error-popup"));
  });

  test("should show no data popup when no locations found", async () => {
    renderComponent({ isLoading: false, error: null, data: [] });
    await waitFor(() => expectComponentToBePresent("no-data-popup"));
  });

  test("should render map when locations data is available", () => {
    renderComponent({
      isLoading: false,
      error: null,
      data: [{ id: "1", city: "Jakarta", location__latitude: -6.2088, location__longitude: 106.8456 }],
    });
    expectComponentToBePresent("map-container");
  });

  test("should call setMapError when map fails to load", () => {
    renderComponent({
      isLoading: false,
      error: null,
      data: [{ id: "1", city: "Jakarta", location__latitude: -6.2088, location__longitude: 106.8456 }],
    });
    expect(mockSetMapError).toHaveBeenCalledWith("Map loading failed test");
  });

  test("should show NoDataPopup when locations array is empty", async () => {
    renderComponent({ isLoading: false, error: null, data: [] });

    await waitFor(() => expectComponentToBePresent("no-data-popup"));
  });

  test("should close NoDataPopup when close button is clicked", async () => {
    renderComponent({ isLoading: false, error: null, data: [] });

    await waitFor(() => expectComponentToBePresent("no-data-popup"));
    
    fireEvent.click(screen.getByTestId("close-no-data-popup"));
    
    await waitFor(() => expectComponentToBeAbsent("no-data-popup"));
  });

  test("should show NoDataPopup when error message includes 'No case locations found'", async () => {
    // Ensure mocks are cleared
    jest.clearAllMocks();
    
    // Setup specific mock return values
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: new Error("No case locations found"),
      data: [],
    });
    
    (useMapError as jest.Mock).mockReturnValue({
      error: null, // Initially no map error
      setError: mockSetMapError,
      clearError: mockClearError,
    });
  
    render(<MapPage />);
  
    await waitFor(() => {
      const noDataPopup = screen.getByTestId("no-data-popup");
      expect(noDataPopup).toBeInTheDocument();
      expect(screen.getByText("Data Tidak Ditemukan")).toBeInTheDocument();
      expect(screen.queryByTestId("map-error-popup")).not.toBeInTheDocument();
    }, { timeout: 2000 }); // Increased timeout if needed
  });

  test("should render IndonesiaMap with empty array when locations is undefined", async () => {
    renderComponent({
      isLoading: false,
      error: null,
      data: undefined, // Explicitly testing the undefined case
    });
  
    await waitFor(() => {
      expectComponentToBePresent("map-container");
      expectComponentToBeAbsent("no-data-popup"); // Shouldn't show no data yet
      expectComponentToBeAbsent("map-error-popup");
      expect(mockSetMapError).toHaveBeenCalledWith("Map loading failed test"); // From MockIndonesiaMap
    });
  
    // Verify the second useEffect doesn't trigger isEmptyData yet
    expect(screen.queryByText("Data Tidak Ditemukan")).not.toBeInTheDocument();
  });
});