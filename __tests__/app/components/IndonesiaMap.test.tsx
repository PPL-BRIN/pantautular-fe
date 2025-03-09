import { render, screen, act } from "@testing-library/react";
import { IndonesiaMap, MAP_LOAD_TIMEOUT } from "../../../app/components/IndonesiaMap";
import { useIndonesiaMap } from "../../../hooks/useIndonesiaMap";
import { useMapError } from "../../../hooks/useMapError";

// Mock the custom hooks
jest.mock("../../../hooks/useIndonesiaMap", () => ({
  useIndonesiaMap: jest.fn(),
}));

jest.mock("../../../hooks/useMapError", () => ({
  useMapError: jest.fn(),
}));

// Mock the exported MAP_LOAD_TIMEOUT to make tests run faster
jest.mock("../../../app/components/IndonesiaMap", () => {
  const actualModule = jest.requireActual("../../../app/components/IndonesiaMap");
  return {
    ...actualModule,
    MAP_LOAD_TIMEOUT: 50, // Short timeout for tests
  };
});

describe("IndonesiaMap Component", () => {
  const mockLocations = [
    { city: "TestCity", id: "TestID", location__latitude: 1, location__longitude: 2 },
  ];

  const mockSetError = jest.fn();
  const mockClearError = jest.fn();
  const mockOnError = jest.fn();
  
  beforeAll(() => {
    // Ensure we start with real timers
    jest.useRealTimers();
  });

  afterAll(() => {
    // Make sure timers are restored after all tests
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // Reset timer implementation

    // Default behavior: mapService exists (successful load)
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: {} });

    // Default mock behavior for error handling
    (useMapError as jest.Mock).mockReturnValue({
      error: null,
      setError: mockSetError,
      clearError: mockClearError,
    });
  });

  afterEach(() => {
    // Ensure we clean up any fake timers
    if (jest.getTimerCount() > 0) {
      jest.useRealTimers();
    }
  });

  test("renders with default props", () => {
    render(<IndonesiaMap locations={mockLocations} />);

    const container = screen.getByTestId("map-container");
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute("id", "chartdiv");
    expect(container).toHaveStyle({
      width: "100vw",
      height: "100vh",
    });

    // Verify hook was called with default configuration
    expect(useIndonesiaMap).toHaveBeenCalledWith(
      "chartdiv",
      mockLocations,
      expect.objectContaining({
        zoomLevel: 2,
        centerPoint: expect.anything(),
      })
    );
  });

  test("calls onError and setError when mapService fails", () => {
    // Mock the service to return null
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: null });
  
    jest.useFakeTimers();
    
    // Render komponen
    render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Verifikasi bahwa efek sudah dipanggil dan timer telah dibuat
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    
    // Jalankan semua timer untuk memastikan timeout terpanggil
    act(() => {
      jest.runAllTimers(); // Lebih terjamin daripada advanceTimersByTime
    });
  
    // Verifikasi callback error dipanggil
    expect(mockSetError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi.");
    expect(mockOnError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi.");
    
    // Pastikan cleanup timer
    jest.useRealTimers();
  });

  test("does not throw error when onError is not provided", () => {
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: null });

    jest.useFakeTimers();
    
    expect(() => {
      render(<IndonesiaMap locations={mockLocations} />);
      act(() => {
        jest.runAllTimers();
      });
    }).not.toThrow();
  });

  test("renders MapLoadErrorPopup when there is an error", () => {
    (useMapError as jest.Mock).mockReturnValue({
      error: "Gagal memuat peta. Silakan coba lagi.",
      setError: mockSetError,
      clearError: mockClearError,
    });

    render(<IndonesiaMap locations={mockLocations} />);

    expect(screen.getByText("Terjadi Kesalahan")).toBeInTheDocument();
    expect(screen.getByText("Gagal memuat peta. Silakan coba lagi.")).toBeInTheDocument();
  });

  test("calls clearError when the error popup is closed", () => {
    (useMapError as jest.Mock).mockReturnValue({
      error: "Gagal memuat peta. Silakan coba lagi.",
      setError: mockSetError,
      clearError: mockClearError,
    });

    render(<IndonesiaMap locations={mockLocations} />);
    
    screen.getByText("Tutup").click();
    expect(mockClearError).toHaveBeenCalled();
  });

  test("calls onError when mapService fails even after delay", () => {
    // Always return null for mapService to simulate failure
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: null });
  
    jest.useFakeTimers();
    render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
  
    // Run timers - simplified approach without async/await for better reliability
    act(() => {
      jest.runAllTimers();
    });
  
    // Verify error handling was triggered
    expect(mockSetError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi.");
    expect(mockOnError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi.");
  });

  test("does not set timer when isReady is true", () => {
    // Mock isReady to be true
    (useIndonesiaMap as jest.Mock).mockReturnValue({ 
      mapService: {}, 
      isReady: true 
    });
  
    jest.useFakeTimers();
    
    render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Verify that no timers were created
    expect(jest.getTimerCount()).toBe(0);
    
    // Run all timers to ensure nothing happens
    act(() => {
      jest.runAllTimers();
    });
    
    // Verify error handling was NOT triggered
    expect(mockSetError).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });
  
  test("cleans up timer on unmount", () => {
    // Mock isReady to be false to ensure timer is created
    (useIndonesiaMap as jest.Mock).mockReturnValue({ 
      mapService: null, // Set to null to ensure timer is created
      isReady: false 
    });
  
    jest.useFakeTimers();
    
    // Render and get unmount function
    const { unmount } = render(
      <IndonesiaMap locations={mockLocations} onError={mockOnError} />
    );
    
    // Verify timer was created
    expect(jest.getTimerCount()).toBe(1);
    
    // Unmount component
    unmount();
    
    // Verify timer was cleaned up
    expect(jest.getTimerCount()).toBe(0);
    
    jest.useRealTimers();
  });
  
  test("handles change from not ready to ready before timeout", () => {
    // First mock isReady as false and mapService as null
    // Setting mapService to null is critical to ensure the timer is created
    (useIndonesiaMap as jest.Mock).mockReturnValueOnce({ 
      mapService: null, 
      isReady: false 
    });
  
    jest.useFakeTimers();
    
    const { rerender } = render(
      <IndonesiaMap locations={mockLocations} onError={mockOnError} />
    );
    
    // Verify timer was created
    expect(jest.getTimerCount()).toBe(1);
    
    // Now mock isReady as true for rerender
    (useIndonesiaMap as jest.Mock).mockReturnValue({ 
      mapService: {}, 
      isReady: true 
    });
    
    // Rerender with isReady = true
    rerender(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Advance timer but nothing should happen because new useEffect
    // should have cleaned up previous timer
    act(() => {
      jest.runAllTimers();
    });
    
    // Verify error was not triggered
    expect(mockSetError).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  test("does not call error handlers if isReady changes during timeout", () => {
    // Mock initially isReady as false
    (useIndonesiaMap as jest.Mock).mockReturnValueOnce({ 
      mapService: null, // Set to null to ensure timer is created
      isReady: false 
    });
  
    jest.useFakeTimers();
    
    const { rerender } = render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Verify timer was created
    expect(jest.getTimerCount()).toBe(1);
    
    // Advance timer slightly but not enough to trigger timeout
    act(() => {
      jest.advanceTimersByTime(25); // Half of the mocked timeout
    });
    
    // Now mock isReady as true to simulate map becoming ready during timeout
    (useIndonesiaMap as jest.Mock).mockReturnValue({ 
      mapService: {}, 
      isReady: true 
    });
    
    // Rerender to update component with new isReady value
    rerender(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Complete the timer - even though the timer fires, the condition should
    // check current isReady value which is now true
    act(() => {
      jest.advanceTimersByTime(25); // Complete the timeout
    });
    
    // Verify error handlers were not called because isReady became true
    expect(mockSetError).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  test("skips error setting when isReady becomes true during timeout", () => {
    (useIndonesiaMap as jest.Mock).mockReturnValue({ 
      mapService: null, // Changed to null to ensure timer is created
      isReady: false 
    });
  
    jest.useFakeTimers();
    
    const { rerender } = render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Verify timer was created
    expect(jest.getTimerCount()).toBe(1);
    
    // Change isReady to true before timeout completes
    (useIndonesiaMap as jest.Mock).mockReturnValue({ 
      mapService: {}, 
      isReady: true 
    });
    
    // Rerender to update component with new isReady value
    rerender(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Run all timers which should not trigger the error due to isReady being true
    act(() => {
      jest.runAllTimers();
    });
    
    expect(mockSetError).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });
});