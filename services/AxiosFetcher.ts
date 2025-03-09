import axios from "axios";
import { DataFetcher } from "../interfaces/DataFetcher";


export class AxiosFetcher implements DataFetcher {
  async fetchData<T>(
    url: string,
    headers: Record<string, string> = {},
    method: "GET" | "POST" = "GET",
    body?: any
  ): Promise<T> {
    try {
      let response;


      if (method === "POST") {
        response = await axios.post<T>(url, body, { headers });
      } else {
        response = await axios.get<T>(url, { headers });
      }


      // Jika response undefined, throw error sebelum mengakses status
      if (!response) {
        throw new Error("Invalid response format");
      }


      // Jika status 204 (No Content), kembalikan empty object cast as T
      if (response.status === 204) {
        return {} as T;
      }


      // Pastikan response memiliki data yang valid dan bukan string
      if (!response?.data || typeof response.data === "string") {
        throw new Error("Invalid response format");
      }


      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number }; message?: string };


      // Tangani error berdasarkan kode status dari API
      if (axiosError?.response?.status === 404) {
        throw new Error("404 Not Found");
      }


      // Tangani kasus error yang tidak memiliki message (null atau undefined)
      throw new Error(axiosError?.message || "Failed to fetch data");
    }
  }
}