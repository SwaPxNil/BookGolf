import axios from "axios";
import { getAccessToken, getRefreshToken, setAccessToken } from "./tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
	const token = getAccessToken();
	if (token) {
		config.headers = config.headers || {};
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error?.config;
		const statusCode = error?.response?.status;

		if (statusCode !== 401 || !originalRequest || originalRequest._retry) {
			return Promise.reject(error);
		}

		const refreshToken = getRefreshToken();
		if (!refreshToken) {
			return Promise.reject(error);
		}

		originalRequest._retry = true;

		try {
			const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
				refresh_token: refreshToken,
			});

			const newAccessToken = refreshResponse?.data?.access_token;
			if (newAccessToken) {
				setAccessToken(newAccessToken);
				originalRequest.headers = originalRequest.headers || {};
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
			}

			return apiClient(originalRequest);
		} catch (refreshError) {
			return Promise.reject(refreshError);
		}
	}
);

export default apiClient;
