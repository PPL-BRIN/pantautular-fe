import { renderHook } from '@testing-library/react';
import { useIndonesiaMap } from './useIndonesiaMap';
import { MapChartService } from '../services/mapChartService';
import { MapLocation, MapConfig } from '../types';
import { useRef } from 'react';

// Mock useRef

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

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useRef: jest.fn(),
  }));
  

describe('useIndonesiaMap', () => {
  let mapServiceRef: { current: MapChartService | null };
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

    mapServiceRef = { current: null };
    (useRef as jest.Mock).mockReturnValue(mapServiceRef);

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

  test('should test early return branch when mapServiceRef.current exists', () => {
    /// Simulate mapServiceRef.current having a value
    mapServiceRef.current = new MapChartService();

    const { rerender } = renderHook(() => 
        useIndonesiaMap(containerId, mockLocations, mockConfig)
    );

    // Re-render with the same props
    rerender();

    // Ensure no new instance is created
    expect(mockDispose).toHaveBeenCalled();
    expect(mapServiceRef.current).toBeNull();
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

  test('should handle empty locations array', () => {
    renderHook(() => useIndonesiaMap(containerId, [], mockConfig));
    
    // Check if populateLocations was called with empty array
    expect(mockPopulateLocations).toHaveBeenCalledWith([]);
  });
});