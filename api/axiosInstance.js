import axios from "axios";
import { getAccessToken, getRefreshToken } from "./tokenStorage";

const BASE_URL = "http://192.168.1.9:3000/api";

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

authAxios.interceptors.request.use(async (config) => {
  const [accessToken, refreshToken] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
  ]);

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // refreshToken is loaded separately for explicit token handling flow.
  void refreshToken;

  return config;
});
