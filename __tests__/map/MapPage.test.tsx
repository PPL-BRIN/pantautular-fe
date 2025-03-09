import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MapPage from "../../app/map/page";
import { useCaseLocations } from "../../hooks/useCaseLocations";

// Mock `useCaseLocations` agar kita bisa mensimulasikan fetch error
jest.mock("../../hooks/useCaseLocations", () => ({
  useCaseLocations: jest.fn(),
}));

describe("MapPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the map container successfully", () => {
    (useCaseLocations as jest.Mock).mockReturnValue({ locations: [], error: null });
    render(<MapPage />);

    expect(screen.getByTestId("chartdiv")).toBeInTheDocument();
  });

  test("menampilkan popup error jika terjadi fetch error", () => {
    (useCaseLocations as jest.Mock).mockReturnValue({
      locations: [],
      error: "Gagal mengambil data kasus. Silakan coba lagi.",
    });

    render(<MapPage />);
    expect(screen.getByText("Gagal mengambil data kasus. Silakan coba lagi.")).toBeInTheDocument();
  });

  test("popup menghilang setelah tombol tutup diklik ketika fetch error terjadi", () => {
    (useCaseLocations as jest.Mock).mockReturnValue({
      locations: [],
      error: "Gagal mengambil data kasus. Silakan coba lagi.",
    });

    render(<MapPage />);
    expect(screen.getByText("Gagal mengambil data kasus. Silakan coba lagi.")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Tutup"));
    expect(screen.queryByText("Gagal mengambil data kasus. Silakan coba lagi.")).not.toBeInTheDocument();
  });

  test("hanya menampilkan satu popup jika ada fetch error dan error dari peta secara bersamaan", () => {
    (useCaseLocations as jest.Mock).mockReturnValue({
      locations: [],
      error: "Gagal mengambil data kasus. Silakan coba lagi.",
    });

    render(<MapPage />);

    fireEvent.error(screen.getByTestId("chartdiv"));

    expect(screen.queryAllByText(/Gagal/)).toHaveLength(1);
  });
    
  test("popup muncul kembali jika error masih terjadi setelah tombol tutup diklik", () => {
    (useCaseLocations as jest.Mock).mockReturnValue({
      locations: [],
      error: "Gagal mengambil data kasus. Silakan coba lagi.",
    });
    
    render(<MapPage />);
  
    // Verifikasi popup error muncul
    expect(screen.getByText("Gagal mengambil data kasus. Silakan coba lagi.")).toBeInTheDocument();
  
    // Klik tombol tutup
    fireEvent.click(screen.getByText("Tutup"));
    expect(screen.queryByText("Gagal mengambil data kasus. Silakan coba lagi.")).not.toBeInTheDocument();
  
    // Simulasi render ulang dengan error yang sama
    (useCaseLocations as jest.Mock).mockReturnValue({
      locations: [],
      error: "Gagal mengambil data kasus. Silakan coba lagi.",
    });
    
    render(<MapPage />);
    expect(screen.getByText("Gagal mengambil data kasus. Silakan coba lagi.")).toBeInTheDocument();
  });
});