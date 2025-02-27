import React from "react"
import { render, screen } from "@testing-library/react"
import IndonesiaMap from "../../app/map/page"
import "@testing-library/jest-dom"

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
      })),
    },
    registry: {
      rootElements: [],
    },
  };
});

const mockPush = jest.fn();
jest.mock("@amcharts/amcharts5/map", () => ({
  MapChart: { new: jest.fn(() => ({ set: jest.fn(), series: { push: mockPush } })) },
  MapPolygonSeries: { new: jest.fn(() => ({})) },
  ZoomControl: { new: jest.fn() },
  geoMercator: jest.fn(),
}));

jest.mock("@amcharts/amcharts5-geodata/indonesiaHigh", () => jest.fn());
jest.mock("@amcharts/amcharts5/themes/Animated", () => ({ new: jest.fn() }));

describe("IndonesiaMap Component", () => {
  test("renders the map container", async () => {
    render(<IndonesiaMap />);
    expect(await screen.getByTestId("chartdiv")).toBeInTheDocument();
  });
});
