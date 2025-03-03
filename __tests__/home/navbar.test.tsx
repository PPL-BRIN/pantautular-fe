import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

describe("Navbar", () => {
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
});
