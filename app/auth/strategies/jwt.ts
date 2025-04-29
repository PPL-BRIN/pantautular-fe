// app/auth/strategies/jwt.ts
import { AuthStrategy } from "./base"

export class JWTStrategy implements AuthStrategy {
  async login(credentials: any) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/authentication/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': String(process.env.NEXT_PUBLIC_API_KEY),
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Store user data in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify({ username: credentials.email }));
      }
      
      return { user: { username: credentials.email }, ...data };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    return
  }

  async getUser() {
    // Check if we have a user in localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
    }
    
    // Return null if no user is found
    return null;
  }
}