import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ROUTES } from '@/constants/routes';

const API_BASE_URL = 'https://functions.poehali.dev';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * HTTP клиент для взаимодействия с backend API
 * Автоматически добавляет токен авторизации и обрабатывает ошибки
 * @class ApiClient
 */
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

  /**
   * Настройка interceptors для добавления токена и обработки ошибок
   * @private
   */
  private setupInterceptors(): void {
    // Request interceptor - добавление токена
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');
        
        if (token && config.headers) {
          config.headers['X-Auth-Token'] = token;
        }

        if (userStr && config.headers) {
          try {
            const user = JSON.parse(userStr);
            if (user.id) {
              config.headers['X-User-Id'] = user.id.toString();
            }
          } catch (error) {
            console.warn('Failed to parse user from localStorage:', error);
          }
        }

        return config;
      },
      (error: AxiosError) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - обработка 401/403 ошибок
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        // При 401/403 очищаем токен и редиректим на login
        // ТОЛЬКО если не установлен флаг skipAuthRedirect
        const config = error.config as any;
        const skipRedirect = config?.skipAuthRedirect;
        
        if ((error.response?.status === 401 || error.response?.status === 403) && !skipRedirect) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          
          if (!window.location.pathname.includes(ROUTES.LOGIN)) {
            window.location.href = ROUTES.LOGIN;
          }
        }

        console.error('Response interceptor error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        return Promise.reject(error);
      }
    );
  }

  /**
   * GET запрос
   * @template T - Тип возвращаемых данных
   * @param {string} url - URL endpoint
   * @param {object} config - Дополнительная конфигурация Axios
   * @returns {Promise<ApiResponse<T>>} Нормализованный ответ сервера
   * @example
   * const response = await apiClient.get('/user-data');
   */
  async get<T = any>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get<T>(url, config);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST запрос
   * @template T - Тип возвращаемых данных
   * @param {string} url - URL endpoint
   * @param {object} data - Данные для отправки
   * @param {object} config - Дополнительная конфигурация Axios
   * @returns {Promise<ApiResponse<T>>} Нормализованный ответ сервера
   * @example
   * const response = await apiClient.post('/auth/login', { email, password });
   */
  async post<T = any>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<T>(url, data, config);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT запрос
   * @template T - Тип возвращаемых данных
   * @param {string} url - URL endpoint
   * @param {object} data - Данные для обновления
   * @param {object} config - Дополнительная конфигурация Axios
   * @returns {Promise<ApiResponse<T>>} Нормализованный ответ сервера
   * @example
   * const response = await apiClient.put('/update-data', { type: 'object', id: 1, data: { title: 'New' } });
   */
  async put<T = any>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put<T>(url, data, config);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE запрос
   * @template T - Тип возвращаемых данных
   * @param {string} url - URL endpoint
   * @param {object} config - Дополнительная конфигурация Axios (может содержать data)
   * @returns {Promise<ApiResponse<T>>} Нормализованный ответ сервера
   * @example
   * const response = await apiClient.delete('/delete-data', { data: { type: 'object', id: 1 } });
   */
  async delete<T = any>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete<T>(url, config);
      return this.normalizeResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Нормализация ответа от сервера к единому формату
   * @private
   * @template T - Тип данных
   * @param {AxiosResponse<T>} response - Ответ Axios
   * @returns {ApiResponse<T>} Нормализованный ответ
   */
  private normalizeResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    const data = response.data;

    // Если ответ уже в нужном формате { success, data, ... }
    if (typeof data === 'object' && data !== null && 'success' in data) {
      return data as ApiResponse<T>;
    }

    // Если ответ содержит error (формат ошибки backend)
    if (typeof data === 'object' && data !== null && 'error' in data) {
      return {
        success: false,
        error: (data as any).error,
        data: undefined,
      };
    }

    // Оборачиваем в стандартный формат (успешный ответ без обёртки)
    // Backend auth возвращает { token, user } напрямую
    return {
      success: true,
      data: data,
    };
  }

  /**
   * Обработка ошибок и преобразование в читаемый формат
   * @private
   * @param {unknown} error - Ошибка от Axios или другая
   * @returns {Error} Нормализованная ошибка
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      
      // Если есть данные ошибки от сервера
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        const message = errorData.error || errorData.message || 'Произошла ошибка';
        console.error('API error:', { status: axiosError.response.status, message, data: errorData });
        return new Error(message);
      }
      
      // Если запрос был отправлен, но нет ответа
      if (axiosError.request) {
        console.error('No response from server:', axiosError.request);
        return new Error('Нет ответа от сервера. Проверьте интернет-соединение.');
      }

      // Ошибка при настройке запроса
      console.error('Request setup error:', axiosError.message);
      return new Error(axiosError.message || 'Ошибка настройки запроса');
    }

    // Неизвестная ошибка
    console.error('Unknown error:', error);
    return new Error('Произошла неизвестная ошибка');
  }
}

/**
 * Singleton instance API клиента
 * Используйте этот экземпляр для всех HTTP запросов
 * @example
 * import { apiClient } from '@/api/apiClient';
 * const response = await apiClient.get('/user-data');
 */
export const apiClient = new ApiClient();
export type { ApiResponse };