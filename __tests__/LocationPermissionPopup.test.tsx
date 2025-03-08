import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LocationPermissionPopup from "../app/components/LocationPermissionPopup";

describe("LocationPermissionPopup", () => {
  let mockOnAllow: jest.Mock;
  let mockOnDeny: jest.Mock;

  beforeAll(() => {
    // Pastikan `navigator.permissions` tersedia sebelum `spyOn`
    if (!navigator.permissions) {
      Object.defineProperty(global.navigator, "permissions", {
        value: {
          query: jest.fn(),
        },
        configurable: true,
      });
    }
  });

  beforeEach(() => {
    mockOnAllow = jest.fn();
    mockOnDeny = jest.fn();

    // Mock `navigator.permissions.query`
    jest.spyOn(navigator.permissions, "query").mockResolvedValue({
      state: "prompt",
      onchange: null,
    } as PermissionStatus);

    // Mock `navigator.geolocation`
    if (!navigator.geolocation) {
      Object.defineProperty(global.navigator, "geolocation", {
        value: {
          getCurrentPosition: jest.fn(),
          watchPosition: jest.fn(),
          clearWatch: jest.fn(),
        },
        configurable: true,
      });
    }

    jest.spyOn(navigator.geolocation, "getCurrentPosition").mockImplementation(
      (success) => success({} as GeolocationPosition)
    );

    jest.restoreAllMocks();
  });

  test("Menampilkan popup izin lokasi saat pertama kali dirender", async () => {
    render(<LocationPermissionPopup onAllow={mockOnAllow} onDeny={mockOnDeny} onClose={() => {}} />);
    
    expect(await screen.findByText("Izin Lokasi Diperlukan")).toBeInTheDocument();
  });

  test("Klik tombol 'Lanjutkan' memanggil onAllow jika izin diberikan", async () => {
    render(<LocationPermissionPopup onAllow={mockOnAllow} onDeny={mockOnDeny} onClose={() => {}} />);
  
    // Pastikan tombol "Lanjutkan" tersedia sebelum klik
    const allowButton = await screen.findByText("Lanjutkan");
    fireEvent.click(allowButton);
  
    await waitFor(() => {
      expect(mockOnAllow).toHaveBeenCalled();
    });
  });

  test("Klik tombol 'Lanjutkan' tidak memanggil onDeny", async () => {
    render(<LocationPermissionPopup onAllow={mockOnAllow} onDeny={mockOnDeny} onClose={() => {}} />);
  
    // Pastikan tombol "Lanjutkan" tersedia sebelum klik
    const allowButton = await screen.findByText("Lanjutkan");
    fireEvent.click(allowButton);
  
    expect(mockOnDeny).not.toHaveBeenCalled();
  });
  
  test("Klik tombol 'Batal' memanggil onDeny", async () => {
    render(<LocationPermissionPopup onAllow={mockOnAllow} onDeny={mockOnDeny} onClose={() => {}} />);
  
    // Pastikan tombol "Batal" tersedia sebelum klik
    const denyButton = await screen.findByText("Batal");
    fireEvent.click(denyButton);
  
    expect(mockOnDeny).toHaveBeenCalled();
  });

  test("Klik tombol 'Batal' tidak memanggil onAllow", async () => {
    render(<LocationPermissionPopup onAllow={mockOnAllow} onDeny={mockOnDeny} onClose={() => {}} />);

    // Pastikan tombol "Batal" tersedia sebelum klik
    const denyButton = await screen.findByText("Batal");
    fireEvent.click(denyButton);

    expect(mockOnAllow).not.toHaveBeenCalled();
  });
  
  test("Jika pengguna memblokir lokasi, panggil onDeny", async () => {
    // Simulasikan error seolah-olah dari Geolocation API
    const mockError = {
      code: 1, // 1 = PERMISSION_DENIED
      message: "User denied Geolocation",
    };
  
    jest.spyOn(navigator.geolocation, "getCurrentPosition").mockImplementation(
      (_, error) => {
        if (error) {
          error({
            code: mockError.code,
            message: mockError.message,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3
          });
        }
      }
    );
  
    render(<LocationPermissionPopup onAllow={mockOnAllow} onDeny={mockOnDeny} onClose={() => {}} />);
  
    // Pastikan tombol "Lanjutkan" muncul sebelum mengklik
    const allowButton = await screen.findByText("Lanjutkan");
    fireEvent.click(allowButton);
  
    // Gunakan `waitFor` untuk memastikan `mockOnDeny` terpanggil
    await waitFor(() => expect(mockOnDeny).toHaveBeenCalled());
  });  
  

  test("Popup tidak ditampilkan jika izin sudah granted", async () => {
    jest.spyOn(navigator.permissions, "query").mockResolvedValue({
      state: "granted",
      onchange: null,
    } as PermissionStatus);

    render(<LocationPermissionPopup onAllow={mockOnAllow} onDeny={mockOnDeny} onClose={() => {}} />);

    await waitFor(() => {
      expect(mockOnAllow).toHaveBeenCalled();
    });

    expect(screen.queryByText("Izin Lokasi Diperlukan")).not.toBeInTheDocument();
  });

  test("Popup muncul jika izin belum diberikan (prompt)", async () => {
    jest.spyOn(navigator.permissions, "query").mockResolvedValue({
      state: "prompt",
      onchange: null,
    } as PermissionStatus);

    render(<LocationPermissionPopup onAllow={mockOnAllow} onDeny={mockOnDeny} onClose={() => {}} />);

    expect(await screen.findByText("Izin Lokasi Diperlukan")).toBeInTheDocument();
  });
});
