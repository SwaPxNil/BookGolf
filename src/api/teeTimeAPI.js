import apiClient from "./apiClient";

const unwrap = (response) => response?.data?.data ?? response?.data;

const normalizeTeeTime = (teeTime) => ({
  id: teeTime?._id,
  templateId: teeTime?.template_id || null,
  courseId: teeTime?.course_id,
  slotTime: teeTime?.slot_time,
  price: teeTime?.price ?? 0,
  status: teeTime?.status || "AVAILABLE",
});

export async function getTeeTimesForCourse(courseId) {
  const response = await apiClient.get(`/courses/${courseId}/tee-times`);
  return (unwrap(response) || []).map(normalizeTeeTime);
}

export async function createTeeTime(payload) {
  const response = await apiClient.post("/tee-times", {
    course_id: payload.courseId,
    slot_time: payload.slotTime,
    status: payload.status || "AVAILABLE",
  });
  return normalizeTeeTime(unwrap(response));
}

export async function getCourseAdminTeeTimes(query = {}) {
  const params = new URLSearchParams();
  if (query.courseId) params.set("courseId", query.courseId);
  if (query.status) params.set("status", query.status);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const response = await apiClient.get(`/tee-times/course-admin${suffix}`);
  return (unwrap(response) || []).map(normalizeTeeTime);
}

export async function updateTeeTime(id, payload) {
  const response = await apiClient.put(`/tee-times/${id}`, payload);
  return normalizeTeeTime(unwrap(response));
}

export async function deleteTeeTime(id) {
  await apiClient.delete(`/tee-times/${id}`);
}