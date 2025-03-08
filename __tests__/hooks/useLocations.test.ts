import { renderHook, waitFor } from '@testing-library/react';
import { useLocations } from '../../hooks/useLocations';
import { mapApi } from '../../services/api';
import { MapLocation } from '../../types';

// Mock the API module
jest.mock('../../services/api');

describe('useLocations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Positive case: Successful data fetch
  it('should fetch and set locations data successfully', async () => {
    const mockLocations: MapLocation[] = [
      { id: '1', city: 'Location 1', location__latitude: 1.0, location__longitude: 1.0 },
      { id: '2', city: 'Location 2', location__latitude: 2.0, location__longitude: 2.0 }
    ];

    (mapApi.getLocations as jest.Mock).mockResolvedValueOnce(mockLocations);

    const { result } = renderHook(() => useLocations());

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Final state
    expect(result.current.data).toEqual(mockLocations);
    expect(result.current.error).toBe(null);
    expect(mapApi.getLocations).toHaveBeenCalledTimes(1);
  });

  // Negative case: API error
  it('should handle API errors correctly', async () => {
    const error = new Error('API Error');
    (mapApi.getLocations as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useLocations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toEqual(error);
  });

  // Corner case: Empty response
  it('should handle empty response correctly', async () => {
    (mapApi.getLocations as jest.Mock).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useLocations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  // Corner case: Non-Error object thrown
  it('should handle non-Error objects in catch block', async () => {
    (mapApi.getLocations as jest.Mock).mockRejectedValueOnce('String error');

    const { result } = renderHook(() => useLocations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toEqual(new Error('Failed to fetch locations'));
  });

  // Corner case: Multiple rapid calls
  it('should handle multiple rapid calls correctly', async () => {
    const mockLocations: MapLocation[] = [
      { id: '1', city: 'Location 1', location__latitude: 1.0, location__longitude: 1.0 }
    ];
    (mapApi.getLocations as jest.Mock).mockResolvedValueOnce(mockLocations);

    const { result } = renderHook(() => useLocations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mapApi.getLocations).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockLocations);
  });
});