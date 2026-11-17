const DEFAULT_LIVE_API_URL = 'https://whatsapp.ro-s.net/api';
const TOKEN_KEY = 'parent_auth_token';

/** Fired when the server rejects the parent token (expired / revoked); App logs out on it. */
export const UNAUTHORIZED_EVENT = 'parent:unauthorized';

const getApiBaseUrl = (): string => {
  const customUrl = localStorage.getItem('parent_api_base_url');
  if (customUrl) return customUrl;
  return DEFAULT_LIVE_API_URL;
};

export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
  }
}

export class ApiClient {
  public static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public static setToken(token: string | null): void {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        ...options,
        headers,
        signal: options.signal || AbortSignal.timeout(15000),
      });
    } catch {
      throw new ApiError('تعذر الاتصال بالسيرفر، تأكد من اتصالك بالإنترنت', 0);
    }

    const text = await response.text().catch(() => '');
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {}

    if (!response.ok) {
      if (response.status === 401 && token) {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
      throw new ApiError(data?.message || 'حدث خطأ في الاتصال بالسيرفر', response.status, data);
    }

    return data as T;
  }

  public static get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public static post<T>(endpoint: string, data: any = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
