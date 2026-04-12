import apiClient from "./apiClient";

const unwrap = (response) => response?.data?.data ?? response?.data;
const isFile = (value) => typeof File !== "undefined" && value instanceof File;

const toProfileRequestPayload = (payload = {}) => {
	const imageFile = payload?.imageFile || (isFile(payload?.image) ? payload.image : null);

	if (!imageFile) {
		return payload;
	}

	const formData = new FormData();
	Object.entries(payload).forEach(([key, value]) => {
		if (key === "imageFile") return;
		if (typeof value === "undefined" || value === null || value === "") return;
		formData.append(key, String(value));
	});

	formData.append("image", imageFile);
	return formData;
};

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
	const response = await apiClient.put("/auth/me", toProfileRequestPayload(payload));
	return unwrap(response);
}
