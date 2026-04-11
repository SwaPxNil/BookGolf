import apiClient from "./apiClient";

const unwrap = (response) => response?.data?.data ?? response?.data;
const isFile = (value) => typeof File !== "undefined" && value instanceof File;

const normalizeLesson = (lesson) => ({
	id: lesson?._id,
	coachId: lesson?.coach_id?._id || lesson?.coach_id || lesson?.coachId || null,
	title: lesson?.title || "",
	durationMinutes: lesson?.duration_minutes ?? 0,
	price: lesson?.price ?? 0,
});

const normalizeCoach = (coach) => ({
	id: coach?._id || coach?.id,
	courseId: coach?.course_id?._id || coach?.course_id || coach?.courseId || null,
	fullName: coach?.full_name || "",
	specialization: coach?.specialization || "",
	description: coach?.description || "",
	experienceYears: coach?.experience_years ?? 0,
	rating: coach?.rating ?? 0,
	reviewsCount: coach?.reviews_count ?? 0,
	studentsTaught: coach?.students_taught ?? 0,
	recommendationValue: coach?.recommendation_value ?? 0,
	image: coach?.profile_img || coach?.image_url || "",
	availabilitySlots: Array.isArray(coach?.availability_slots) ? coach.availability_slots : [],
	lessons: Array.isArray(coach?.lessons) ? coach.lessons.map(normalizeLesson) : [],
});

const toCoachPayload = (coach) => ({
	full_name: coach.fullName,
	course_id: coach.courseId || undefined,
	specialization: coach.specialization,
	description: coach.description,
	experience_years: Number(coach.experienceYears || 0),
	rating: Number(coach.rating || 0),
	reviews_count: Number(coach.reviewsCount || 0),
	students_taught: Number(coach.studentsTaught || 0),
	profile_img: coach.image || undefined,
	availability_slots: Array.isArray(coach.availabilitySlots) ? coach.availabilitySlots : undefined,
	availabilitySlots: Array.isArray(coach.availabilitySlots) ? coach.availabilitySlots : undefined,
	lessons: Array.isArray(coach.lessons)
		? coach.lessons.map((lesson) => ({
			_id: lesson.id || undefined,
			title: lesson.title,
			duration_minutes: Number(lesson.durationMinutes || 0),
			price: Number(lesson.price || 0),
		}))
		: undefined,
});

const toCoachRequestPayload = (coach) => {
	const payload = toCoachPayload(coach);
	const imageFile = coach?.imageFile || (isFile(coach?.image) ? coach.image : null);

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

export async function getCoaches() {
	const response = await apiClient.get("/coaches");
	return (unwrap(response) || []).map(normalizeCoach);
}

export async function getCourseScopedCoaches(courseId) {
	const coaches = await getCoaches();
	if (!courseId) return coaches;

	const filtered = coaches.filter((coach) => coach.courseId === courseId);
	return filtered.length > 0 ? filtered : coaches;
}

export async function getCoachById(id) {
	const response = await apiClient.get(`/coaches/${id}`);
	return normalizeCoach(unwrap(response));
}

export async function createCoach(payload) {
	const response = await apiClient.post("/coaches", toCoachRequestPayload(payload));
	return normalizeCoach(unwrap(response));
}

export async function updateCoach(id, payload) {
	const requestPayload = toCoachRequestPayload(payload);

	try {
		const response = await apiClient.put(`/coaches/${id}`, requestPayload);
		return normalizeCoach(unwrap(response));
	} catch (error) {
		if (requestPayload instanceof FormData || error?.response?.status !== 400) {
			throw error;
		}

		// Fallback for legacy records when backend validators reject newer optional fields.
		const legacyPayload = {
			full_name: requestPayload.full_name,
			specialization: requestPayload.specialization,
			description: requestPayload.description,
			experience_years: requestPayload.experience_years,
			rating: requestPayload.rating,
			reviews_count: requestPayload.reviews_count,
			students_taught: requestPayload.students_taught,
			profile_img: requestPayload.profile_img,
		};

		const retryResponse = await apiClient.put(`/coaches/${id}`, legacyPayload);
		return normalizeCoach(unwrap(retryResponse));
	}
}

export async function deleteCoach(id) {
	await apiClient.delete(`/coaches/${id}`);
}

export async function getCoachLessons(coachId) {
	const response = await apiClient.get(`/coaches/${coachId}/lessons`);
	return (unwrap(response) || []).map((lesson) => ({
		...normalizeLesson(lesson),
		coachId,
	}));
}

const toLessonPayload = (payload) => ({
	id: payload.id,
	title: payload.title,
	durationMinutes: Number(payload.durationMinutes || 0),
	price: Number(payload.price || 0),
});

async function persistCoachLessons(coachId, mutator) {
	const coach = await getCoachById(coachId);
	const currentLessons = Array.isArray(coach?.lessons) ? coach.lessons : await getCoachLessons(coachId);
	const nextLessons = mutator(currentLessons.map((lesson) => toLessonPayload(lesson)));

	await updateCoach(coachId, {
		...coach,
		lessons: nextLessons,
	});

	return getCoachLessons(coachId);
}

export async function createCoachLesson(coachId, payload) {
	return persistCoachLessons(coachId, (lessons) => [
		...lessons,
		toLessonPayload(payload),
	]);
}

export async function updateCoachLesson(coachId, lessonId, payload) {
	return persistCoachLessons(coachId, (lessons) =>
		lessons.map((lesson) =>
			String(lesson.id || lesson._id) === String(lessonId)
				? {
					...lesson,
					...toLessonPayload(payload),
				}
				: lesson
		)
	);
}

export async function deleteCoachLesson(coachId, lessonId) {
	return persistCoachLessons(coachId, (lessons) =>
		lessons.filter((lesson) => String(lesson.id || lesson._id) !== String(lessonId))
	);
}
