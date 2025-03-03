import React from "react";
import { render, screen } from "@testing-library/react";
import IndonesiaMap from "../../app/components/IndonesiaMap";
import "@testing-library/jest-dom";

jest.mock("@amcharts/amcharts5", () => {
  const actualAm5 = jest.requireActual("@amcharts/amcharts5");
  return {
    ...actualAm5,
    Root: {
      new: jest.fn(() => ({
        setThemes: jest.fn(),
        container: {
          children: {
            push: jest.fn(),
          },
        },
        set: jest.fn(),
        dispose: jest.fn(),
        chartContainer: {
          get: jest.fn(() => ({
            events: {
              on: jest.fn(),
            },
          })),
        },
      })),
    },
    registry: {
      rootElements: [],
    },
    color: jest.fn(() => "#dddddd"),
  };
});

const mockPush = jest.fn();
const mockSet = jest.fn();
const mockOn = jest.fn();

jest.mock("@amcharts/amcharts5/map", () => ({
  MapChart: { new: jest.fn(() => ({ set: mockSet, series: { push: mockPush }, chartContainer: { get: jest.fn(() => ({ events: { on: mockOn } })) } })) },
  MapPolygonSeries: { new: jest.fn(() => ({ mapPolygons: { template: { setAll: jest.fn(), states: { create: jest.fn() } } } })) },
  ZoomControl: { new: jest.fn() },
  geoMercator: jest.fn(),
}));

jest.mock("@amcharts/amcharts5-geodata/indonesiaLow", () => jest.fn());
jest.mock("@amcharts/amcharts5/themes/Animated", () => ({ new: jest.fn() }));

describe("IndonesiaMap Component", () => {
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
    expect(require("@amcharts/amcharts5").Root.new().setThemes).toHaveBeenCalled();
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
