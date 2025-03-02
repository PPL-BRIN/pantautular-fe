import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import IndonesiaMap from "../../app/components/IndonesiaMap";

describe("IndonesiaMap Component", () => {
  test("renders the map container", async () => {
    await act(async () => {
      render(<IndonesiaMap onError={jest.fn()} />);
    });

    expect(screen.getByTestId("chartdiv")).toBeInTheDocument();
  });

  test("calls onError when map initialization fails", async () => {
    const mockOnError = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {}); // Hindari log error di terminal

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
