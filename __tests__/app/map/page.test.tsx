import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapPage from '../../../app/map/page';
import { useLocations } from '../../../hooks/useLocations';
import { mapApi } from '../../../services/api';
import { FilterState } from '@/types';

jest.mock('../../../hooks/useLocations');
jest.mock('../../../app/components/IndonesiaMap', () => ({
  IndonesiaMap: jest.fn(() => <div data-testid="map-container" id="chartdiv" style={{ width: '100vw', height: '100vh' }} />)
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
  )
}));

describe('MapPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading state', () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      data: null
    });
    
    render(<MapPage />);
    expect(screen.getByText('Loading map data...')).toBeInTheDocument();
  });

  test('should show error state', () => {
    const errorMessage = 'Failed to fetch locations';
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: new Error(errorMessage),
      data: null
    });
    
    render(<MapPage />);
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    expect(screen.getByText('Please try refreshing the page')).toBeInTheDocument();
  });

  test('should render map with locations data', () => {
    const mockLocations = [
      { id: 1, name: 'Location 1' },
      { id: 2, name: 'Location 2' }
    ];
    
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockLocations
    });
    
    render(<MapPage />);
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  test('should handle empty locations array', () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: []
    });
    
    render(<MapPage />);
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  test('should handle null locations data', () => {
    (useLocations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: null
    });
    
    render(<MapPage />);
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
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
//