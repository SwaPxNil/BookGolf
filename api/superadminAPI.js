import { authAxios } from "./axiosInstance";

// GET /api/super-admin/course-admins
export const getCourseAdmins = async () => {
  const res = await authAxios.get("/super-admin/course-admins");
  return res.data; // { success, count, data }
};
