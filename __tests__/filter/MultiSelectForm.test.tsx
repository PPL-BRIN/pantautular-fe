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
    onChange: (val: any) => void;
  }) {
    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
      const option = options.find(opt => opt.value === event.target.value);
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
    diseases: [
      { value: "covid", label: "COVID-19" },
      { value: "dengue", label: "Dengue" }
    ],
    locations: [
      { value: "jakarta", label: "Jakarta" },
      { value: "bandung", label: "Bandung" }
    ],
    news: [
      { value: "cnn", label: "CNN" },
      { value: "bbc", label: "BBC" }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFilterOptions })
      })
    );
  });

  // Happy Path Tests
  test("renders the form correctly and fetches filter options", async () => {
    render(<MultiSelectForm />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.alert).toHaveBeenCalledWith("Data fetched successfully!");
    });
    
    expect(screen.getByText("Jenis Penyakit")).toBeInTheDocument();
    expect(screen.getByText("Lokasi")).toBeInTheDocument();
    expect(screen.getByText("Sumber Berita")).toBeInTheDocument();
    expect(screen.getByText("Tingkat Kewaspadaan:")).toBeInTheDocument();
    expect(screen.getByText("Tanggal")).toBeInTheDocument();
  });

  test("submits form with selected values successfully", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFilterOptions })
      })
    ).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true
      })
    );

    render(<MultiSelectForm />);
    
    // Wait for filter options to load
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Data fetched successfully!");
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
    const starButtons = screen.getAllByText("☆");
    await act(async () => {
      fireEvent.click(starButtons[2]); // Click the third star (alertness level 3)
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

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.alert).toHaveBeenCalledWith("Data berhasil dikirim!");
    });

    // Check if the submit request was made with the correct payload
    expect((global.fetch as jest.Mock).mock.calls[1][1].body).toBeTruthy();
    const payload = JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body);
    expect(payload.diseases).toContain("covid");
    expect(payload.locations).toContain("jakarta");
    expect(payload.portals).toContain("cnn");
    expect(payload.level_of_alertness).toBe(3);
    expect(payload.start_date).toBeTruthy();
    expect(payload.end_date).toBeTruthy();
  });

  test("reset button clears all selected values", async () => {
    render(<MultiSelectForm />);
    
    // Wait for filter options to load
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Data fetched successfully!");
    });

    // Set level of alertness
    const starButtons = screen.getAllByText("☆");
    await act(async () => {
      fireEvent.click(starButtons[3]); // Click the fourth star (alertness level 4)
    });

    // Set date range
    const startDatePicker = screen.getByTestId("date-picker-Mulai");
    await act(async () => {
      fireEvent.change(startDatePicker, { target: { value: "2023-01-01" } });
    });

    // Click reset button
    const resetButton = screen.getByText("Reset");
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Check if all values are reset
    const filledStars = screen.queryAllByText("★");
    expect(filledStars.length).toBe(0);
  });

  // Unhappy Path Tests
  test("handles fetch filter options failure", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false
      })
    );

    render(<MultiSelectForm />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.alert).toHaveBeenCalledWith("Failed to fetch data");
    });
  });

  test("handles fetch error", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );

    render(<MultiSelectForm />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.alert).toHaveBeenCalledWith("Error fetching filter data");
    });
  });

  test("handles form submission failure", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFilterOptions })
      })
    ).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false
      })
    );

    render(<MultiSelectForm />);
    
    // Wait for filter options to load
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Data fetched successfully!");
    });

    // Submit form
    const submitButton = screen.getByText("Kirim Data");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.alert).toHaveBeenCalledWith("Gagal mengirim data.");
    });
  });

  test("handles form submission error", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFilterOptions })
      })
    ).mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );

    render(<MultiSelectForm />);
    
    // Wait for filter options to load
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Data fetched successfully!");
    });

    // Submit form
    const submitButton = screen.getByText("Kirim Data");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.alert).toHaveBeenCalledWith("Terjadi kesalahan saat mengirim data.");
    });
  });

  // Edge Case Tests
  test("handles custom API endpoint", async () => {
    const customApiUrl = "https://custom-api.example.com/filters";
    render(<MultiSelectForm apiFilterOptions={customApiUrl} />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(customApiUrl, expect.anything());
    });
  });

  test("submits form with no selections", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFilterOptions })
      })
    ).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true
      })
    );

    render(<MultiSelectForm />);
    
    // Wait for filter options to load
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Data fetched successfully!");
    });

    // Submit form without making any selections
    const submitButton = screen.getByText("Kirim Data");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // Check if the submit request was made with empty arrays
    const payload = JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body);
    expect(payload.diseases).toEqual([]);
    expect(payload.locations).toEqual([]);
    expect(payload.portals).toEqual([]);
    expect(payload.level_of_alertness).toBe(0);
    expect(payload.start_date).toBeNull();
    expect(payload.end_date).toBeNull();
  });

  test("displays loading state during submission", async () => {
    // Create a promise that won't resolve immediately
    let resolveSubmit: (value: {ok: boolean}) => void = () => {};
    const submitPromise = new Promise<{ok: boolean}>(resolve => {
      resolveSubmit = resolve;
    });
    
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockFilterOptions })
      })
    ).mockImplementationOnce(() => submitPromise);

    render(<MultiSelectForm />);
    
    // Wait for filter options to load
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Data fetched successfully!");
    });

    // Submit form
    const submitButton = screen.getByText("Kirim Data");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Check if loading state is shown
    expect(screen.getByText("Mengirim...")).toBeInTheDocument();
    
    // Resolve the submission
    await act(async () => {
      resolveSubmit({ ok: true });
    });
    
    await waitFor(() => {
      expect(screen.getByText("Kirim Data")).toBeInTheDocument();
    });
  });

  test("handles date selection edge cases", async () => {
    render(<MultiSelectForm />);
    
    // Wait for filter options to load
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Data fetched successfully!");
    });

    const startDatePicker = screen.getByTestId("date-picker-Mulai");
    const endDatePicker = screen.getByTestId("date-picker-Selesai");
    
    // Set end date first
    await act(async () => {
      fireEvent.change(endDatePicker, { target: { value: "2023-01-31" } });
    });
    
    // Then set start date after end date (should limit max date)
    await act(async () => {
      fireEvent.change(startDatePicker, { target: { value: "2023-01-15" } });
    });
    
    // Submit to check the date objects in payload
    const submitButton = screen.getByText("Kirim Data");
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      const payload = JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body);
      expect(new Date(payload.start_date).getDate()).toBe(15);
      expect(new Date(payload.end_date).getDate()).toBe(31);
    });
  });
});