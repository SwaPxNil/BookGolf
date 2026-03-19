import { authAxios } from "./axiosInstance";

/* CALCULATE HANDICAP */
export const calculateHandicap = (data) => {
  // data: { recent_score_1, recent_score_2, course_id }
  return authAxios.post("/handicap/calculate", data);
};
