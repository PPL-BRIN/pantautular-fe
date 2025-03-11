import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapPage from '../../../app/map/page';
import { useLocations } from '../../../hooks/useLocations';
import { mapApi } from '../../../services/api';
import { FilterState } from '@/types';
import { useEffect } from "react";
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

jest.mock('../../../services/api', () => ({
  mapApi: {
    getFilteredLocations: jest.fn().mockResolvedValue([])
  }
}));

jest.mock('../../../app/components/Navbar', () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">Navbar Component</div>
}));

jest.mock('../../../app/components/filter/FormFilter', () => ({
  __esModule: true,
  default: ({ onFilterApply }: { onFilterApply: (filters: FilterState) => void }) => (
    <div data-testid="form-filter">
      <button data-testid="apply-filter-button" onClick={() => onFilterApply({
        diseases: ['disease1'],
        locations: ['location1'],
        level_of_alertness: 3,
        portals: ['portal1'],
        start_date: '2023-01-01',
        end_date: '2023-01-31'
      })}>
        Terapkan
      </button>
    </div>
  ),
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
  const renderComponent = (useLocationsMock: { isLoading: boolean; error: Error | null; data: any[] | null }) => {
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
    renderComponent({ isLoading: true, error: null, data: null });
    expect(screen.getByText("Loading map data...")).toBeInTheDocument();
  });

  test.each([
    [new Error("Server error"), "map-error-popup"],
    [new Error("No case locations found"), "no-data-popup"],
  ])("should handle error states correctly", async (error, testId) => {
    renderComponent({ isLoading: false, error, data: null });
    await waitFor(() => expectComponentToBePresent(testId));
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

  // New test for empty locations array (lines 31-33)
  test("should show NoDataPopup when locations array is empty", async () => {
    renderComponent({
      isLoading: false,
      error: null,
      data: [], // Empty array
    });

    await waitFor(() => expectComponentToBePresent("no-data-popup"));
  });

  // New test for NoDataPopup onClose handler (line 53)
  test("should close NoDataPopup when close button is clicked", async () => {
    // Render with empty data to show the popup
    renderComponent({
      isLoading: false,
      error: null,
      data: [],
    });

    // Verify popup is shown
    await waitFor(() => expectComponentToBePresent("no-data-popup"));
    
    // Click the close button
    if (mockNoDataPopupOnClose) {
      mockNoDataPopupOnClose();
    } else {
      fireEvent.click(screen.getByTestId("close-no-data-popup"));
    }
    
    // Verify popup is closed - we need to re-render to see the effect
    // Re-render the component to see the state change
    await waitFor(() => expectComponentToBeAbsent("no-data-popup"));
  });

  test('should toggle filter panel when filter button is clicked', () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: []
    });
    
    render(<MapPage />);
    
    const filterButton = screen.getByTestId('filter-button');
    fireEvent.click(filterButton);
    expect(screen.getByTestId('form-filter')).toBeVisible();
  });

  test('should apply filters and fetch filtered data', async () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: []
    });

    const mockFilteredData = [{ id: 3, name: 'Filtered Location' }];
    (mapApi.getFilteredLocations as jest.Mock).mockResolvedValueOnce(mockFilteredData);
    
    render(<MapPage />);
    
    const applyButton = screen.getByTestId('apply-filter-button');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(mapApi.getFilteredLocations).toHaveBeenCalledWith({
        diseases: ['disease1'],
        locations: ['location1'],
        level_of_alertness: 3,
        portals: ['portal1'],
        start_date: '2023-01-01',
        end_date: '2023-01-31'
      });
    });
  });

  test('should handle error when fetching filtered data', async () => {
    const mockError = new Error('Network error');
    (mapApi.getFilteredLocations as jest.Mock).mockRejectedValueOnce(mockError);

    console.error = jest.fn();

    render(<MapPage />);

    const filterButton = screen.getByTestId('filter-button');
    fireEvent.click(filterButton);

    const applyButton = screen.getByTestId('apply-filter-button');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error fetching filtered data:", mockError);
    });
  });
});
