import { authAxios, publicAxios } from "./axiosInstance";

/* GET TEE TIMES FOR A COURSE (PUBLIC) */
export const getTeeTimesForCourse = (courseId) => {
  return publicAxios.get(`/courses/${courseId}/tee-times`);
};

/* CREATE TEE TIME (COURSE_ADMIN) */
export const createTeeTime = (payload) => {
  return authAxios.post("/tee-times", payload);
};

/* BOOK TEE TIME (USER) */
export const bookTeeTime = (payload) => {
  return authAxios.post("/tee-times/book", payload);
};
