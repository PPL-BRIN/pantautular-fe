import { useState } from "react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css"; 
import "react-date-range/dist/theme/default.css"; 

interface DateRangePickerProps {
  dateRange: { start: string; end: string };
  setDateRange: (dateRange: { start: string; end: string }) => void;
}

export function DateRangePickerComponent({ dateRange, setDateRange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const defaultStart = new Date();
  const defaultEnd = addDays(new Date(), 7);

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
        <div className="absolute bottom-full top-1/3 z-10 bg-white p-4 shadow-lg rounded-md mt-2 scale-90">
          <DateRange
            ranges={[{
              startDate: new Date(dateRange.start || defaultStart.toLocaleDateString("en-CA")),
              endDate: new Date(dateRange.end || defaultEnd.toLocaleDateString("en-CA")),
              key: "selection",
            }]}
            onChange={(item) => {
              const { startDate, endDate } = item.selection;
              const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : new Date();
              const end = endDate ? new Date(endDate.setHours(0, 0, 0, 0)) : new Date();

              setDateRange({
                start: start.toLocaleDateString("en-CA"),
                end: end.toLocaleDateString("en-CA"),
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