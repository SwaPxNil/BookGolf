import axios from "axios";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from "./tokenStorage";

const DEFAULT_API_URL = "http://192.168.1.64:5000/api";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    `EXPO_PUBLIC_API_URL is not set. Using fallback API URL: ${DEFAULT_API_URL}`
  );
}

// no auth
export const publicAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    'Cache-Control': 'no-cache'
  },
});

// with auth
export const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    'Cache-Control': 'no-cache'
  },
});

let refreshPromise = null;

const extractTokenPayload = (response) => {
  const payload = response?.data?.data ?? response?.data ?? {};
  return {
    accessToken: payload?.access_token || payload?.accessToken || null,
    refreshToken: payload?.refresh_token || payload?.refreshToken || null,
  };
};

const refreshAccessTokenInternal = async () => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const response = await publicAxios.post("/auth/refresh", {
    refresh_token: refreshToken,
  });

  const { accessToken, refreshToken: rotatedRefreshToken } = extractTokenPayload(response);
  if (!accessToken) {
    throw new Error("Refresh endpoint did not return an access token");
  }

  await saveAuthTokens({
    accessToken,
    refreshToken: rotatedRefreshToken || refreshToken,
  });

  return accessToken;
};

authAxios.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest?.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/verify-2fa") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/register");

    if (status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessTokenInternal().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;
      originalRequest.headers = {
        ...(originalRequest.headers || {}),
        Authorization: `Bearer ${newAccessToken}`,
      };

      return authAxios(originalRequest);
    } catch (refreshError) {
      await clearAuthTokens();
      return Promise.reject(refreshError);
    }
  }
);
