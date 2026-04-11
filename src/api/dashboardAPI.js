import apiClient from "./apiClient";

const unwrap = (response) => response?.data?.data ?? response?.data;

export async function getDashboardOverview() {
	const response = await apiClient.get("/dashboard");
	return unwrap(response) || {};
}

