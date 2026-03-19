import { authAxios } from "./axiosInstance";

/* GET CURRENT USER PAYMENTS */
export const getMyPayments = () => {
  return authAxios.get("/payments/me");
};
