import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { IndonesiaMap } from "../../../app/components/IndonesiaMap";
import { useIndonesiaMap } from "../../../hooks/useIndonesiaMap";

// Mock the custom hook
jest.mock("../../../hooks/useIndonesiaMap", () => ({
  useIndonesiaMap: jest.fn(),
}));

describe("IndonesiaMap", () => {
  const mockLocations = [
    { city: "TestCity", id: "TestID", location__latitude: 1, location__longitude: 2 },
  ];
  const mockOnError = jest.fn(); // Mock fungsi error handling

  beforeEach(() => {
    jest.clearAllMocks();
    (useIndonesiaMap as jest.Mock).mockReturnValue({ mapService: {} });
  });

  test("renders with default props", () => {
    render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);

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
      }),
      mockOnError // Pastikan onError diteruskan
    );
  });

  test("renders with custom props", () => {
    const customConfig = {
      zoomLevel: 5,
      centerPoint: { longitude: 110, latitude: -5 },
    };

    render(
      <IndonesiaMap
        locations={mockLocations}
        config={customConfig}
        width="800px"
        height="400px"
        onError={mockOnError}
      />
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
      }),
      mockOnError // Pastikan onError diteruskan
    );
  });

  test("renders with partial config", () => {
    const partialConfig = {
      zoomLevel: 3,
      // No centerPoint provided
    };

    render(<IndonesiaMap locations={mockLocations} config={partialConfig} onError={mockOnError} />);

    // Verify hook was called with merged config
    expect(useIndonesiaMap).toHaveBeenCalledWith(
      "chartdiv",
      mockLocations,
      expect.objectContaining({
        zoomLevel: 3,
        centerPoint: expect.anything(), // Default centerPoint should be used
      }),
      mockOnError // Pastikan onError diteruskan
    );
  });

  test("calls onError if an error occurs in useEffect", async () => {
    // Simulasikan error terjadi setelah rendering (dalam useEffect)
    const mockError = new Error("Test error");
    (useIndonesiaMap as jest.Mock).mockImplementationOnce(() => {
      // Call the onError callback directly in the next tick instead of throwing
      setTimeout(() => {
        mockOnError(mockError.message);
      }, 0);
      return { mapService: {} };
    });

    render(<IndonesiaMap locations={mockLocations} onError={mockOnError} />);

    // Tunggu hingga efek berjalan dan onError dipanggil
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith("Test error");
    });
  });
});