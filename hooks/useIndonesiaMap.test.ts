// hooks/useIndonesiaMap.test.tsx
import { renderHook } from '@testing-library/react';
import { useIndonesiaMap } from '../hooks/useIndonesiaMap';
import { MapChartService } from '../services/mapChartService';

// Mock the MapChartService
jest.mock('../services/mapChartService', () => {
  return {
    MapChartService: jest.fn().mockImplementation(() => {
      return {
        initialize: jest.fn(),
        populateLocations: jest.fn(),
        dispose: jest.fn()
      };
    })
  };
});

describe('useIndonesiaMap', () => {
  const mockLocations = [
    { city: 'TestCity', location: 'TestLocation', latitude: 1, longitude: 2 }
  ];
  const mockConfig = {
    zoomLevel: 3,
    centerPoint: { longitude: 100, latitude: 0 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize map service on first render', () => {
    const { result } = renderHook(() => 
      useIndonesiaMap('test-container', mockLocations, mockConfig)
    );

    // Check if MapChartService constructor was called
    expect(MapChartService).toHaveBeenCalled();
    
    // Get the instance from the mock
    const mockInstance = (MapChartService as jest.Mock).mock.instances[0];
    
    // Check if methods were called with correct arguments
    expect(mockInstance.initialize).toHaveBeenCalledWith('test-container', mockConfig);
    expect(mockInstance.populateLocations).toHaveBeenCalledWith(mockLocations);
  });

  test('should dispose map service on unmount', () => {
    const { unmount } = renderHook(() => 
      useIndonesiaMap('test-container', mockLocations, mockConfig)
    );
    
    // Get the instance from the mock
    const mockInstance = (MapChartService as jest.Mock).mock.instances[0];
    
    // Initial dispose should not be called
    expect(mockInstance.dispose).not.toHaveBeenCalled();
    
    // Unmount the hook
    unmount();
    
    // After unmount, dispose should be called
    expect(mockInstance.dispose).toHaveBeenCalled();
  });

  test('should return the map service instance', () => {
    const { result } = renderHook(() => 
      useIndonesiaMap('test-container', mockLocations, mockConfig)
    );
    
    // Check if mapService is returned
    expect(result.current.mapService).toBeDefined();
  });


test('should not call dispose if mapServiceRef.current is null', () => {
  const { unmount } = renderHook(() => 
    useIndonesiaMap('test-container', [], { zoomLevel: 1, centerPoint: { longitude: 0, latitude: 0 } })
  );

  // Get the instance from the mock
  const mockInstance = (MapChartService as jest.Mock).mock.instances[0];

  // Set mapServiceRef.current to null
  (mockInstance as any).dispose.mockImplementation(() => {
    (MapChartService as jest.Mock).mock.instances[0] = null;
  });

  // Unmount the hook
  unmount();

  // Verify that dispose was called once (during the initial cleanup)
  expect(mockInstance.dispose).toHaveBeenCalledTimes(1);

  // Unmount again (simulating a scenario where mapServiceRef.current is null)
  unmount();

  // Verify that dispose wasn't called again
  expect(mockInstance.dispose).toHaveBeenCalledTimes(1);
});
  
  

});