import { render, screen, cleanup } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("Navbar", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    cleanup(); // Bersihkan render sebelumnya sebelum setiap tes
  });

  it("menampilkan logo PantauTular", () => {
    render(<Navbar />);
    expect(screen.getByAltText("PantauTular Logo")).toBeInTheDocument();
  });

  it("menampilkan menu navigasi utama", () => {
    render(<Navbar />);
    ["Beranda", "Peta Sebaran", "Tentang Kami", "Bantuan"].forEach((menu) =>
      expect(screen.getByText(menu)).toBeInTheDocument()
    );
  });

  it("menampilkan ikon profil", () => {
    render(<Navbar />);
    expect(screen.getByText("👤")).toBeInTheDocument();
  });

  it("tidak menampilkan menu yang tidak ada", () => {
    render(<Navbar />);
    ["Kontak", "Layanan"].forEach((menu) =>
      expect(screen.queryByText(menu)).not.toBeInTheDocument()
    );
  });

  it("menandai menu aktif Beranda dengan font-bold dan warna yang benar", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    render(<Navbar />);
    expect(screen.getByText("Beranda")).toHaveClass("font-bold text-[#1e3a8a]");
  });

  it("menandai menu aktif Peta Sebaran dengan font-bold dan warna yang benar", () => {
    (usePathname as jest.Mock).mockReturnValue("/map");
    render(<Navbar />);
    expect(screen.getByText("Peta Sebaran")).toHaveClass("font-bold text-[#1e3a8a]");
  });

  it("menandai menu aktif Tentang Kami dengan font-bold dan warna yang benar", () => {
    (usePathname as jest.Mock).mockReturnValue("/about");
    render(<Navbar />);
    expect(screen.getByText("Tentang Kami")).toHaveClass("font-bold text-[#1e3a8a]");
  });

  it("menandai menu aktif Bantuan dengan font-bold dan warna yang benar", () => {
    (usePathname as jest.Mock).mockReturnValue("/help");
    render(<Navbar />);
    expect(screen.getByText("Bantuan")).toHaveClass("font-bold text-[#1e3a8a]");
  });
});
