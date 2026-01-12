import axios, { AxiosResponse } from 'axios';

// 1. Define Interfaces for your API responses
interface AuthResponse {
  access_token: string;
  token_type: string;
}

interface UserProfile {
  id: string;
  email: string;
  password: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const authService = {
  /**
   * Register a new user
   */
  register: async (email: string, password: string): Promise<UserProfile> => {
    const response: AxiosResponse = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Login user - Sends x-www-form-urlencoded data
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const params = new URLSearchParams();
    params.append('username', email); 
    params.append('password', password);

    const response: AxiosResponse<AuthResponse> = await axios.post(
      `${API_URL}/auth/login`, 
      params, 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (response.data.access_token) {
      localStorage.setItem('token_stock', response.data.access_token);
    }
    return response.data;
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<UserProfile> => {
    const token = localStorage.getItem('token_stock');
    if (!token) throw new Error("No token found");

    const response: AxiosResponse<UserProfile> = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token_stock');
  }
};

export default authService;