export interface DataFetcher {
    fetchData<T>(url: string, headers?: Record<string, string>): Promise<T>;
}