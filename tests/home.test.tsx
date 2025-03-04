import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../app/page";

jest.mock("../styles/globals.css", () => ({}));

describe("Home Page", () => {
  it("menampilkan judul utama", () => {
    render(<Home />);
    expect(screen.getByText("Selamat Datang di PantauTular!")).toBeInTheDocument();
  });

  it("menampilkan gambar utama", () => {
    render(<Home />);
    screen.debug(); 
    const image = screen.getByAltText("PantauTular_home");
    expect(image).toBeInTheDocument();
  });

  it("menampilkan paragraf utama dengan BRIN", () => {
    render(<Home />);
    expect(
      screen.getByText(/Bekerja sama dengan Badan Riset dan Inovasi Nasional/i)
    ).toBeInTheDocument();
  });

  it("tombol 'Gunakan Sekarang!' bisa ditemukan", () => {
    render(<Home />);
    expect(
      screen.getByRole("button", { name: "Gunakan Sekarang!" })
    ).toBeInTheDocument();
  });

  it("menampilkan bagian 'Tentang Kami'", () => {
    render(<Home />);
    expect(screen.getByText("Tentang Kami")).toBeInTheDocument();
  });

  it("tombol 'Lihat Sekarang' bisa ditemukan", () => {
    render(<Home />);
    expect(
      screen.getByRole("button", { name: "Lihat Sekarang" })
    ).toBeInTheDocument();
  });

  it("menampilkan bagian 'Bantuan'", () => {
    render(<Home />);
    expect(screen.getByText("Bantuan")).toBeInTheDocument();
  });

  it("tombol 'Baca Selengkapnya' bisa ditemukan", () => {
    render(<Home />);
    expect(
      screen.getByRole("button", { name: "Baca Selengkapnya" })
    ).toBeInTheDocument();
  });

  it("tidak menampilkan elemen dengan teks yang salah", () => {
    render(<Home />);
    expect(screen.queryByText("Selamat Datang di Fasilkom-C02!")).not.toBeInTheDocument();
    expect(screen.queryByText("Pusat Informasi Penyakit")).not.toBeInTheDocument();
  });

  it("tidak menampilkan tombol yang tidak ada di halaman", () => {
    render(<Home />);
    expect(screen.queryByRole("button", { name: "Mulai Sekarang" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Daftar" })).not.toBeInTheDocument();
  });
});
