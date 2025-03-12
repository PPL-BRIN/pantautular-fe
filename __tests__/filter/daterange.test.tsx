import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DateRangePickerComponent } from "../../app/components/filter/DateRangePicker";
import { RangeKeyDict } from "react-date-range";

afterEach(cleanup);

// Simplified mock with only two essential test cases
jest.mock("react-date-range", () => ({
  DateRange: ({ onChange }: { onChange: (ranges: RangeKeyDict) => void }) => (
    <div>
      {/* Normal date selection */}
      <button
        data-testid="date-range-normal"
        onClick={() =>
          onChange({
            selection: {
              startDate: new Date("2025-03-05T00:00:00.000Z"),
              endDate: new Date("2025-03-15T00:00:00.000Z"),
            },
          })
        }
      >
        Mocked DateRange Normal
      </button>

      {/* Edge case: both dates undefined */}
      <button
        data-testid="date-range-both-null"
        onClick={() =>
          onChange({
            selection: {
              startDate: undefined,
              endDate: undefined,
            },
          })
        }
      >
        Mocked DateRange Both Null
      </button>
    </div>
  ),
}));

describe("DateRangePickerComponent", () => {
  it("renders with default text and handles toggle", () => {
    render(
      <DateRangePickerComponent
        dateRange={{ start: "", end: "" }}
        setDateRange={() => {}}
      />
    );
    
    // Check default render state
    expect(screen.getByText("Pilih Tanggal")).toBeInTheDocument();
    expect(screen.queryByTestId("date-range-normal")).not.toBeInTheDocument();
    
    // Toggle open
    fireEvent.click(screen.getByRole("button", { name: /Pilih Tanggal/i }));
    expect(screen.getByTestId("date-range-normal")).toBeInTheDocument();
    
    // Toggle close with close button
    fireEvent.click(screen.getByRole("button", { name: /Tutup/i }));
    expect(screen.queryByTestId("date-range-normal")).not.toBeInTheDocument();
  });

  it("displays selected date range properly", () => {
    render(
      <DateRangePickerComponent
        dateRange={{ start: "2025-03-01", end: "2025-03-10" }}
        setDateRange={() => {}}
      />
    );
    expect(screen.getByText("2025-03-01 - 2025-03-10")).toBeInTheDocument();
  });

  it("handles date selection and calls setDateRange", () => {
    const setDateRangeMock = jest.fn();
    render(
      <DateRangePickerComponent
        dateRange={{ start: "", end: "" }}
        setDateRange={setDateRangeMock}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Pilih Tanggal/i }));
    fireEvent.click(screen.getByTestId("date-range-normal"));

    expect(setDateRangeMock).toHaveBeenCalledWith({
      start: "2025-03-05",
      end: "2025-03-15",
    });
  });

  it("handles undefined dates edge case", () => {
    const setDateRangeMock = jest.fn();
    render(
      <DateRangePickerComponent 
        dateRange={{ start: "", end: "" }} 
        setDateRange={setDateRangeMock} 
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Pilih Tanggal/i }));
    fireEvent.click(screen.getByTestId("date-range-both-null"));

    const todayPlusOne = new Date();
    todayPlusOne.setHours(0, 0, 0, 0);
    todayPlusOne.setDate(todayPlusOne.getDate() + 1);
    const expectedDate = todayPlusOne.toISOString().split("T")[0];

    expect(setDateRangeMock).toHaveBeenCalledWith({
      start: expectedDate,
      end: expectedDate,
    });
  });

  it("handles invalid date formats gracefully", () => {
    render(
      <DateRangePickerComponent 
        dateRange={{ start: "invalid-date", end: "invalid-date" }} 
        setDateRange={() => {}} 
      />
    );
    
    expect(screen.getByText("invalid-date - invalid-date")).toBeInTheDocument();
  });
});