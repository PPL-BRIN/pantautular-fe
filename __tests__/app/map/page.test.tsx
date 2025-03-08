import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapPage from '../../../app/map/page';
import { useLocations } from '../../../hooks/useLocations';

jest.mock('../../../hooks/useLocations');
jest.mock('../../../app/components/IndonesiaMap', () => ({
  IndonesiaMap: jest.fn(() => <div data-testid="map-container" id="chartdiv" style={{ width: '100vw', height: '100vh' }} />)
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
});
//