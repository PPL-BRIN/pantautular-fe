import axios from "axios";
import { AxiosFetcher } from "../../services/AxiosFetcher";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("AxiosFetcher", () => {
  const fetcher = new AxiosFetcher();
  const url = "/test-url";
  const headers = { "X-API-KEY": "test-key" };
  const mockData = [
    { id: "1", city: "Jakarta", location__latitude: -6.2088, location__longitude: 106.8456 },
  ];

  test("fetchData should return data when GET request is successful", async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: mockData });

    const result = await fetcher.fetchData(url, headers, "GET");

    expect(mockedAxios.get).toHaveBeenCalledWith(url, { headers });
    expect(result).toEqual(mockData);
  });

  test("fetchData should return data when POST request is successful", async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: mockData });

    const result = await fetcher.fetchData(url, headers, "POST", { diseases: ["COVID-19"] });

    expect(mockedAxios.post).toHaveBeenCalledWith(url, { diseases: ["COVID-19"] }, { headers });
    expect(result).toEqual(mockData);
  });

  test("fetchData should return an empty array if API returns empty data", async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: [] });

    const result = await fetcher.fetchData(url, headers, "GET");

    expect(result).toEqual([]);
  });

  test("fetchData should throw an error if API response is undefined", async () => {
    mockedAxios.get.mockResolvedValueOnce(undefined);

    await expect(fetcher.fetchData(url, headers, "GET")).rejects.toThrow("Invalid response format");
  });

  test("fetchData should throw an error when API request fails", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    await expect(fetcher.fetchData(url, headers, "GET")).rejects.toThrow("Network Error");
  });

  test("fetchData should throw '404 Not Found' when API returns 404 error", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } });

    await expect(fetcher.fetchData(url, headers, "GET")).rejects.toThrow("404 Not Found");
  });

  test("fetchData should throw a generic error when thrown error has no message", async () => {
    mockedAxios.get.mockRejectedValueOnce(null);

    await expect(fetcher.fetchData(url, headers, "GET")).rejects.toThrow("Failed to fetch data");
  });

  test("fetchData should return empty object when API responds with 204 No Content", async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 204, data: null });

    const result = await fetcher.fetchData(url, headers, "GET");

    expect(result).toEqual({});
  });

  test("fetchData should throw an error when API returns invalid JSON format", async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: "Invalid JSON" });

    await expect(fetcher.fetchData(url, headers, "GET")).rejects.toThrow("Invalid response format");
  });

  test("fetchData should include headers when provided", async () => {
    const mockData = { id: "1", city: "Jakarta" };
    const headers = { Authorization: "Bearer test-token", "X-API-KEY": "test-key" };
 
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });
 
    const fetcher = new AxiosFetcher();
    await fetcher.fetchData("/test-url", headers, "GET");
 
    expect(mockedAxios.get).toHaveBeenCalledWith("/test-url", { headers });
  });  

  test("fetchData should throw an error if headers are not an object", async () => {
    const invalidHeaders: any = "Authorization: Bearer test-token"; // Format salah (harusnya object)
   
    const fetcher = new AxiosFetcher();
   
    await expect(fetcher.fetchData("/test-url", invalidHeaders, "GET")).rejects.toThrow();
  });  

  test("fetchData should still work when headers are not provided", async () => {
    const mockData = { id: "1", city: "Jakarta" };
 
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });
 
    const fetcher = new AxiosFetcher();
    const result = await fetcher.fetchData("/test-url", undefined, "GET");
 
    expect(mockedAxios.get).toHaveBeenCalledWith("/test-url", { headers: {} }); // Header harus tetap dikirim sebagai object kosong
    expect(result).toEqual(mockData);
  });  
});