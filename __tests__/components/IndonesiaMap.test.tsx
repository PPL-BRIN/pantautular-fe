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
        on: mockOn,
      },
    };
  }
  return {};
});

// Mock amCharts dependencies
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
        get: mockChartContainerGet,
      },
    })),
  },
  registry: {
    rootElements: [],
  },
  color: jest.fn((color) => color),
}));

jest.mock("@amcharts/amcharts5/map", () => ({
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
  ZoomControl: { new: jest.fn() },
  geoMercator: jest.fn(),
}));

jest.mock("@amcharts/amcharts5-geodata/indonesiaLow", () => jest.fn());
jest.mock("@amcharts/amcharts5/themes/Animated", () => ({
  new: jest.fn(() => ({ themeName: "AnimatedTheme" })),
}));


jest.mock("../../app/components/CaseLocationPoints", () => jest.fn(() => <div data-testid="case-location-points"></div>));

describe("IndonesiaMap Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the map container", async () => {
    await act(async () => {
      render(<IndonesiaMap onError={jest.fn()} />);
    });
    expect(screen.getByTestId("chartdiv")).toBeInTheDocument();
  });

  test("calls onError when map initialization fails", async () => {
    const mockOnError = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {}); // Supress error logs

    // Simulate error during map initialization
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

  test("renders CaseLocationPoints when locations are provided", async () => {
    const mockLocations = [
      { id: "1", city: "Jakarta", location__latitude: -6.2088, location__longitude: 106.8456 },
      { id: "2", city: "Surabaya", location__latitude: -7.2504, location__longitude: 112.7688 },
    ];

    await act(async () => {
      render(<IndonesiaMap onError={jest.fn()} locations={mockLocations} />);
    });

    expect(screen.getByTestId("case-location-points")).toBeInTheDocument();
  });

  test("does not render CaseLocationPoints if locations are empty", async () => {
    await act(async () => {
      render(<IndonesiaMap onError={jest.fn()} locations={[]} />);
    });

    expect(screen.queryByTestId("case-location-points")).not.toBeInTheDocument();
  });
});