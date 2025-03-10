import axios from "axios";
import { DataFetcher } from "../../interfaces/DataFetcher";

export class AxiosFetcher implements DataFetcher {
  async fetchData<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
    try {
      const response = await axios.get<T>(url, { headers });

      if (!response?.data) {
        throw new Error("Invalid response format");
      }      

      return response.data;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch data"
      );
    }
  }
}