import React from "react";
import { render, screen } from "@testing-library/react";
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

jest.mock("@amcharts/amcharts5-geodata/indonesiaLow", () => jest.fn());
jest.mock("@amcharts/amcharts5/themes/Animated", () => ({ new: jest.fn() }));

describe("IndonesiaMap Component", () => {
  test("renders the map container", async () => {
    render(<IndonesiaMap onError={jest.fn()} />);
    expect(await screen.getByTestId("chartdiv")).toBeInTheDocument();
  });

  test("calls onError when map initialization fails", () => {
    const mockOnError = jest.fn();

    // Buat mock agar amCharts memunculkan error
    jest.spyOn(console, "error").mockImplementation(() => {}); // Supaya error tidak mengganggu output test

    jest.mock("@amcharts/amcharts5", () => ({
      Root: {
        new: jest.fn(() => {
          throw new Error("Mocked amCharts initialization error");
        }),
      },
    }));

    render(<IndonesiaMap onError={mockOnError} />);

    expect(mockOnError).toHaveBeenCalledWith("Gagal memuat peta. Silakan coba lagi nanti.");

    (console.error as jest.Mock).mockRestore(); // Pulihkan console.error ke normal setelah test
  });
});