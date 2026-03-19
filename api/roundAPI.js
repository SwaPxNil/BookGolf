import { authAxios } from "./axiosInstance";

/* CREATE ROUND */
export const createRound = (payload) => {
  return authAxios.post("/rounds", payload);
};

/* GET CURRENT USER ROUNDS */
export const getMyRounds = () => {
  return authAxios.get("/rounds/me");
};

/* GET SINGLE ROUND BY ID */
export const getRoundById = (roundId) => {
  return authAxios.get(`/rounds/${roundId}`);
};
