import apiClient from "./apiClient";
import { getMyProfile } from "./authAPI";

const unwrap = (response) => response?.data?.data ?? response?.data;

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);

const normalizeCourse = (course) => ({
  id: course?._id || course?.id,
  name: course?.name || "",
  location: course?.location || "",
  status: course?.status || "PENDING",
  slopeRating: course?.slope_rating ?? 0,
  courseRating: course?.course_rating ?? 0,
  teeTimePrice: course?.tee_time_price ?? 0,
  image: course?.image_url || "",
  createdBy: course?.created_by,
  createdById: course?.created_by?._id || course?.created_by || null,
  createdByName: course?.created_by?.full_name || course?.created_by?.name || "Unassigned",
  createdByEmail: course?.created_by?.email || "",
  holeLayouts: Array.isArray(course?.hole_layouts) ? course.hole_layouts : [],
});

const toCoursePayload = (course) => {
  const assignmentValue = hasOwn(course, "createdBy")
    ? course.createdBy
    : hasOwn(course, "createdById")
      ? course.createdById
      : hasOwn(course, "courseAdminId")
        ? course.courseAdminId
        : undefined;

  return {
  name: course.name,
  location: course.location,
  slope_rating: Number(course.slopeRating || 0),
  course_rating: Number(course.courseRating || 0),
  tee_time_price: Number(course.teeTimePrice || 0),
  image_url: course.image || undefined,
  status: course.status || undefined,
  created_by: assignmentValue,
  course_admin_id: assignmentValue,
  };
};

export async function getCourses() {
  const response = await apiClient.get("/courses");
  return (unwrap(response) || []).map(normalizeCourse);
}

export async function getCourseById(id) {
  const response = await apiClient.get(`/courses/${id}`);
  return normalizeCourse(unwrap(response));
}

export async function createCourse(payload) {
  const response = await apiClient.post("/courses", toCoursePayload(payload));
  return normalizeCourse(unwrap(response));
}

export async function updateCourse(id, payload) {
  const response = await apiClient.put(`/courses/${id}`, toCoursePayload(payload));
  return normalizeCourse(unwrap(response));
}

export async function deleteCourse(id) {
  await apiClient.delete(`/courses/${id}`);
}

export async function updateCourseStatus(id, status) {
  const response = await apiClient.put(`/super-admin/courses/${id}/status`, { status });
  return normalizeCourse(unwrap(response));
}

export async function getMyCourse() {
  const profile = await getMyProfile();
  if (profile?.role === "SUPER_ADMIN") {
    const response = await apiClient.get("/courses/me");
    const data = unwrap(response);
    return Array.isArray(data) ? data.map(normalizeCourse) : null;
  }

  const response = await apiClient.get("/courses/me");
  return normalizeCourse(unwrap(response));
}