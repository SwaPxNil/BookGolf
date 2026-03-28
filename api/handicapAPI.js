import { authAxios, publicAxios } from "./axiosInstance";

/* CALCULATE HANDICAP */
export const calculateHandicap = (data) => {
  // data: { recent_score_1, recent_score_2, course_name }
  return authAxios.post("/handicap/calculate", data);
};

export const getHandicapRating = (courseName) => {
  return publicAxios.get("/handicap-rating", {
    params: {
      name: courseName,
    },
  });
};
