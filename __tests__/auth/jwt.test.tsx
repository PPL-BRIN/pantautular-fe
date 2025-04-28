// NOSONAR - This is a test file
// sonar-disable-next-line
import { JWTStrategy } from "../../app/auth/strategies/jwt"

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock process.env
// sonar:ignore:start - Test credentials
process.env = {
  ...process.env,
  NEXT_PUBLIC_API_URL: 'http://test-api.com',
  NEXT_PUBLIC_API_KEY: 'test-api-key',
};
// sonar:ignore:end

describe("JWTStrategy", () => {
  const jwt = new JWTStrategy();
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  // sonar:ignore:start - Test credentials in test files are allowed
  it("logs in successfully", async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "mock-jwt-token" }),
    });

    const credentials = { email: "testUser@example.com", password: "password123" };
    const res = await jwt.login(credentials);
    
    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      'http://test-api.com/authentication/login',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': 'test-api-key',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      }
    );
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'user', 
      JSON.stringify({ username: credentials.email })
    );
    
    // Verify return value
    expect(res.token).toBe("mock-jwt-token");
    expect(res.user.username).toBe(credentials.email);
  });
  // sonar:ignore:end

  it("handles login failure", async () => {
    // Mock failed API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    // sonar:ignore:start - Test credentials
    const credentials = { email: "invalid@example.com", password: "wrongpass" };
    // sonar:ignore:end
    
    await expect(jwt.login(credentials)).rejects.toThrow("Authentication failed: 401");
    
    // Verify localStorage was not updated
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it("handles network errors during login", async () => {
    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    // sonar:ignore:start - Test credentials
    const credentials = { email: "user@example.com", password: "password" };
    // sonar:ignore:end
    
    await expect(jwt.login(credentials)).rejects.toThrow("Network error");
  });

  it("fetches user correctly when stored in localStorage", async () => {
    // Set up mock data in localStorage
    const userData = { username: "testUser" };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(userData));
    
    const user = await jwt.getUser();
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    expect(user).toEqual(userData);
  });

  it("returns null when no user is found in localStorage", async () => {
    // Mock empty localStorage
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    const user = await jwt.getUser();
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    expect(user).toBeNull();
  });

  it("logs out without error", async () => {
    await expect(jwt.logout()).resolves.toBeUndefined();
  });
})

// app/auth/strategies/base.ts
export interface AuthStrategy {
    login(credentials: any): Promise<any>
    logout(): Promise<void>
    getUser(): Promise<any>
  }


