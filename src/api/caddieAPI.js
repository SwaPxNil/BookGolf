import apiClient from "./apiClient";

const unwrap = (response) => response?.data?.data ?? response?.data;
const isFile = (value) => typeof File !== "undefined" && value instanceof File;

const normalizeCaddie = (caddie) => ({
	id: caddie?._id || caddie?.id,
	courseId: caddie?.course_id?._id || caddie?.course_id || caddie?.courseId || null,
	fullName: caddie?.full_name || "",
	description: caddie?.description || "",
	experience: caddie?.experience ?? caddie?.experience_years ?? 0,
	experienceYears: caddie?.experience_years ?? caddie?.experience ?? 0,
	rating: caddie?.rating ?? 0,
	matchesCaddied: caddie?.matches_caddied ?? 0,
	specialty: caddie?.speciality || "",
	image: caddie?.profile_img || caddie?.image_url || "",
	availabilitySlots: Array.isArray(caddie?.availability_slots) ? caddie.availability_slots : [],
});

const toCaddiePayload = (caddie) => ({
	full_name: caddie.fullName,
	course_id: caddie.courseId || undefined,
	description: caddie.description,
	experience_years: Number(caddie.experienceYears || caddie.experience || 0),
	rating: Number(caddie.rating || 0),
	matches_caddied: Number(caddie.matchesCaddied || 0),
	speciality: caddie.specialty,
	profile_img: caddie.image || undefined,
	availability_slots: Array.isArray(caddie.availabilitySlots) ? caddie.availabilitySlots : undefined,
	availabilitySlots: Array.isArray(caddie.availabilitySlots) ? caddie.availabilitySlots : undefined,
});

const toCaddieRequestPayload = (caddie) => {
	const payload = toCaddiePayload(caddie);
	const imageFile = caddie?.imageFile || (isFile(caddie?.image) ? caddie.image : null);

	if (!imageFile) {
		return payload;
	}

	const formData = new FormData();
	Object.entries(payload).forEach(([key, value]) => {
		if (typeof value === "undefined" || value === null || value === "") return;

		if (Array.isArray(value) || (typeof value === "object" && !(value instanceof Date))) {
			formData.append(key, JSON.stringify(value));
			return;
		}

		formData.append(key, String(value));
	});

	formData.append("image", imageFile);
	return formData;
};

export async function getCaddies() {
	const response = await apiClient.get("/caddies");
	return (unwrap(response) || []).map(normalizeCaddie);
}

export async function getCourseScopedCaddies(courseId) {
	const caddies = await getCaddies();
	if (!courseId) return caddies;

	const filtered = caddies.filter((caddie) => caddie.courseId === courseId);
	return filtered.length > 0 ? filtered : caddies;
}

export async function getCaddieById(id) {
	const response = await apiClient.get(`/caddies/${id}`);
	return normalizeCaddie(unwrap(response));
}

export async function createCaddie(payload) {
	const response = await apiClient.post("/caddies", toCaddieRequestPayload(payload));
	return normalizeCaddie(unwrap(response));
}

export async function updateCaddie(id, payload) {
	const response = await apiClient.put(`/caddies/${id}`, toCaddieRequestPayload(payload));
	return normalizeCaddie(unwrap(response));
}

export async function deleteCaddie(id) {
	await apiClient.delete(`/caddies/${id}`);
}
