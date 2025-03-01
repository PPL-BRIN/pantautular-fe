import { renderHook } from '@testing-library/react';
import { useIndonesiaMap } from './useIndonesiaMap';
import { MapChartService } from '../services/mapChartService';
import { MapLocation, MapConfig } from '../types';

// Mock the MapChartService
const mockInitialize = jest.fn();
const mockPopulateLocations = jest.fn();
const mockDispose = jest.fn();
jest.mock('../services/mapChartService', () => {
  return {
    MapChartService: jest.fn().mockImplementation(() => {
      return {
        initialize: mockInitialize,
        populateLocations: mockPopulateLocations,
        dispose: mockDispose
      };
    })
  };
});

describe('useIndonesiaMap', () => {
  const containerId = 'chartdiv';
  const mockLocations: MapLocation[] = [
    { city: 'Jakarta', location: 'Jakarta Office', latitude: -6.2, longitude: 106.8 },
    { city: 'Surabaya', location: 'Surabaya Office', latitude: -7.3, longitude: 112.7 }
  ];
  const mockConfig: MapConfig = {
    zoomLevel: 5,
    centerPoint: { longitude: 120, latitude: -5 }
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up DOM element
    document.body.innerHTML = `<div id="${containerId}"></div>`;
  });

  test('should create a new MapChartService instance on mount', () => {
    const { result } = renderHook(() => 
      useIndonesiaMap(containerId, mockLocations, mockConfig)
    );

    // Check if MapChartService constructor was called
    expect(MapChartService).toHaveBeenCalledTimes(1);
    
    // Check if mapService was returned
    expect(result.current.mapService).toBeDefined();
  });

  test('should initialize map with correct parameters', () => {
    renderHook(() => useIndonesiaMap(containerId, mockLocations, mockConfig));

    // Check if initialize was called with correct parameters
    expect(mockInitialize).toHaveBeenCalledWith(containerId, mockConfig);
    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });

  test('should populate locations with provided data', () => {
    renderHook(() => useIndonesiaMap(containerId, mockLocations, mockConfig));
    
    // Check if populateLocations was called with correct parameters
    expect(mockPopulateLocations).toHaveBeenCalledWith(mockLocations);
    expect(mockPopulateLocations).toHaveBeenCalledTimes(1);
  });

  test('should dispose map service on unmount', () => {
    const { unmount } = renderHook(() => 
      useIndonesiaMap(containerId, mockLocations, mockConfig)
    );
    
    // Simulate component unmount
    unmount();
    
    // Check if dispose was called
    expect(mockDispose).toHaveBeenCalledTimes(1);
  });

  test('should not recreate map service on props change', () => {
    const { rerender } = renderHook(
      (props) => useIndonesiaMap(props.containerId, props.locations, props.config),
      { 
        initialProps: {
          containerId,
          locations: mockLocations,
          config: mockConfig
        }
      }
    );

    // First render should create one instance
    expect(MapChartService).toHaveBeenCalledTimes(1);
        
    // Update props
    const updatedLocations = [...mockLocations, {
      city: 'Bandung', 
      location: 'Bandung Office', 
      latitude: -6.9, 
      longitude: 107.6
    }];
    
    rerender({
      containerId,
      locations: updatedLocations,
      config: mockConfig
    });
    
    // Should not create new instance
    expect(MapChartService).toHaveBeenCalled();
    
    // But should call dispose and initialize again
    expect(mockDispose).toHaveBeenCalledTimes(1);
    expect(mockInitialize).toHaveBeenCalledTimes(2);
    expect(mockPopulateLocations).toHaveBeenCalledTimes(2);
    expect(mockPopulateLocations).toHaveBeenLastCalledWith(updatedLocations);
  });

  test('should handle empty locations array', () => {
    renderHook(() => useIndonesiaMap(containerId, [], mockConfig));
    
    // Check if populateLocations was called with empty array
    expect(mockPopulateLocations).toHaveBeenCalledWith([]);
  });
});