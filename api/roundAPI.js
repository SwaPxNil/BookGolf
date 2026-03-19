import { authAxios } from "./axiosInstance";

/* CREATE ROUND */
export const createRound = (payload) => {
  const normalizedPayload = {
    ...payload,
    // Backend currently validates user_id before overriding it with req.user.id.
    user_id: payload?.user_id ?? "self",
  };

  return authAxios.post("/rounds", normalizedPayload);
};

/* GET CURRENT USER ROUNDS */
export const getMyRounds = () => {
  return authAxios.get("/rounds/me");
};

/* GET SINGLE ROUND BY ID */
export const getRoundById = (roundId) => {
  return authAxios.get(`/rounds/${roundId}`);
};
