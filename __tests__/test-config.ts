/**
 * Test configuration file
 * Contains mock data and settings for testing purposes
 */

export const TEST_CONFIG = {
  api: {
    url: 'https://api.test.pantautular.com',
    key: 'test-api-key-12345'
  },
  mockData: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6InRlc3RVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    credentials: {
      validPassword: process.env.TEST_VALID_PASSWORD || 'valid-password-placeholder',  
      invalidPassword: process.env.TEST_INVALID_PASSWORD || 'invalid-password-placeholder',
      networkPassword: process.env.TEST_NETWORK_PASSWORD || 'network-password-placeholder'
    },
    user: {
      username: 'testUser',
      email: 'test@example.com'
    }
  }
};