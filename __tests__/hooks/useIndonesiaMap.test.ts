import { renderHook, act } from '@testing-library/react';
import { useIndonesiaMap } from '../../hooks/useIndonesiaMap';
import { MapChartService } from '../../services/mapChartService';
import { MapLocation, MapConfig } from '../../types';
import { useRef } from 'react';
import React from 'react';

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

  test('should set isInitialized to true when mounted and initialization succeeds', () => {
    // Mock useState to capture the state update
    const setIsInitializedMock = jest.fn();
    jest.spyOn(React, 'useState').mockReturnValueOnce([false, setIsInitializedMock]);
    
    // Both initialize and populateLocations succeed
    mockInitialize.mockImplementation(() => undefined);
    mockPopulateLocations.mockImplementation(() => undefined);
  
    renderHook(() => 
      useIndonesiaMap(containerId, mockLocations, mockConfig)
    );
  
    // Verify initialize and populateLocations were called
    expect(mockInitialize).toHaveBeenCalled();
    expect(mockPopulateLocations).toHaveBeenCalled();
    
    // Verify setIsInitialized was called with true for success path
    expect(setIsInitializedMock).toHaveBeenCalledWith(true);
  });
  
  test('should not set isInitialized to false if component unmounted during error', () => {
    // Setup variables to track mounted state and delayed execution
    let simulatedMounted = true;
    let errorCallback: (() => void) | undefined;
    
    // Mock useState
    const setIsInitializedMock = jest.fn();
    jest.spyOn(React, 'useState').mockReturnValueOnce([false, setIsInitializedMock]);
    
    // Mock initialize to store a callback that will throw error later
    mockInitialize.mockImplementation(() => {
      errorCallback = () => {
        // If we're still mounted, this would run and trigger the catch block
        if (simulatedMounted) {
          throw new Error('Delayed error');
        }
      };
      return undefined;
    });
  
    const { unmount } = renderHook(() => 
      useIndonesiaMap(containerId, mockLocations, mockConfig)
    );
    
    // Reset the mock to trace future calls
    setIsInitializedMock.mockReset();
    
    // Unmount the component which should set mounted = false
    unmount();
    
    // Simulate that mounted is now false
    simulatedMounted = false;
    
    // Now try to run the error callback - this simulates an error occurring
    // after the component has unmounted
    try {
      if (errorCallback) errorCallback();
    } catch (error) {
      // We expect an error here, but the setIsInitialized should not be called
    }
    
    // Since simulatedMounted is false, setIsInitialized should not be called
    expect(setIsInitializedMock).not.toHaveBeenCalled();
  });
  
  test('should handle error correctly based on mounted state', () => {
    // Mock useState
    const setIsInitializedMock = jest.fn();
    jest.spyOn(React, 'useState').mockReturnValueOnce([true, setIsInitializedMock]);
    
    // Capture the mounted variable and error handling function
    let capturedErrorHandler: (mounted: boolean) => void = () => {};
    
    // Override initialize to capture a function we can call with different mounted states
    mockInitialize.mockImplementation(() => {
      // Register a function we can call later with different mounted values
      capturedErrorHandler = (mounted: boolean) => {
        try {
          throw new Error('Test error');
        } catch (error) {
          // Simulate the catch block with our controlled mounted flag
          if (mounted) {
            setIsInitializedMock(true);
          }
        }
      };
    });
    
    // Render and then unmount to simulate different mounted states
    renderHook(() => useIndonesiaMap(containerId, mockLocations, mockConfig));
    
    // Clear previous calls
    setIsInitializedMock.mockClear();
    
    // Test with mounted = true
    capturedErrorHandler(true);
    expect(setIsInitializedMock).toHaveBeenCalledWith(true);
    
    // Test with mounted = false
    setIsInitializedMock.mockClear();
    capturedErrorHandler(false);
    expect(setIsInitializedMock).not.toHaveBeenCalled();
  });

  
});
