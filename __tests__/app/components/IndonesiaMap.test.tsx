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

  test("does not call onError when mapService is available", () => {
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: {} });

    jest.useFakeTimers();
    render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Run all timers to ensure any potential effects complete
    act(() => {
      jest.runAllTimers();
    });

    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockSetError).not.toHaveBeenCalled();
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

  test("does not set error if mapService initializes successfully after delay", () => {
    // First render: mapService is null (loading)
    // Second render: mapService is available (loaded successfully)
    (useIndonesiaMap as jest.Mock)
      .mockReturnValueOnce({ mapService: null })
      .mockReturnValueOnce({ mapService: {} });

    jest.useFakeTimers();
    const { rerender } = render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Advance timers but not enough to trigger timeout
    act(() => {
      jest.advanceTimersByTime(25); // Half of the mocked timeout
    });
    
    // Rerender to simulate React state update with mapService now available
    rerender(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Run remaining timers
    act(() => {
      jest.runAllTimers();
    });

    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockSetError).not.toHaveBeenCalled();
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

  test("handleMapLoadTimeout correctly checks mapService condition", () => {
    // Setup: mapService tersedia
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: {} });
    
    jest.useFakeTimers();
    render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Jalankan timer untuk memicu handleMapLoadTimeout
    act(() => {
      jest.runAllTimers();
    });
    
    // Verifikasi: karena mapService tersedia, tidak ada error yang dipanggil
    expect(mockSetError).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
    
    // Ubah menjadi null untuk menguji cabang if lainnya
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: null });
    const { rerender } = render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Re-render dengan mapService null
    rerender(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);
    
    // Reset mock untuk pengujian bersih
    mockSetError.mockClear();
    mockOnError.mockClear();
    
    // Jalankan timer untuk memicu handleMapLoadTimeout
    act(() => {
      jest.runAllTimers();
    });
    
    // Verifikasi: sekarang error harus dipanggil
    expect(mockSetError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi.");
    expect(mockOnError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi.");
  });
});