/**
 * Test configuration file
 * Contains mock data and settings for testing purposes
 */

export const TEST_CONFIG = {
  api: {
    url: process.env.TEST_API_URL ?? 'https://api.test.pantautular.com',
    key: process.env.TEST_API_KEY ?? 'test-api-key-12345'
  },
  mockData: {
    // Use environment variable for token to avoid hard-coded secrets
    token: process.env.TEST_JWT_TOKEN ?? 'mock-jwt-token-placeholder',
    credentials: {
      validPassword: process.env.TEST_VALID_PASSWORD ?? 'valid-password-placeholder',  
      invalidPassword: process.env.TEST_INVALID_PASSWORD ?? 'invalid-password-placeholder',
      networkPassword: process.env.TEST_NETWORK_PASSWORD ?? 'network-password-placeholder'
    },
    user: {
      username: 'testUser',
      email: 'test@example.com'
    }
  }
};