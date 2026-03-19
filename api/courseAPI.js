import { publicAxios, authAxios } from "./axiosInstance";

/* PUBLIC */

// get all courses
export const getCourses = () => {
  return publicAxios.get("/courses");
};

// get single course
export const getCourseById = (id) => {
  return publicAxios.get(`/courses/${id}`);
};

/* COURSE_ADMIN / SUPER_ADMIN */

// create course
export const createCourse = (data) => {
  return authAxios.post("/courses", data);
};

// update course
export const updateCourse = (id, data) => {
  return authAxios.put(`/courses/${id}`, data);
};

// delete course (SUPER_ADMIN)
export const deleteCourse = (id) => {
  return authAxios.delete(`/courses/${id}`);
};

// update course status (SUPER_ADMIN)
export const updateCourseStatus = (id, status) => {
  return authAxios.put(`/super-admin/courses/${id}/status`, { status });
};
