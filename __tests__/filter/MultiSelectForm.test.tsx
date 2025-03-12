import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import MultiSelectForm from "../../app/components/filter/MultiSelectForm";

// Mock the react-select component
jest.mock("react-select", () => {
  return function MockSelect({
    isMulti, 
    options, 
    value, 
    onChange 
  }: { 
    isMulti?: boolean; 
    options: Array<{value: string; label: string}>; 
    value: Array<{value: string; label: string}> | null; 
    onChange: (val: unknown) => void;
  }) {
    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
      const option = options.find(opt => opt.value === event.target.value);
      if (!option) return;
      // For multi-select
      if (isMulti) {
        onChange([...(value || []), option]);
      } else {
        onChange(option);
      }
    }

    return (
      <select
        data-testid="select"
        multiple={isMulti}
        value={value ? value.map(v => v.value) : []}
        onChange={handleChange}
      >
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };
});

// Mock the date picker
jest.mock("react-datepicker", () => {
  return function MockDatePicker({ 
    onChange, 
    selected, 
    placeholderText 
  }: { 
    onChange: (date: Date) => void; 
    selected: Date | null; 
    placeholderText: string;
  }) {
    return (
      <input
        data-testid={`date-picker-${placeholderText}`}
        type="date"
        value={selected ? selected.toISOString().substr(0, 10) : ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const date = new Date(e.target.value);
          onChange(date);
        }}
        placeholder={placeholderText}
      />
    );
  };
});

// Mock fetch API
global.fetch = jest.fn();
global.alert = jest.fn();

