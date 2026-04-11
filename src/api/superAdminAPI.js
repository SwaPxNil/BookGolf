import apiClient from "./apiClient";

const unwrap = (response) => response?.data?.data ?? response?.data;

const normalizeCourseAdmin = (admin) => ({
  id: admin?._id || admin?.id,
  fullName: admin?.full_name || admin?.fullName || "",
  email: admin?.email || "",
  role: admin?.role || "COURSE_ADMIN",
  profileImage: admin?.profile_img || "",
  status: admin?.status || "ACTIVE",
});

export async function getCourseAdmins() {
  const response = await apiClient.get("/super-admin/course-admins");
  return (unwrap(response) || []).map(normalizeCourseAdmin);
}

export async function createCourseAdmin(payload) {
  const response = await apiClient.post("/super-admin/course-admins", {
    full_name: payload.fullName,
    email: payload.email,
    password: payload.password,
  });
  return normalizeCourseAdmin(unwrap(response));
}

export async function updateCourseAdminStatus(id, status) {
  try {
    const response = await apiClient.patch(`/super-admin/course-admins/${id}/status`, {
      status,
    });
    return normalizeCourseAdmin(unwrap(response));
  } catch (primaryError) {
    const fallbackPath = status === "ACTIVE"
      ? `/super-admin/course-admins/${id}/activate`
      : `/super-admin/course-admins/${id}/deactivate`;

    const response = await apiClient.patch(fallbackPath);
    return normalizeCourseAdmin(unwrap(response));
  }
}

export async function getSuperAdminLogs() {
  try {
    const response = await apiClient.get("/super-admin/logs");
    return unwrap(response) || [];
  } catch (primaryError) {
    const response = await apiClient.get("/admin-logs");
    return unwrap(response) || [];
  }
}
