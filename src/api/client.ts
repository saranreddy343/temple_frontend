import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import Constants from "expo-constants";
import { storage } from "../utils/storage";

// Lazy getters to avoid circular dependency: client.ts -> store -> authSlice -> api -> client
const getStore = () => (require("../store") as typeof import("../store")).store;
const getAuthActions = () =>
  require("../store/slices/authSlice") as typeof import("../store/slices/authSlice");

const BASE_URL =
  (Constants.expoConfig?.extra?.["apiBaseUrl"] as string) ??
  "http://192.168.1.5:5001/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - attach access token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await storage.getTokens();
        if (!tokens) throw new Error("No refresh token");

        const response = await axios.post(`${BASE_URL}/auth/token/refresh`, {
          refreshToken: tokens.refreshToken,
        });

        const { accessToken, refreshToken } = response.data.data as {
          accessToken: string;
          refreshToken: string;
        };

        await storage.setTokens(accessToken, refreshToken);
        getStore().dispatch(
          getAuthActions().setTokens({ accessToken, refreshToken }),
        );

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await getStore().dispatch(getAuthActions().logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
