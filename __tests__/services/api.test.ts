import { FilterState } from "@/types";
import { mapApi } from "../../services/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

describe('mapApi', () => {
    const mockResponse = [
        { id: 1, latitude: -6.200000, longitude: 106.816666 },
        { id: 2, latitude: -6.914744, longitude: 107.609810 }
    ];

    beforeEach(() => {
        global.fetch = jest.fn();
        console.error = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getLocations', () => {
        it('should fetch locations successfully', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await mapApi.getLocations();
            
            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                `${process.env.NEXT_PUBLIC_API_URL}/cases/locations/`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-api-key': String(process.env.NEXT_PUBLIC_API_KEY),
                    },
                    credentials: 'include',
                }
            );
        });

        it('should handle HTTP error responses', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(mapApi.getLocations()).rejects.toThrow('HTTP error! status: 404');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle network errors', async () => {
            const networkError = new Error('Network error');
            (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

            await expect(mapApi.getLocations()).rejects.toThrow('Network error');
            expect(console.error).toHaveBeenCalledWith('Error fetching locations:', networkError);
        });

        it('should handle empty response', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([])
            });

            const result = await mapApi.getLocations();
            expect(result).toEqual([]);
        });
    });

    describe('getFilteredLocations', () => {
      it('fetches filtered locations successfully', async () => {
        const mockFilters: FilterState = {
          diseases: ['COVID-19'],
          locations: ['Jakarta'],
          level_of_alertness: 3,
          portals: ['Portal A'],
          start_date: '2025-01-01',
          end_date: '2025-01-31',
        };
  
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        });
  
        const result = await mapApi.getFilteredLocations(mockFilters);
  
        expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/cases/locations/`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': String(API_KEY),
          },
          credentials: 'include',
          body: JSON.stringify(mockFilters),
        });
  
        expect(result).toEqual(mockResponse);
      });
  
      it('throws an error when the response is not ok', async () => {
        const mockFilters: FilterState = {
          diseases: ['COVID-19'],
          locations: ['Jakarta'],
          level_of_alertness: 3,
          portals: ['Portal A'],
          start_date: '2025-01-01',
          end_date: '2025-01-31',
        };
  
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 500,
        });
  
        await expect(mapApi.getFilteredLocations(mockFilters)).rejects.toThrow('HTTP error! status: 500');
  
        expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/cases/locations/`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': String(API_KEY),
          },
          credentials: 'include',
          body: JSON.stringify(mockFilters),
        });
      });
  
      it('throws an error when fetch fails', async () => {
        const mockFilters: FilterState = {
          diseases: ['COVID-19'],
          locations: ['Jakarta'],
          level_of_alertness: 3,
          portals: ['Portal A'],
          start_date: '2025-01-01',
          end_date: '2025-01-31',
        };
  
        const mockError = new Error('Network error');
        global.fetch = jest.fn().mockRejectedValue(mockError);
  
        await expect(mapApi.getFilteredLocations(mockFilters)).rejects.toThrow('Network error');
  
        expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/cases/locations/`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': String(API_KEY),
          },
          credentials: 'include',
          body: JSON.stringify(mockFilters),
        });
      });
    });
});