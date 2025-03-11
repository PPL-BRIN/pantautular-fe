import { renderHook, act } from '@testing-library/react';
import { useMapStore } from '../../store/store';

describe('useMapStore', () => {
  // Reset the store before each test
  beforeEach(() => {
    act(() => {
      useMapStore.setState({ countSelectedPoints: 0 });
    });
  });

  // Positive cases
  it('should initialize with countSelectedPoints as 0', () => {
    const { result } = renderHook(() => useMapStore());
    expect(result.current.countSelectedPoints).toBe(0);
  });

  it('should update countSelectedPoints when setCountSelectedPoints is called', () => {
    const { result } = renderHook(() => useMapStore());
    
    act(() => {
      result.current.setCountSelectedPoints(5);
    });

    expect(result.current.countSelectedPoints).toBe(5);
  });

  it('should handle multiple state updates', () => {
    const { result } = renderHook(() => useMapStore());
    
    act(() => {
      result.current.setCountSelectedPoints(5);
      result.current.setCountSelectedPoints(10);
    });

    expect(result.current.countSelectedPoints).toBe(10);
  });

  // Negative cases
  it('should handle negative numbers', () => {
    const { result } = renderHook(() => useMapStore());
    
    act(() => {
      result.current.setCountSelectedPoints(-1);
    });

    expect(result.current.countSelectedPoints).toBe(-1);
  });

  // Corner cases
  it('should handle setting to zero', () => {
    const { result } = renderHook(() => useMapStore());
    
    act(() => {
      result.current.setCountSelectedPoints(5);
      result.current.setCountSelectedPoints(0);
    });

    expect(result.current.countSelectedPoints).toBe(0);
  });

  it('should handle large numbers', () => {
    const { result } = renderHook(() => useMapStore());
    
    act(() => {
      result.current.setCountSelectedPoints(Number.MAX_SAFE_INTEGER);
    });

    expect(result.current.countSelectedPoints).toBe(Number.MAX_SAFE_INTEGER);
  });

  // Multiple subscribers test
  it('should notify all subscribers of state changes', () => {
    const { result: result1 } = renderHook(() => useMapStore());
    const { result: result2 } = renderHook(() => useMapStore());

    act(() => {
      result1.current.setCountSelectedPoints(5);
    });

    expect(result1.current.countSelectedPoints).toBe(5);
    expect(result2.current.countSelectedPoints).toBe(5);
  });
});