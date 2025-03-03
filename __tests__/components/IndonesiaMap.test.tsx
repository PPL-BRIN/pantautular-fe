import React from "react";
import { render, screen } from "@testing-library/react";
import IndonesiaMap from "../../app/components/IndonesiaMap";
import "@testing-library/jest-dom";

// Declare other mock functions
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

  test("renders the map container", () => {
    render(<IndonesiaMap />);
    expect(screen.getByTestId("chartdiv")).toBeInTheDocument();
  });

  test("initializes amCharts Root instance", () => {
    render(<IndonesiaMap />);
    expect(require("@amcharts/amcharts5").Root.new).toHaveBeenCalledWith("chartdiv");
  });

  test("sets themes correctly", () => {
    render(<IndonesiaMap />);
    expect(mockSetThemes).toHaveBeenCalledWith([expect.objectContaining({ themeName: "AnimatedTheme" })]);
  });

  test("adds MapChart to the container", () => {
    render(<IndonesiaMap />);
    expect(mockPush).toHaveBeenCalled();
  });

  test("sets zoom control", () => {
    render(<IndonesiaMap />);
    expect(require("@amcharts/amcharts5/map").ZoomControl.new).toHaveBeenCalled(); // Fix: Now correctly checks for ZoomControl
  });

  test("attaches click event to goHome()", () => {
    render(<IndonesiaMap />);
    expect(mockOn).toHaveBeenCalledWith("click", expect.any(Function)); // Fix: Now ensures event listener is properly attached
  });
});
