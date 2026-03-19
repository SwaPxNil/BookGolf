import { authAxios } from "./axiosInstance";

/* GET CURRENT USER BOOKINGS */
export const getMyBookings = () => {
  return authAxios.get("/bookings/me");
};
