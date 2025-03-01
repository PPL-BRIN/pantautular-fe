import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../app/page";

jest.mock("../app/layout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("Home Page", () => {
  beforeEach(() => {
    render(<Home />);
  });

  it("menampilkan judul utama", () => {
    expect(screen.getByText("Selamat Datang di PantauTular!")).toBeInTheDocument();
  });

  it("menampilkan gambar utama", () => {
    const image = screen.getByAltText("PantauTular_home");
    expect(image).toBeInTheDocument();
  });

  it("menampilkan paragraf utama dengan BRIN", () => {
    expect(
      screen.getByText(/Bekerja sama dengan Badan Riset dan Inovasi Nasional/i)
    ).toBeInTheDocument();
  });

  it("tombol 'Gunakan Sekarang!' bisa ditemukan", () => {
    expect(
      screen.getByRole("button", { name: "Gunakan Sekarang!" })
    ).toBeInTheDocument();
  });
  
  it("menampilkan bagian 'Tentang Kami'", () => {
    expect(screen.getByText("Tentang Kami")).toBeInTheDocument();
  });

  it("tombol 'Lihat Sekarang' bisa ditemukan", () => {
    expect(
      screen.getByRole("button", { name: "Lihat Sekarang" })
    ).toBeInTheDocument();
  });

  it("menampilkan bagian 'Bantuan'", () => {
    expect(screen.getByText("Bantuan")).toBeInTheDocument();
  });

  it("tombol 'Baca Selengkapnya' bisa ditemukan", () => {
    expect(
      screen.getByRole("button", { name: "Baca Selengkapnya" })
    ).toBeInTheDocument();
  });

  it("tidak menampilkan elemen dengan teks yang salah", () => {
    expect(screen.queryByText("Selamat Datang di Fasilkom-C02!")).not.toBeInTheDocument();
    expect(screen.queryByText("Pusat Informasi Penyakit")).not.toBeInTheDocument();
  });

  it("tidak menampilkan tombol yang tidak ada di halaman", () => {
    expect(screen.queryByRole("button", { name: "Mulai Sekarang" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Daftar" })).not.toBeInTheDocument();
  });

  it("menampilkan tiga gambar dalam MapGallery", () => {
    const images = [
      "Peta Sebaran 1",
      "Peta Sebaran 2",
      "Peta Sebaran 3"
    ];

    images.forEach((altText) => {
      expect(screen.getByAltText(altText)).toBeInTheDocument();
    });
  });

  it("tidak menampilkan gambar yang tidak seharusnya ada", () => {
    const nonExistentImages = [
      "Peta Sebaran 200",
      "Peta Sebaran Tidak Ada",
      "Peta Dummy"
    ];
  
    nonExistentImages.forEach((altText) => {
      expect(screen.queryByAltText(altText)).not.toBeInTheDocument();
    });
  });
  
});
