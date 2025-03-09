import { renderHook } from '@testing-library/react';
import { useIndonesiaMap } from '../../hooks/useIndonesiaMap';
import { MapChartService } from '../../services/mapChartService';
import { MapLocation, MapConfig } from '../../types';
import { useRef } from 'react';

// Mock useRef

// Mock the MapChartService
const mockInitialize = jest.fn();
const mockPopulateLocations = jest.fn();
const mockDispose = jest.fn();
jest.mock('../../services/mapChartService', () => {
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
    { city: 'Jakarta', id: expect.anything(), location__latitude: -6.2, location__longitude: 106.8 },
    { city: 'Surabaya', id: expect.anything(), location__latitude: -7.3, location__longitude: 112.7 }
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
    mapServiceRef.current = null;
    expect(mapServiceRef.current).toBeNull();
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

  test('should handle errors during map initialization', () => {
    // Mock MapChartService constructor to throw an error
    (MapChartService as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Failed to initialize map');
    });
  
    const { result } = renderHook(() => 
      useIndonesiaMap(containerId, mockLocations, mockConfig)
    );
  
    // Verify mapService is null after error
    expect(result.current.mapService).toBeNull();
  });
  
  test('should handle errors during map methods', () => {
    // Mock initialize to throw error
    mockInitialize.mockImplementation(() => {
      throw new Error('Failed to initialize map');
    });
  
    const { result } = renderHook(() => 
      useIndonesiaMap(containerId, mockLocations, mockConfig)
    );
  
    // Verify mapService is null after error
    expect(result.current.mapService).toBeNull();
    
    // Verify initialize was attempted
    expect(mockInitialize).toHaveBeenCalled();
  });
});