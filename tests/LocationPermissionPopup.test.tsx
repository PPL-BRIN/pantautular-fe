import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LocationPermissionPopup from "../app/components/LocationPermissionPopup";

const mockOnClose = jest.fn();
const mockOnAllow = jest.fn();
const mockOnDeny = jest.fn();

describe("LocationPermissionPopup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("tidak menampilkan popup saat 'open' adalah 'false'", () => {
    render(
      <LocationPermissionPopup
        open={false}
        onClose={mockOnClose}
        onAllow={mockOnAllow}
        onDeny={mockOnDeny}
      />
    );

    const popupText = screen.queryByText(/Fitur ini memerlukan akses lokasi Anda/i);
    expect(popupText).not.toBeInTheDocument();
  });

  test("menampilkan popup saat 'open' adalah 'true'", () => {
    render(
      <LocationPermissionPopup
        open={true}
        onClose={mockOnClose}
        onAllow={mockOnAllow}
        onDeny={mockOnDeny}
      />
    );

    expect(screen.getByText(/Lokasi Diperlukan/i)).toBeInTheDocument();
    expect(screen.getByText(/Fitur ini memerlukan akses lokasi Anda/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lanjutkan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tolak/i })).toBeInTheDocument();
  });

  test("Memanggil 'onDeny' ketika tombol 'Tolak' ditekan", () => {
    render(
      <LocationPermissionPopup open={true} onClose={mockOnClose} onAllow={mockOnAllow} onDeny={mockOnDeny} />
    );

    const denyButton = screen.getByText("Tolak");
    fireEvent.click(denyButton);

    expect(mockOnDeny).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
    expect(localStorage.getItem("locationPermission")).toBe(null);
  });

  test("Memanggil 'onAllow' ketika tombol 'Lanjutkan' ditekan", () => {
    render(
      <LocationPermissionPopup open={true} onClose={mockOnClose} onAllow={mockOnAllow} onDeny={mockOnDeny} />
    );

    const allowButton = screen.getByText("Lanjutkan");
    fireEvent.click(allowButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnAllow).toHaveBeenCalled();
    expect(localStorage.getItem("locationPermission")).toBe("granted");
  });

  test("Memanggil 'onAllow' ketika izin sudah diberikan", () => {
    localStorage.setItem("locationPermission", "granted");

    render(
      <LocationPermissionPopup open={true} onClose={mockOnClose} onAllow={mockOnAllow} onDeny={mockOnDeny} />
    );

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnAllow).toHaveBeenCalled();
  });

  test("mengembalikan null ketika popup tidak terbuka", () => {
    render(
      <LocationPermissionPopup
        open={false}
        onClose={mockOnClose}
        onAllow={mockOnAllow}
        onDeny={mockOnDeny}
      />
    );

    const overlayElement = screen.queryByText(/Lokasi Diperlukan/i);
    expect(overlayElement).toBeNull();
  });

  test("mengembalikan null ketika izin sudah diberikan", () => {
    localStorage.setItem("locationPermission", "granted");

    render(
      <LocationPermissionPopup
        open={true}
        onClose={mockOnClose}
        onAllow={mockOnAllow}
        onDeny={mockOnDeny}
      />
    );

    const overlayElement = screen.queryByText(/Lokasi Diperlukan/i);
    expect(overlayElement).toBeNull();
  });

});
