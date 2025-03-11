import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FormFilter from '../../app/components/filter/FormFilter';

global.fetch = jest.fn();

const mockFilterOptions = {
  diseases: ['COVID-19', 'Dengue', 'Malaria'],
  locations: ['Jakarta', 'Bandung', 'Surabaya'],
  news: ['Portal A', 'Portal B', 'Portal C'],
};

describe('FormFilter Component', () => {
  const mockOnFilterApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockFilterOptions,
    });
  });

  it('handles non-OK response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<FormFilter onFilterApply={mockOnFilterApply} />);

    await waitFor(() => {
      expect(screen.getByText('Gagal memuat data filter. Silakan coba lagi nanti.')).toBeInTheDocument();
    });
  });

  it('sets alert level correctly', async () => {
    render(<FormFilter onFilterApply={mockOnFilterApply} />);

    await waitFor(() => {
      expect(screen.getAllByText('☆').length).toBe(5);
    });

    const stars = screen.getAllByText('☆');
    fireEvent.click(stars[2]);

    await waitFor(() => {
      expect(screen.getAllByText('★').length).toBe(3);
      expect(screen.getAllByText('☆').length).toBe(2);
    });
  });

  it('handles date range selection', async () => {
    render(<FormFilter onFilterApply={mockOnFilterApply} />);

    await waitFor(() => {
      const dateInputs = screen.getAllByRole('textbox');
      expect(dateInputs.length).toBeGreaterThan(0);
    });

    const startDateInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(startDateInput, { target: { value: '2025-03-01' } });
    const endDateInput = screen.getAllByRole('textbox')[1];
    fireEvent.change(endDateInput, { target: { value: '2025-03-31' } });

    expect(startDateInput).toHaveValue('2025-03-01');
    expect(endDateInput).toHaveValue('2025-03-31');
  });

  it('resets all filters when reset button is clicked', async () => {
    render(<FormFilter onFilterApply={mockOnFilterApply} />);
    
    // Wait for the fetch call to resolve and populate the options
    await waitFor(() => {
      expect(screen.getByText('Pilih jenis penyakit')).toBeInTheDocument();
      expect(screen.getByText('Provinsi atau kabupaten/kota')).toBeInTheDocument();
      expect(screen.getByText('Pilih sumber berita')).toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText('Pilih jenis penyakit'));
    fireEvent.click(screen.getByText('COVID-19'));
  
    fireEvent.click(screen.getByText('Provinsi atau kabupaten/kota'));
    fireEvent.click(screen.getByText('Jakarta'));
  
    fireEvent.click(screen.getByText('Pilih sumber berita'));
    fireEvent.click(screen.getByText('Portal A'));
  
    const stars = screen.getAllByText('☆');
    fireEvent.click(stars[3]);
    
    fireEvent.click(screen.getByText('Atur Ulang'));

    await waitFor(() => {
      expect(screen.queryByText('COVID-19')).not.toBeInTheDocument();
      expect(screen.queryByText('Jakarta')).not.toBeInTheDocument();
      expect(screen.queryByText('Portal A')).toBeInTheDocument();
      expect(screen.getAllByText('☆').length).toBe(5);
    });
  });
  

  it('opens and closes the news MultiSelect dropdown', async () => {
    render(<FormFilter onFilterApply={mockOnFilterApply} />);

    await waitFor(() => {
      expect(screen.getByText('Pilih sumber berita')).toBeInTheDocument();
    });

    expect(screen.queryByText('Portal A')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Pilih sumber berita'));
    expect(screen.getByText('Portal A')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Pilih sumber berita'));
    expect(screen.queryByText('Portal A')).not.toBeInTheDocument();
  });
});

jest.mock('../../app/components/filter/MultiSelect', () => ({
  MultiSelect: ({
    options= [],
    selected= [],
    onChange= () => {},
    placeholder= '',
    isOpen= false,
    setOpen= () => {},
  }) => (
    <div data-testid="multi-select">
      <button onClick={setOpen}>{selected.length > 0 ? selected.join(', ') : placeholder}</button>
      {isOpen && (
        <div>
          {options.map(option => (
            <div key={option} onClick={() => onChange()}>
              {option}
            </div>
          ))}
        </div>
      )}
      {selected.map(item => (
        <button key={item} onClick={() => onChange()}>
          {item}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('../../app/components/filter/DateRangePicker', () => ({
  DateRangePickerComponent: jest.fn(({ dateRange, setDateRange }) => (
    <div data-testid="date-range-picker">
      <input 
        type="text" 
        value={dateRange.start} 
        onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
      />
      <input 
        type="text" 
        value={dateRange.end} 
        onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
      />
    </div>
  )),
}));
