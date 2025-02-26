import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LocationPermissionPopup from "../app/components/LocationPermissionPopUp";

describe("LocationPermissionPopup", () => {
  test("tidak menampilkan popup saat 'open' adalah 'false'", () => {
    render(
      <LocationPermissionPopup
        open={false}
        onClose={jest.fn()}
        onAllow={jest.fn()}
        onDeny={jest.fn()}
      />
    );

    const popupText = screen.queryByText(/Fitur ini memerlukan akses lokasi Anda/i);
    expect(popupText).not.toBeInTheDocument();
  });

  test("menampilkan popup saat 'open' adalah 'true'", () => {
    render(
      <LocationPermissionPopup
        open={true}
        onClose={jest.fn()}
        onAllow={jest.fn()}
        onDeny={jest.fn()}
      />
    );

    expect(screen.getByText(/Lokasi Diperlukan/i)).toBeInTheDocument();
    expect(screen.getByText(/Fitur ini memerlukan akses lokasi Anda/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Izinkan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tolak/i })).toBeInTheDocument();
  });

  test("memanggil 'onAllow' saat tombol 'Izinkan' ditekan", () => {
    const handleAllow = jest.fn();

    render(
      <LocationPermissionPopup
        open={true}
        onClose={jest.fn()}
        onAllow={handleAllow}
        onDeny={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Izinkan/i }));
    expect(handleAllow).toHaveBeenCalledTimes(1);
  });

  test("memanggil `onDeny` saat tombol 'Tolak' ditekan", () => {
    const handleDeny = jest.fn();

    render(
      <LocationPermissionPopup
        open={true}
        onClose={jest.fn()}
        onAllow={jest.fn()}
        onDeny={handleDeny}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Tolak/i }));
    expect(handleDeny).toHaveBeenCalledTimes(1);
  });
});
