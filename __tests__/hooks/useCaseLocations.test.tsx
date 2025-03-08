import { renderHook, act, waitFor } from "@testing-library/react";
import { useCaseLocations } from "../../hooks/useCaseLocations";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("useCaseLocations Hook", () => {
  test("Harus mengambil data lokasi dan memperbarui state", async () => {
    const mockData = [
      { id: "uuid-1", city: "Jakarta", location__latitude: -6.2088, location__longitude: 106.8456 },
    ];

    mockedAxios.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useCaseLocations("/api/locations"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.locations).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  test("Harus menangani error jika API gagal", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useCaseLocations("/api/locations"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.locations).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch location data.");
  });

  test("Harus tidak melakukan refetch jika API URL tidak berubah", async () => {
    const { result, rerender } = renderHook(({ apiUrl }) => useCaseLocations(apiUrl), {
      initialProps: { apiUrl: "/api/locations" },
    });

    expect(result.current.loading).toBe(true);

    rerender({ apiUrl: "/api/locations" });

    expect(result.current.loading).toBe(true);
  });

  test("Harus mengatur loading ke false setelah fetch selesai", async () => {
    const mockData = [{ id: "uuid-1", city: "Jakarta", location__latitude: -6.2088, location__longitude: 106.8456 }];
   
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useCaseLocations("/api/locations"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loading).toBe(false);
  });


  test("Harus mengembalikan setError untuk mengatur error secara manual", () => {
    const { result } = renderHook(() => useCaseLocations("/api/locations"));

    act(() => {
      result.current.setError("Custom Error");
    });

    expect(result.current.error).toBe("Custom Error");
  });
});