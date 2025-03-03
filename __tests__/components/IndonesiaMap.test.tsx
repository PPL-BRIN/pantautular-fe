import React from "react";
import { render, screen } from "@testing-library/react";
import IndonesiaMap from "../../app/components/IndonesiaMap";
import "@testing-library/jest-dom";

const mockSetThemes = jest.fn();
const mockPush = jest.fn();
const mockSet = jest.fn();
const mockDispose = jest.fn();
const mockOn = jest.fn();
const mockChartContainerGet = jest.fn(() => ({
  events: {
    on: mockOn,
  },
}));

jest.mock("@amcharts/amcharts5", () => {
  return {
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
  };
});

jest.mock("@amcharts/amcharts5/map", () => ({
  MapChart: { new: jest.fn(() => ({ set: mockSet, series: { push: mockPush }, chartContainer: { get: mockChartContainerGet } })) },
  MapPolygonSeries: { new: jest.fn(() => ({ mapPolygons: { template: { setAll: jest.fn(), states: { create: jest.fn() } } } })) },
  ZoomControl: { new: jest.fn(() => ({})) }, // Ensure it returns an object
  geoMercator: jest.fn(),
}));

jest.mock("@amcharts/amcharts5-geodata/indonesiaLow", () => jest.fn());
jest.mock("@amcharts/amcharts5/themes/Animated", () => ({ new: jest.fn() }));

describe("IndonesiaMap Component", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mock calls before each test
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
    expect(mockSetThemes).toHaveBeenCalledWith([expect.any(Object)]); // Ensure it's called with a theme
  });

  test("adds MapChart to the container", () => {
    render(<IndonesiaMap />);
    expect(mockPush).toHaveBeenCalled();
  });

  test("sets zoom control", () => {
    render(<IndonesiaMap />);
    expect(require("@amcharts/amcharts5/map").ZoomControl.new).toHaveBeenCalled();
  });

  test("attaches click event to goHome()", () => {
    render(<IndonesiaMap />);
    expect(mockOn).toHaveBeenCalledWith("click", expect.any(Function));
  });
});
