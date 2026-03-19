import { publicAxios, authAxios } from "./axiosInstance";

/* PUBLIC */

// get all coaches
export const getCoaches = () => {
  return publicAxios.get("/coaches");
};

// get single coach
export const getCoachById = (id) => {
  return publicAxios.get(`/coaches/${id}`);
};

// get coach lessons
export const getCoachLessons = (id) => {
  return publicAxios.get(`/coaches/${id}/lessons`);
};

// get coach availability
export const getCoachAvailability = (id) => {
  return publicAxios.get(`/coaches/${id}/availability`);
};

/* COURSE_ADMIN */

// create coach
export const createCoach = (data) => {
  return authAxios.post("/coaches", data);
};

// update coach
export const updateCoach = (id, data) => {
  return authAxios.put(`/coaches/${id}`, data);
};

// delete coach
export const deleteCoach = (id) => {
  return authAxios.delete(`/coaches/${id}`);
};

/* USER */

// book coach lesson
export const bookCoachLesson = (data) => {
  // data: { coachId, lessonId, slot }
  return authAxios.post("/coach-lessons/book", data);
};

// cancel coach lesson booking
export const cancelCoachLessonBooking = (bookingId) => {
  return authAxios.delete(`/coach-lessons/${bookingId}`);
};
