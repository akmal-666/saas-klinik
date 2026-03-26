import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const getStorage = (key: string) =>
  typeof window !== 'undefined' ? localStorage.getItem(key) : null;
const setStorage = (key: string, val: string) =>
  typeof window !== 'undefined' && localStorage.setItem(key, val);
const removeStorage = (key: string) =>
  typeof window !== 'undefined' && localStorage.removeItem(key);

// ─── Axios instance ───────────────────────────────────────
export const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001') + '/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request: inject auth token ──────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStorage('klinik_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response: auto-refresh on 401 ───────────────────────
let refreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error);
    original._retry = true;

    if (refreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    refreshing = true;
    try {
      const refreshToken = getStorage('klinik_refresh_token');
      if (!refreshToken) throw new Error('no refresh token');

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/auth/refresh`,
        { refresh_token: refreshToken },
      );
      const newToken: string = data.data.access_token;
      setStorage('klinik_access_token', newToken);
      queue.forEach((cb) => cb(newToken));
      queue = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      removeStorage('klinik_access_token');
      removeStorage('klinik_refresh_token');
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      refreshing = false;
    }
  },
);

export async function apiFetch<T>(url: string, config?: object): Promise<T> {
  const { data } = await api.get<{ ok: boolean; data: T }>(url, config);
  return data.data;
}
