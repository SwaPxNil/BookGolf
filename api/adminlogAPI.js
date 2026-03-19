import { authAxios } from "./axiosInstance";

/* GET ADMIN LOGS */
export const getAdminLogs = () => {
  return authAxios.get("/admin-logs");
};
