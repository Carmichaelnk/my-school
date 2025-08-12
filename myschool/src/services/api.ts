/**
 * API Service Layer for MySchool App
 * Handles all backend communication with Flask API
 */

const API_BASE_URL = 'http://127.0.0.1:5001';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'lecturer';
  is_active: boolean;
  is_verified: boolean;
  profile_picture?: string;
  phone_number?: string;
  created_at: string;
  last_login?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Set authentication token
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  // Clear authentication token
  clearAccessToken() {
    this.accessToken = null;
  }

  // Get default headers for API requests
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders();

    // Add authorization header if token exists
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData: {
    email: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: 'student' | 'lecturer';
    phone_number?: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    return this.request<{ access_token: string }>('/api/auth/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // Google OAuth endpoints
  async getGoogleAuthUrl(): Promise<{ auth_url: string; redirect_uri: string }> {
    return this.request<{ auth_url: string; redirect_uri: string }>('/api/auth/google/url');
  }

  async googleAuth(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // User profile endpoints
  async getUserProfile(): Promise<User> {
    return this.request<User>('/api/user/profile');
  }

  async updateUserProfile(profileData: Partial<User>): Promise<User> {
    return this.request<User>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserProfileInfo(): Promise<any> {
    const response = await this.request('/auth/profile', {
      method: 'GET',
    });
    return response;
  }

  // OTP Verification endpoints
  async verifyOtp(userId: number, otpCode: string): Promise<any> {
    const response = await this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        otp_code: otpCode,
      }),
    });
    return response;
  }

  async resendOtp(userId: number): Promise<any> {
    const response = await this.request('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
      }),
    });
    return response;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request<{ status: string; service: string }>('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
