import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import IndonesiaMap from "../../app/components/IndonesiaMap";

const mockSetThemes = jest.fn();
const mockPush = jest.fn();
const mockSet = jest.fn();
const mockDispose = jest.fn();
const mockOn = jest.fn();
const mockChartContainerGet = jest.fn((param) => {
    if (param === "background") {
      return {
        events: {
          on: mockOn, // Ensure events.on is properly mocked for background click events
        },
      };
    }
    return {};
  });

jest.mock("@amcharts/amcharts5", () => ({
  Root: {
    new: jest.fn(() => ({
      setThemes: mockSetThemes,
      container: {
        children: {
          push: mockPush,
        },
      },
      set: mockSet,
      dispose: mockDispose,
      chartContainer: {
        get: mockChartContainerGet, // Ensures it gets called
      },
    })),
  },
  registry: {
    rootElements: [],
  },
  color: jest.fn((color) => color),
}));

// ✅ Define `mockZoomControlNew` inside `jest.mock()` so it's not used before initialization
jest.mock("@amcharts/amcharts5/map", () => {
  const mockZoomControlInstance = jest.fn(() => ({
    someMethod: jest.fn(), // Ensure it returns a valid object
  }));
  const mockZoomControlNew = jest.fn(() => mockZoomControlInstance);

  return {
    MapChart: {
      new: jest.fn(() => ({
        set: mockSet,
        series: { push: mockPush },
        chartContainer: { get: mockChartContainerGet },
      })),
    },
    MapPolygonSeries: {
      new: jest.fn(() => ({
        mapPolygons: {
          template: { setAll: jest.fn(), states: { create: jest.fn() } },
        },
      })),
    },
    ZoomControl: { new: mockZoomControlNew }, // Now properly referenced
    geoMercator: jest.fn(),
  };
});

jest.mock("@amcharts/amcharts5-geodata/indonesiaLow", () => jest.fn());
jest.mock("@amcharts/amcharts5/themes/Animated", () => ({
  new: jest.fn(() => ({ themeName: "AnimatedTheme" })), // Ensure it returns a valid object
}));


describe("IndonesiaMap Component", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mock calls before each test
  });

  test("renders the map container", async () => {
    await act(async () => {
      render(<IndonesiaMap onError={jest.fn()} />);
    });
    expect(screen.getByTestId("chartdiv")).toBeInTheDocument();
  });
  
  test("calls onError when map initialization fails", async () => {
    const mockOnError = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
    
    jest.mock("@amcharts/amcharts5", () => ({
      Root: {
        new: jest.fn(() => {
          throw new Error("Mocked amCharts initialization error");
        }),
      },
    }));

    await act(async () => {
      render(<IndonesiaMap onError={mockOnError} />);
    });

    expect(mockOnError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi.");
    jest.restoreAllMocks();
  });
});