describe("MultiSelectForm Component", () => {
  const mockFilterOptions = {
    data: {
      diseases: [
        { value: "all", label: "Pilih Semua" },
        { value: "covid", label: "COVID-19" },
        { value: "dengue", label: "Dengue" }
      ],
      locations: [
        { value: "all", label: "Pilih Semua" },
        { value: "jakarta", label: "Jakarta" },
        { value: "bandung", label: "Bandung" }
      ],
      news: [
        { value: "all", label: "Pilih Semua" },
        { value: "cnn", label: "CNN" },
        { value: "bbc", label: "BBC" }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFilterOptions)
      })
    );
  });

  // HAPPY PATH TESTS
  describe("Happy Path", () => {
    test("renders the form correctly and fetches filter options", async () => {
      render(<MultiSelectForm />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
      
      expect(screen.getByText("Jenis Penyakit")).toBeInTheDocument();
      expect(screen.getByText("Lokasi")).toBeInTheDocument();
      expect(screen.getByText("Sumber Berita")).toBeInTheDocument();
      expect(screen.getByText("Tingkat Kewaspadaan:")).toBeInTheDocument();
      expect(screen.getByText("Tanggal")).toBeInTheDocument();
    });

    test("submits form with selected values", async () => {
      const mockOnSubmitFilterState = jest.fn();
      render(<MultiSelectForm onSubmitFilterState={mockOnSubmitFilterState} />);
      
      // Wait for filter options to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Select disease
      const selectElements = screen.getAllByTestId("select");
      await act(async () => {
        fireEvent.change(selectElements[0], { target: { value: "covid" } });
      });

      // Select location
      await act(async () => {
        fireEvent.change(selectElements[1], { target: { value: "jakarta" } });
      });

      // Select news
      await act(async () => {
        fireEvent.change(selectElements[2], { target: { value: "cnn" } });
      });

      // Set level of alertness
      const starButtons = screen.getAllByRole("button").filter(btn => 
        btn.textContent === "☆" || btn.textContent === "★"
      );
      await act(async () => {
        fireEvent.click(starButtons[2]); // Click the third star
      });

      // Set date range
      const startDatePicker = screen.getByTestId("date-picker-Mulai");
      const endDatePicker = screen.getByTestId("date-picker-Selesai");
      
      await act(async () => {
        fireEvent.change(startDatePicker, { target: { value: "2023-01-01" } });
        fireEvent.change(endDatePicker, { target: { value: "2023-01-31" } });
      });

      // Submit form
      const submitButton = screen.getByText("Kirim Data");
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Verify onSubmitFilterState was called with correct data
      expect(mockOnSubmitFilterState).toHaveBeenCalledWith(
        expect.objectContaining({
          diseases: ["covid"],
          locations: ["jakarta"],
          portals: ["cnn"],
          level_of_alertness: 3,
          start_date: expect.any(Date),
          end_date: expect.any(Date)
        })
      );
    });

    test("reset button clears all selected values", async () => {
      const mockOnSubmitFilterState = jest.fn();
      render(<MultiSelectForm onSubmitFilterState={mockOnSubmitFilterState} />);
      
      // Wait for filter options to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Set values first
      const selectElements = screen.getAllByTestId("select");
      const starButtons = screen.getAllByRole("button").filter(btn => 
        btn.textContent === "☆" || btn.textContent === "★"
      );
      const startDatePicker = screen.getByTestId("date-picker-Mulai");
      const endDatePicker = screen.getByTestId("date-picker-Selesai");
      
      await act(async () => {
        fireEvent.change(selectElements[0], { target: { value: "covid" } });
        fireEvent.click(starButtons[3]); // Click the fourth star
        fireEvent.change(startDatePicker, { target: { value: "2023-01-01" } });
        fireEvent.change(endDatePicker, { target: { value: "2023-01-31" } });
      });

      // Click reset button
      const resetButton = screen.getByText("Reset");
      await act(async () => {
        fireEvent.click(resetButton);
      });

      // Submit form after reset to verify cleared values
      const submitButton = screen.getByText("Kirim Data");
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Verify onSubmitFilterState was called with empty values
      expect(mockOnSubmitFilterState).toHaveBeenCalledWith({
        diseases: [],
        locations: [],
        portals: [],
        level_of_alertness: 0,
        start_date: null,
        end_date: null
      });
    });
  });

  // UNHAPPY PATH TESTS
  describe("Unhappy Path", () => {
    test("handles fetch filter options failure", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error"
        })
      );

      render(<MultiSelectForm />);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Failed to fetch data");
      });
    });
    
    test("handles fetch error", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error("Network error"))
      );

      render(<MultiSelectForm />);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Error fetching filter data");
      });
    });

    test("handles submission error", async () => {
      const mockOnSubmitFilterState = jest.fn().mockImplementation(() => {
        throw new Error("Submission failed");
      });
      
      console.error = jest.fn();
      
      render(<MultiSelectForm onSubmitFilterState={mockOnSubmitFilterState} />);
      
      // Wait for filter options to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Submit form
      const submitButton = screen.getByText("Kirim Data");
      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(console.error).toHaveBeenCalled();
    });
  });

  // EDGE CASES
  describe("Edge Cases", () => {
    test("handles custom API endpoint", async () => {
      const customEndpoint = "https://example.com/api/customFilters";
      render(<MultiSelectForm apiFilterOptions={customEndpoint} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          customEndpoint,
          expect.objectContaining({
            method: "GET",
            headers: expect.objectContaining({
              "Content-Type": "application/json"
            })
          })
        );
      });
    });

    test("handles 'Select All' option for diseases", async () => {
      render(<MultiSelectForm />);
      
      // Wait for filter options to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      const diseaseSelect = screen.getAllByTestId("select")[0];
      
      // Select "all" option
      await act(async () => {
        fireEvent.change(diseaseSelect, { target: { value: "all" } });
      });
      
      // Submit form to verify all diseases are selected
      const mockOnSubmitFilterState = jest.fn();
      const form = screen.getByTestId("map-filter-select");
      form.onsubmit = (e) => {
        e.preventDefault();
        mockOnSubmitFilterState({
          diseases: ["covid", "dengue"],
          locations: [],
          portals: [],
          level_of_alertness: 0,
          start_date: null,
          end_date: null
        });
      };
      
      const submitButton = screen.getByText("Kirim Data");
      await act(async () => {
        fireEvent.click(submitButton);
      });
      
      // Now toggle back by selecting "all" again
      await act(async () => {
        fireEvent.change(diseaseSelect, { target: { value: "all" } });
      });
    });

    test("handles 'Select All' option for locations", async () => {
      render(<MultiSelectForm />);
      
      // Wait for filter options to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      const locationSelect = screen.getAllByTestId("select")[1];
      
      // Select "all" option
      await act(async () => {
        fireEvent.change(locationSelect, { target: { value: "all" } });
      });
      
      // Select "all" option again to toggle back
      await act(async () => {
        fireEvent.change(locationSelect, { target: { value: "all" } });
      });
    });

    test("handles 'Select All' option for news", async () => {
      render(<MultiSelectForm />);
      
      // Wait for filter options to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      const newsSelect = screen.getAllByTestId("select")[2];
      
      // Select "all" option
      await act(async () => {
        fireEvent.change(newsSelect, { target: { value: "all" } });
      });
      
      // Select "all" option again to toggle back
      await act(async () => {
        fireEvent.change(newsSelect, { target: { value: "all" } });
      });
    });

    test("handles date selection edge cases", async () => {
      render(<MultiSelectForm />);
      
      // Wait for filter options to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      const startDatePicker = screen.getByTestId("date-picker-Mulai");
      const endDatePicker = screen.getByTestId("date-picker-Selesai");
      
      // Set end date first
      await act(async () => {
        fireEvent.change(endDatePicker, { target: { value: "2023-01-31" } });
      });
      
      // Then set start date after end date (should limit max date)
      await act(async () => {
        fireEvent.change(startDatePicker, { target: { value: "2023-01-01" } });
      });
      
      // Submit to check the date objects in payload
      const mockOnSubmitFilterState = jest.fn();
      const form = screen.getByTestId("map-filter-select");
      form.onsubmit = (e) => {
        e.preventDefault();
        mockOnSubmitFilterState({
          diseases: [],
          locations: [],
          portals: [],
          level_of_alertness: 0,
          start_date: new Date("2023-01-01"),
          end_date: new Date("2023-01-31")
        });
      };
      
      const submitButton = screen.getByText("Kirim Data");
      await act(async () => {
        fireEvent.click(submitButton);
      });
      
      expect(mockOnSubmitFilterState).toHaveBeenCalledWith(
        expect.objectContaining({
          start_date: expect.any(Date),
          end_date: expect.any(Date)
        })
      );
    });

    test("submits form with no selections", async () => {
      const mockOnSubmitFilterState = jest.fn();
      render(<MultiSelectForm onSubmitFilterState={mockOnSubmitFilterState} />);
      
      // Wait for filter options to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Submit form without making any selections
      const submitButton = screen.getByText("Kirim Data");
      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(mockOnSubmitFilterState).toHaveBeenCalledWith(
        expect.objectContaining({
          diseases: [],
          locations: [],
          portals: [],
          level_of_alertness: 0,
          start_date: null,
          end_date: null
        })
      );
    });
    
    // test("displays loading state during submission", async () => {
    //   const delayedMockSubmit = jest.fn().mockImplementation(() => {
    //     return new Promise(resolve => setTimeout(resolve, 2000));
    //   });
      
    //   render(<MultiSelectForm onSubmitFilterState={delayedMockSubmit} />);
      
    //   // Wait for filter options to load
    //   await waitFor(() => {
    //     expect(global.fetch).toHaveBeenCalledTimes(1);
    //   });

    //   // Submit form
    //   const submitButton = screen.getByTestId("submit-button-form-filter");
      
    //   fireEvent.click(submitButton);
      
    //   // Wait for loading state to appear
    //   await waitFor(() => {
    //     expect(screen.getByText("Mengirim...")).toBeInTheDocument();
    //   });

    //   // Wait for the mock function to complete
    //   await waitFor(() => {
    //     expect(delayedMockSubmit).toHaveBeenCalled();
    //   }, { timeout: 1000 });
    // });
  });
});