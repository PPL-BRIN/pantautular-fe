// components/IndonesiaMap.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { IndonesiaMap } from './IndonesiaMap';
import { useIndonesiaMap } from '../../hooks/useIndonesiaMap';

// Mock the custom hook
jest.mock('../../hooks/useIndonesiaMap', () => ({
  useIndonesiaMap: jest.fn()
}));

describe('IndonesiaMap', () => {
  const mockLocations = [
    { city: 'TestCity', location: 'TestLocation', latitude: 1, longitude: 2 }
  ];

  beforeEach(() => {
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: {} });
  });

  test('renders with default props', () => {
    render(<IndonesiaMap locations={mockLocations} />);
    
    const container = screen.getByTestId('map-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('id', 'chartdiv');
    expect(container).toHaveStyle({
      width: '100vw',
      height: '100vh'
    });
    
    // Verify hook was called with defaults
    expect(useIndonesiaMap).toHaveBeenCalledWith(
      'chartdiv',
      mockLocations,
      expect.objectContaining({
        zoomLevel: 2,
        centerPoint: expect.anything()
      })
    );
  });

  test('renders with custom props', () => {
    const customConfig = {
      zoomLevel: 5,
      centerPoint: { longitude: 110, latitude: -5 }
    };
    
    render(
      <IndonesiaMap 
        locations={mockLocations} 
        config={customConfig}
        width="800px"
        height="400px"
      />
    );
    
    const container = screen.getByTestId('map-container');
    expect(container).toHaveStyle({
      width: '800px',
      height: '400px'
    });
    
    // Verify hook was called with custom config
    expect(useIndonesiaMap).toHaveBeenCalledWith(
      'chartdiv',
      mockLocations,
      expect.objectContaining({
        zoomLevel: 5,
        centerPoint: expect.objectContaining({
          longitude: 110,
          latitude: -5
        })
      })
    );
  });

  test('renders with partial config', () => {
    const partialConfig = {
      zoomLevel: 3
      // No centerPoint provided
    };
    
    render(<IndonesiaMap locations={mockLocations} config={partialConfig} />);
    
    // Verify hook was called with merged config
    expect(useIndonesiaMap).toHaveBeenCalledWith(
      'chartdiv',
      mockLocations,
      expect.objectContaining({
        zoomLevel: 3,
        centerPoint: expect.anything() // Default centerPoint should be used
      })
    );
  });
});