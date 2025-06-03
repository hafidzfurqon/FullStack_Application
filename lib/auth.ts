// lib/auth.ts - Utility functions for authentication
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const getAuthToken = (): string | null => {
  return getCookie("access_token");
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create axios instance
const API_URL = process.env.NEXT_PUBLIC_HOST_API || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      deleteCookie("access_token");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// Simplified API call functions
export const apiCall = {
  // GET request
  get: async <T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.get(endpoint, config);
    return response.data;
  },

  // POST request
  post: async <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.post(endpoint, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.put(endpoint, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.delete(endpoint, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.patch(endpoint, data, config);
    return response.data;
  },
};

// Example usage in components:
//  GET - Get user profile
//   const userProfile = await apiCall.get("/profile");
