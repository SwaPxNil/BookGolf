import { authAxios } from "./axiosInstance";

/* GET DASHBOARD DATA */
export const getDashboardData = () => {
  return authAxios.get("/dashboard");
};
