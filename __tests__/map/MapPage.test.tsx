import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MapPage from "../../app/map/page";

describe("MapPage Component", () => {
  
  test("renders the map container successfully", () => {
    render(<MapPage />);
    
    expect(screen.getByTestId("chartdiv")).toBeInTheDocument();
  });

  test("hanya menampilkan satu popup jika ada multiple error messages", () => {
    render(<MapPage />);

    fireEvent.error(screen.getByTestId("chartdiv"));
    fireEvent.error(screen.getByTestId("chartdiv"));

    expect(screen.queryAllByText(/Gagal memuat peta/)).toHaveLength(1);
  });

  test("popup menghilang setelah tombol tutup diklik", () => {
    render(<MapPage />);

    fireEvent.error(screen.getByTestId("chartdiv"));
    expect(screen.getByText(/Gagal memuat peta/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Tutup"));
    expect(screen.queryByText("Gagal memuat peta. Silakan coba lagi nanti.")).not.toBeInTheDocument();
  });

  test("tidak menampilkan popup error saat halaman pertama kali dimuat", () => {
    render(<MapPage />);

    expect(screen.queryByText("Gagal memuat peta, silakan coba lagi")).not.toBeInTheDocument();
  });

  test("tidak ada duplikasi popup error jika error terus terjadi sebelum popup ditutup", () => {
    render(<MapPage />);

    fireEvent.error(screen.getByTestId("chartdiv"));
    fireEvent.error(screen.getByTestId("chartdiv"));
    fireEvent.error(screen.getByTestId("chartdiv"));

    expect(screen.queryAllByText(/Gagal memuat peta/)).toHaveLength(1);
  });
});