import apiClient from "./apiClient";

const unwrap = (response) => response?.data?.data ?? response?.data;

const normalizeType = (booking) =>
	String(
		booking?.booking_type ||
		booking?.type ||
		booking?.service_type ||
		""
	)
		.trim()
		.toUpperCase();

const isCoachType = (bookingType) =>
	bookingType === "COACH" ||
	bookingType === "COACH_LESSON" ||
	bookingType === "LESSON";

const isCaddieType = (bookingType) =>
	bookingType === "CADDIE" ||
	bookingType === "CADDIE_BOOKING";

const bookingTypeLabel = (bookingType) => {
	if (bookingType === "TEE_TIME") return "Tee Time";
	if (isCoachType(bookingType)) return "Coach";
	if (isCaddieType(bookingType)) return "Caddie";
	return bookingType || "Unknown";
};

const extractCourseId = (booking) =>
	booking?.course_id?._id ||
	booking?.course_id ||
	booking?.tee_time_id?.course_id?._id ||
	booking?.tee_time_id?.course_id ||
	booking?.coach_id?.course_id?._id ||
	booking?.coach_id?.course_id ||
	booking?.coach?.course_id?._id ||
	booking?.coach?.course_id ||
	booking?.lesson?.coach_id?.course_id?._id ||
	booking?.lesson?.coach_id?.course_id ||
	booking?.lesson_id?.coach_id?.course_id?._id ||
	booking?.lesson_id?.coach_id?.course_id ||
	booking?.coach_lesson?.coach_id?.course_id?._id ||
	booking?.coach_lesson?.coach_id?.course_id ||
	booking?.caddie_id?.course_id?._id ||
	booking?.caddie_id?.course_id ||
	booking?.caddie?.course_id?._id ||
	booking?.caddie?.course_id ||
	null;

const normalizeBooking = (booking) => {
	const bookingType = normalizeType(booking);

	const assignedTo =
		booking?.coach_id?.full_name ||
		booking?.coach?.full_name ||
		booking?.lesson?.coach_id?.full_name ||
		booking?.lesson_id?.coach_id?.full_name ||
		booking?.caddie_id?.full_name ||
		booking?.caddie?.full_name ||
		booking?.course_id?.name ||
		"-";

	const price =
		booking?.tee_time_id?.price ??
		booking?.lesson?.price ??
		booking?.lesson_id?.price ??
		booking?.caddie_price ??
		booking?.price ??
		0;

	return {
		id: booking?._id,
		courseId: extractCourseId(booking),
		bookingType,
		type: bookingTypeLabel(bookingType),
		userName: booking?.user_id?.full_name || "-",
		userEmail: booking?.user_id?.email || "-",
		assignedTo,
		date: booking?.slot || booking?.created_at,
		price,
		status: booking?.status || "-",
		adminNotes: booking?.admin_notes || "",
		slot: booking?.slot || null,
		raw: booking,
	};
};

export async function getAllBookings() {
	const response = await apiClient.get("/bookings");
	return (unwrap(response) || []).map(normalizeBooking);
}

export async function getCourseBookings(courseId) {
	const bookings = await getAllBookings();
	if (!courseId) return bookings;

	const filtered = bookings.filter((booking) => booking.courseId === courseId);
	if (filtered.length > 0) {
		const withUnknownCourse = bookings.filter((booking) => booking.courseId == null);
		return [...filtered, ...withUnknownCourse];
	}

	return bookings;
}

export async function getMyBookings() {
	const response = await apiClient.get("/bookings/me");
	return (unwrap(response) || []).map(normalizeBooking);
}

export async function updateBooking(id, payload) {
	const response = await apiClient.put(`/bookings/${id}`, payload);
	return normalizeBooking(unwrap(response));
}

export async function cancelBooking(id, payload = {}) {
	const response = await apiClient.patch(`/bookings/${id}/cancel`, payload);
	return normalizeBooking(unwrap(response));
}

export async function deleteBooking(id, options = {}) {
	await apiClient.delete(`/bookings/${id}`);
}
