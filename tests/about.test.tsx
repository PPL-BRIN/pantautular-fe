import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import About from "../app/about/page";

jest.mock("../styles/globals.css", () => ({}));

describe("About Page", () => {
  it("menampilkan judul utama 'Tentang PantauTular'", () => {
    render(<About />);
    expect(screen.getByText("Tentang PantauTular")).toBeInTheDocument();
  });

  it("menampilkan paragraf utama dengan BRIN", () => {
    render(<About />);
    expect(
      screen.getByText(/Bekerja sama dengan Badan Riset dan Inovasi Nasional/i)
    ).toBeInTheDocument();
  });

  it("menampilkan gambar 'PantauTular_tentang_kami'", () => {
    render(<About />);
    expect(screen.getByAltText("PantauTular_tentang_kami")).toBeInTheDocument();
  });

  it("menampilkan bagian 'Kami memahami pentingnya'", () => {
    render(<About />);
    expect(screen.getByText("Kami memahami pentingnya")).toBeInTheDocument();
  });

  it("menampilkan bagian 'Latar Belakang'", () => {
    render(<About />);
    expect(screen.getByText("Latar Belakang")).toBeInTheDocument();
  });

  it("menampilkan gambar 'PantauTular_latarbelakang'", () => {
    render(<About />);
    expect(screen.getByAltText("PantauTular_latarbelakang")).toBeInTheDocument();
  });

  it("menampilkan bagian 'Dengan demikian'", () => {
    render(<About />);
    expect(screen.getByText("Dengan demikian,")).toBeInTheDocument();
  });

  it("tidak menampilkan elemen dengan teks yang salah", () => {
    render(<About />);
    expect(screen.queryByText("Tentang Fasilkom UI")).not.toBeInTheDocument();
    expect(screen.queryByText("Pusat Informasi Medis")).not.toBeInTheDocument();
  });
});
