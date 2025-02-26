import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import BantuanPantauTular from '../app/help/page';

describe('BantuanPantauTular', () => {
    it('renders the title', () => {
      render(<BantuanPantauTular />);
      const titleElement = screen.getByText(/Bantuan PantauTular/i);
      expect(titleElement).toBeInTheDocument();
    });
  
    it('renders the description', () => {
      render(<BantuanPantauTular />);
      const descriptionElement = screen.getByText(/platform yang memungkinkan pengguna untuk melacak sebaran penyakit menular di wilayah Indonesia/i);
      expect(descriptionElement).toBeInTheDocument();
    });
  
    it('renders section titles', () => {
      render(<BantuanPantauTular />);
      const section1Title = screen.getByText(/1. Pencarian Berdasarkan Nama Penyakit/i);
      const section2Title = screen.getByText(/2. Pencarian Berdasarkan Lokasi/i);
      const section3Title = screen.getByText(/3. Pencarian Berdasarkan Sumber Berita/i);
      const section4Title = screen.getByText(/4. Pencarian Berdasarkan Tingkat Kewaspadaan/i);
      const section5Title = screen.getByText(/5. Pencarian Berdasarkan Tanggal Kejadian/i);
  
      expect(section1Title).toBeInTheDocument();
      expect(section2Title).toBeInTheDocument();
      expect(section3Title).toBeInTheDocument();
      expect(section4Title).toBeInTheDocument();
      expect(section5Title).toBeInTheDocument();
    });
  
    it('renders images', () => {
      render(<BantuanPantauTular />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });