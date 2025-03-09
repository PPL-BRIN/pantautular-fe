import axios from "axios";
import { AxiosFetcher } from "../../services/AxiosFetcher";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("AxiosFetcher", () => {
    test("fetchData should return data when request is successful", async () => {
      const mockData = [{ id: "1", city: "Jakarta", location__latitude: -6.2088, location__longitude: 106.8456 }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });
  
      const fetcher = new AxiosFetcher();
      const result = await fetcher.fetchData("/test-url");
  
      expect(mockedAxios.get).toHaveBeenCalledWith("/test-url", { headers: {} });
      expect(result).toEqual(mockData);
    });

    test("fetchData should throw an error when request fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      const fetcher = new AxiosFetcher();

      await expect(fetcher.fetchData("/test-url")).rejects.toThrow("Network Error");

      expect(mockedAxios.get).toHaveBeenCalledWith("/test-url", { headers: {} });
    });

    test("fetchData should return an empty array if API returns no data", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
    
      const fetcher = new AxiosFetcher();
      const result = await fetcher.fetchData("/test-url");
    
      expect(result).toEqual([]);
    });

    test("fetchData should throw an error if API response is undefined", async () => {
      mockedAxios.get.mockResolvedValueOnce({});
    
      const fetcher = new AxiosFetcher();
    
      await expect(fetcher.fetchData("/test-url")).rejects.toThrow("Invalid response format");
    
      expect(mockedAxios.get).toHaveBeenCalledWith("/test-url", { headers: {} });
    });

    test("fetchData should throw an error when the API request fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));
      
      const fetcher = new AxiosFetcher();
      
      await expect(fetcher.fetchData("/test-url")).rejects.toThrow("Network Error");
      expect(mockedAxios.get).toHaveBeenCalledWith("/test-url", { headers: {} });
    });

    test("fetchData should throw a generic error when the thrown error has no message", async () => {
      mockedAxios.get.mockRejectedValueOnce(null);
      
      const fetcher = new AxiosFetcher();
      
      await expect(fetcher.fetchData("/test-url")).rejects.toThrow("Failed to fetch data");
      expect(mockedAxios.get).toHaveBeenCalledWith("/test-url", { headers: {} });
    });
      
});
  