import { authAxios, publicAxios } from "./axiosInstance";

/* GET TEE TIMES FOR A COURSE (PUBLIC) */
export const getTeeTimesForCourse = (courseId) => {
  return publicAxios.get(`/courses/${courseId}/tee-times`);
};

/* CREATE TEE TIME (COURSE_ADMIN) */
export const createTeeTime = (payload) => {
  const normalizedPayload = {
    ...payload,
    course_id: payload?.course_id ?? payload?.courseId,
    slot_time: payload?.slot_time ?? payload?.slotTime,
  };

  return authAxios.post("/tee-times", normalizedPayload);
};

/* BOOK TEE TIME (USER) */
export const bookTeeTime = (payload) => {
  const normalizedPayload = {
    ...payload,
    teeTimeId: payload?.teeTimeId ?? payload?.tee_time_id,
  };

  return authAxios.post("/tee-times/book", normalizedPayload);
};
