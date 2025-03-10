import { useState } from "react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css"; 
import "react-date-range/dist/theme/default.css"; 

interface DateRangePickerProps {
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
}

export function DateRangePickerComponent({ dateRange, setDateRange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        className="p-2 w-full border border-gray-300 rounded-md text-gray-700 text-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {dateRange.start && dateRange.end
          ? `${dateRange.start} - ${dateRange.end}`
          : "Pilih Tanggal"}
      </button>

      {isOpen && (
        <div className="absolute z-10 bg-white p-4 shadow-lg rounded-md mt-2">
          <DateRange
            ranges={[
              {
                startDate: dateRange.start ? new Date(dateRange.start) : new Date(),
                endDate: dateRange.end ? new Date(dateRange.end) : addDays(new Date(), 7),
                key: "selection",
              },
            ]}
            onChange={(item) => {
              const { startDate, endDate } = item.selection;
              setDateRange({
                start: startDate ? startDate.toISOString().split("T")[0] : "",
                end: endDate ? endDate.toISOString().split("T")[0] : "",
              });
            }}
            moveRangeOnFirstSelection={false}
            months={2}
            direction="horizontal"
          />
          <button
            className="mt-2 w-full bg-blue-500 text-white p-2 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
