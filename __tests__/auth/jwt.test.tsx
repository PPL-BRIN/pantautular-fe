// Test file for JWT authentication strategy
import { JWTStrategy } from "../../app/auth/strategies/jwt"
import { TEST_CONFIG } from "../test-config";

// Mock fetch globally
global.fetch = jest.fn();

// Credential constants - using test config to avoid hard-coded passwords
const MOCK_CREDENTIALS = {
  valid: { 
    email: "valid@example.com", 
    password: TEST_CONFIG.mockData.credentials.validPassword 
  },
  invalid: { 
    email: "invalid@example.com", 
    password: TEST_CONFIG.mockData.credentials.invalidPassword 
  },
  networkError: { 
    email: "network@example.com", 
    password: TEST_CONFIG.mockData.credentials.networkPassword 
  }
};

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
process.env = {
  ...process.env,
  NEXT_PUBLIC_API_URL: TEST_CONFIG.api.url,
  NEXT_PUBLIC_API_KEY: TEST_CONFIG.api.key,
};

describe("JWTStrategy", () => {
  const jwt = new JWTStrategy();
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it("logs in successfully", async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: TEST_CONFIG.mockData.token }),
    });

    const credentials = MOCK_CREDENTIALS.valid;
    const res = await jwt.login(credentials);
    
    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      TEST_CONFIG.api.url + '/authentication/login',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': TEST_CONFIG.api.key,
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
    expect(res.token).toBe(TEST_CONFIG.mockData.token);
    expect(res.user.username).toBe(credentials.email);
  });

  it("handles login failure", async () => {
    // Mock failed API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const credentials = MOCK_CREDENTIALS.invalid;
    
    await expect(jwt.login(credentials)).rejects.toThrow("Authentication failed: 401");
    
    // Verify localStorage was not updated
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it("handles network errors during login", async () => {
    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const credentials = MOCK_CREDENTIALS.networkError;
    
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


