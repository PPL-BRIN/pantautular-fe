import React from "react";
import { render, screen } from "@testing-library/react";
import { IndonesiaMap } from "../../../app/components/IndonesiaMap";
import { useIndonesiaMap } from "../../../hooks/useIndonesiaMap";
import { useMapError } from "../../../hooks/useMapError";

// Mock the custom hooks
jest.mock("../../../hooks/useIndonesiaMap", () => ({
  useIndonesiaMap: jest.fn(),
}));

jest.mock("../../../hooks/useMapError", () => ({
  useMapError: jest.fn(),
}));

describe("IndonesiaMap", () => {
  const mockLocations = [
    { city: "TestCity", id: "TestID", location__latitude: 1, location__longitude: 2 },
  ];

  const mockSetError = jest.fn();
  const mockClearError = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock behavior: mapService exists (successful load)
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: {} });

    // Default mock behavior for error handling
    (useMapError as jest.Mock).mockReturnValue({
      error: null,
      setError: mockSetError,
      clearError: mockClearError,
    });
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

    // Verify hook was called with defaults
    expect(useIndonesiaMap).toHaveBeenCalledWith(
      "chartdiv",
      mockLocations,
      expect.objectContaining({
        zoomLevel: 2,
        centerPoint: expect.anything(),
      })
    );
  });

  test("renders with custom props", () => {
    const customConfig = {
      zoomLevel: 5,
      centerPoint: { longitude: 110, latitude: -5 },
    };

    render(
      <IndonesiaMap locations={mockLocations} config={customConfig} width="800px" height="400px" />
    );

    const container = screen.getByTestId("map-container");
    expect(container).toHaveStyle({
      width: "800px",
      height: "400px",
    });

    // Verify hook was called with custom config
    expect(useIndonesiaMap).toHaveBeenCalledWith(
      "chartdiv",
      mockLocations,
      expect.objectContaining({
        zoomLevel: 5,
        centerPoint: expect.objectContaining({
          longitude: 110,
          latitude: -5,
        }),
      })
    );
  });

  test("renders with partial config", () => {
    const partialConfig = {
      zoomLevel: 3,
      // No centerPoint provided
    };

    render(<IndonesiaMap locations={mockLocations} config={partialConfig} />);

    // Verify hook was called with merged config
    expect(useIndonesiaMap).toHaveBeenCalledWith(
      "chartdiv",
      mockLocations,
      expect.objectContaining({
        zoomLevel: 3,
        centerPoint: expect.anything(), // Default centerPoint should be used
      })
    );
  });

  test("calls onError when mapService is null", () => {
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: null });

    render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);

    expect(mockSetError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi.");
    expect(mockOnError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi.");
  });

  test("does not call onError when mapService is available", () => {
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: {} });

    render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);

    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockSetError).not.toHaveBeenCalled();
  });

  test("does not throw error when onError is not a function", () => {
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: null });

    // onError diberikan nilai yang bukan fungsi
    expect(() => {
      render(<IndonesiaMap locations={mockLocations} onError={null as unknown as any} />);
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
});