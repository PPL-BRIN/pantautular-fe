import { render, screen, act } from "@testing-library/react";
import { IndonesiaMap } from "../../../app/components/IndonesiaMap";
import { useIndonesiaMap } from "../../../hooks/useIndonesiaMap";
import { useMapError } from "../../../hooks/useMapError";
import React from "react";

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
    jest.clearAllTimers();

  });

  test("should correctly handle both branches of isReadyRef.current condition", () => {
    // We need to control the ref value directly
    let refValue = false;
    const useRefMock = jest.spyOn(React, 'useRef').mockImplementation(() => ({
      get current() {
        return refValue;
      },
      set current(value) {
        refValue = value;
      }
    }));
  
    // Mock console.log to verify execution paths
    const originalConsoleLog = console.log;
    const mockConsoleLog = jest.fn();
    console.log = mockConsoleLog;
  
    try {
      // CASE 1: Test when isReadyRef.current is false
      // Start with mapService as null
      (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: null });
      
      jest.useFakeTimers();
      
      render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
      
      // Run timers
      act(() => {
        jest.runAllTimers();
      });
      
      // Verify the error branch was executed (we went past the return statement)
      expect(mockSetError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi.");
      expect(mockOnError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi.");
      
      // Clear mocks for the second case
      jest.clearAllMocks();
      mockConsoleLog.mockClear();
      
      // CASE 2: Test when isReadyRef.current is true
      // Reset renderer
      (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: {} });
      
      render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
      
      // Run timers
      act(() => {
        jest.runAllTimers();
      });
      
      // Verify error was NOT set (the function returned early)
      expect(mockSetError).not.toHaveBeenCalled();
      expect(mockOnError).not.toHaveBeenCalled();
      
    } finally {
      // Restore original implementations
      useRefMock.mockRestore();
      console.log = originalConsoleLog;
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

  
});