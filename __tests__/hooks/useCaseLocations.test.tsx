import { renderHook, act, waitFor } from "@testing-library/react";
import { useCaseLocations } from "../../hooks/useCaseLocations";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("useCaseLocations Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "https://api";
    process.env.NEXT_PUBLIC_API_KEY = "-apikey";
  });

  test("Harus mengambil data lokasi dan memperbarui state", async () => {
    const mockData = [
      { id: "uuid-1", city: "Jakarta", location__latitude: -6.2088, location__longitude: 106.8456 },
    ];

    mockedAxios.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useCaseLocations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.locations).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api/cases/locations/",
      {
        headers: {
          "X-API-KEY": "-apikey",
        },
      }
    );
  });

  test("Harus menangani error jika API gagal", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useCaseLocations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.locations).toEqual([]);
    expect(result.current.error).toBe("Gagal mengambil data kasus. Silakan coba lagi.");
  });

  test("Harus tidak melakukan refetch jika API URL tidak berubah", async () => {
    const { result, rerender } = renderHook(() => useCaseLocations());

    expect(result.current.loading).toBe(true);

    rerender();

    expect(result.current.loading).toBe(true);
  });

  test("Harus mengatur loading ke false setelah fetch selesai", async () => {
    const mockData = [{ id: "uuid-1", city: "Jakarta", location__latitude: -6.2088, location__longitude: 106.8456 }];
   
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useCaseLocations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loading).toBe(false);
  });

  test("Harus mengembalikan setError untuk mengatur error secara manual", () => {
    const { result } = renderHook(() => useCaseLocations());

    act(() => {
      result.current.setError("Custom Error");
    });

    expect(result.current.error).toBe("Custom Error");
  });

  test("Harus menambahkan API Key ke dalam header request", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    renderHook(() => useCaseLocations());

    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api/cases/locations/",
      {
        headers: {
          "X-API-KEY": "-apikey",
        },
      }
    );
  });
});
