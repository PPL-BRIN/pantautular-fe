import { render, screen, cleanup } from "@testing-library/react";
import { DateRangePickerComponent } from "../../app/components/filter/DateRangePicker";

afterEach(() => {
  cleanup();
});

afterAll(() => {
  jest.clearAllTimers();
});

describe("DateRangePickerComponent", () => {
  it("renders with default text", () => {
    render(<DateRangePickerComponent dateRange={{ start: "", end: "" }} setDateRange={() => {}} />);
    expect(screen.getByText("Pilih Tanggal")).toBeInTheDocument();
  });

  it("displays selected date range", () => {
    render(<DateRangePickerComponent dateRange={{ start: "2025-03-01", end: "2025-03-10" }} setDateRange={() => {}} />);
    expect(screen.getByText("2025-03-01 - 2025-03-10")).toBeInTheDocument();
  });

  it("handles empty start and end dates", () => {
    render(<DateRangePickerComponent dateRange={{ start: "", end: "" }} setDateRange={() => {}} />);
    expect(screen.getByText("Pilih Tanggal")).toBeInTheDocument();
  });

  it("does not break when selecting invalid date range", () => {
    const setDateRange = jest.fn();
    render(<DateRangePickerComponent dateRange={{ start: "2025-03-10", end: "2025-03-01" }} setDateRange={setDateRange} />);
    expect(screen.getByText("2025-03-10 - 2025-03-01")).toBeInTheDocument();
  });
});