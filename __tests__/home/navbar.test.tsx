import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("Navbar", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("menampilkan logo PantauTular", () => {
    render(<Navbar />);
    const logo = screen.getByAltText("PantauTular Logo");
    expect(logo).toBeInTheDocument();
  });

  it("menampilkan menu navigasi utama", () => {
    render(<Navbar />);
    
    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.getByText("Peta Sebaran")).toBeInTheDocument();
    expect(screen.getByText("Tentang Kami")).toBeInTheDocument();
    expect(screen.getByText("Bantuan")).toBeInTheDocument();
  });

  it("menampilkan ikon profil", () => {
    render(<Navbar />);
    const profileIcon = screen.getByText("👤");
    expect(profileIcon).toBeInTheDocument();
  });

  it("tidak menampilkan menu yang tidak ada", () => {
    render(<Navbar />);
    expect(screen.queryByText("Kontak")).not.toBeInTheDocument();
    expect(screen.queryByText("Layanan")).not.toBeInTheDocument();
  });

  it("menandai menu aktif beranda dengan font-bold dan warna yang benar", () => {
    (usePathname as jest.Mock).mockReturnValue("/");

    render(<Navbar />);
    
    const berandaLink = screen.getByText("Beranda");
    expect(berandaLink).toHaveClass("font-bold text-[#1e3a8a]");
  });

  it("menandai menu aktif peta sebaran dengan font-bold dan warna yang benar", () => {
    (usePathname as jest.Mock).mockReturnValue("/map");

    render(<Navbar />);
    
    const berandaLink = screen.getByText("Peta Sebaran");
    expect(berandaLink).toHaveClass("font-bold text-[#1e3a8a]");
  });

  it("menandai menu aktif tentang kami dengan font-bold dan warna yang benar", () => {
    (usePathname as jest.Mock).mockReturnValue("/about");

    render(<Navbar />);
    
    const berandaLink = screen.getByText("Tentang Kami");
    expect(berandaLink).toHaveClass("font-bold text-[#1e3a8a]");
  });

  it("menandai menu aktif bantuan dengan font-bold dan warna yang benar", () => {
    (usePathname as jest.Mock).mockReturnValue("/help");

    render(<Navbar />);
    
    const berandaLink = screen.getByText("Bantuan");
    expect(berandaLink).toHaveClass("font-bold text-[#1e3a8a]");
  });

});
