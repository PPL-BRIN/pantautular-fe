import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import IndonesiaMap from "../../app/components/IndonesiaMap";

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
  MapChart: {
    new: jest.fn(() => ({
      set: mockSet,
      series: { push: mockPush },
      chartContainer: { get: jest.fn(() => ({ events: { on: mockOn } })) },
    })),
  },
  MapPolygonSeries: {
    new: jest.fn(() => ({
      mapPolygons: { template: { setAll: jest.fn(), states: { create: jest.fn() } } },
    })),
  },
  ZoomControl: { new: jest.fn() },
  geoMercator: jest.fn(),
}));

jest.mock("@amcharts/amcharts5-geodata/indonesiaLow", () => jest.fn());
jest.mock("@amcharts/amcharts5/themes/Animated", () => ({ new: jest.fn() }));

describe("IndonesiaMap Component", () => {
  test("renders the map container", async () => {
    await act(async () => {
      render(<IndonesiaMap onError={jest.fn()} />);
    });
    expect(screen.getByTestId("chartdiv")).toBeInTheDocument();
  });

  test("initializes amCharts Root instance", async () => {
    await act(async () => {
      render(<IndonesiaMap onError={jest.fn()} />);
    });
    expect(require("@amcharts/amcharts5").Root.new).toHaveBeenCalledWith("chartdiv");
  });

  test("sets themes correctly", async () => {
    await act(async () => {
      render(<IndonesiaMap onError={jest.fn()} />);
    });
    expect(require("@amcharts/amcharts5").Root.new().setThemes).toHaveBeenCalled();
  });

  test("adds MapChart to the container", async () => {
    await act(async () => {
      render(<IndonesiaMap onError={jest.fn()} />);
    });
    expect(mockPush).toHaveBeenCalled();
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
