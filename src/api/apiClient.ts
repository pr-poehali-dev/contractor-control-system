import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = 'https://functions.poehali.dev';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        
        if (token && config.headers) {
          config.headers['X-Auth-Token'] = token;
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get<T>(url, config);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T = any>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<T>(url, data, config);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T = any>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put<T>(url, data, config);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T = any>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete<T>(url, config);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private normalizeResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    const data = response.data;

    if (typeof data === 'object' && data !== null && 'success' in data) {
      return data as ApiResponse<T>;
    }

    return {
      success: true,
      data: data,
      message: null,
    };
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        return new Error(errorData.error || errorData.message || 'Произошла ошибка');
      }
      
      if (axiosError.request) {
        return new Error('Нет ответа от сервера. Проверьте интернет-соединение.');
      }
    }

    return new Error('Произошла неизвестная ошибка');
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse };
