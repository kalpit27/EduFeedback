import { Capacitor } from '@capacitor/core';

const CANDIDATE_HOSTS = [
  'http://localhost:5000/api',
  'http://192.168.1.38:5000/api',
  'http://10.0.2.2:5000/api',
  '/api',
];

let workingBaseUrl: string | null = null;

export class ApiError extends Error {
  statusCode: number;
  errorType?: string;
  errors?: any[];

  constructor(message: string, statusCode: number, errorType?: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.errors = errors;
  }
}

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 4000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('edu_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If we already know the working API host, try it first
  if (workingBaseUrl) {
    try {
      const response = await fetchWithTimeout(`${workingBaseUrl}${endpoint}`, { ...options, headers }, 8000);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new ApiError(
          data.message || `Request failed with status ${response.status}`,
          response.status,
          data.errorType,
          data.errors
        );
      }
      return data;
    } catch (e: any) {
      if (e instanceof ApiError) throw e;
      // If network failed on cached host, reset and rediscover
      workingBaseUrl = null;
    }
  }

  // Auto-discover working endpoint
  const isMobile = Capacitor.isNativePlatform() || window.location.protocol === 'capacitor:' || (window.location.hostname === 'localhost' && !window.location.port);
  const candidateList = isMobile ? CANDIDATE_HOSTS : ['/api', ...CANDIDATE_HOSTS];

  let lastError: any = null;

  for (const host of candidateList) {
    try {
      const targetUrl = `${host}${endpoint}`;
      const response = await fetchWithTimeout(targetUrl, { ...options, headers }, 3500);
      const data = await response.json().catch(() => ({}));
      if (response.ok || response.status < 500) {
        workingBaseUrl = host;
        if (!response.ok) {
          throw new ApiError(
            data.message || `Request failed with status ${response.status}`,
            response.status,
            data.errorType,
            data.errors
          );
        }
        return data;
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        workingBaseUrl = host;
        throw err;
      }
      lastError = err;
    }
  }

  throw new ApiError(
    lastError?.message || 'Unable to connect to institute backend server. Please check network connection.',
    0
  );
}

export const api = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: any) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body?: any) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(url: string, body?: any) => request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
