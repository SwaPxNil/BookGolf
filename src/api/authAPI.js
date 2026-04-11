import apiClient from "./apiClient";

const unwrap = (response) => response?.data?.data ?? response?.data;

export async function login(payload) {
	const response = await apiClient.post("/auth/login", payload);
	return unwrap(response);
}

export async function verifyTwoFactor(payload) {
	const response = await apiClient.post("/auth/verify-2fa", payload);
	return unwrap(response);
}

export async function resendTwoFactor(payload) {
	const response = await apiClient.post("/auth/resend-2fa", payload);
	return unwrap(response);
}

export async function getMyProfile() {
	const response = await apiClient.get("/auth/me");
	return unwrap(response);
}

export async function updateMyProfile(payload) {
	const response = await apiClient.put("/auth/me", payload);
	return unwrap(response);
}
