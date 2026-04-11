import { authAxios } from "./axiosInstance";

/* GET CURRENT USER BOOKINGS */
export const getMyBookings = () => {
  return authAxios.get("/bookings/me");
};

/* GET RECENT LESSON BOOKINGS FOR CURRENT USER */
export const getMyRecentLessons = () => {
  return authAxios.get("/bookings/me/recent-lessons");
};

/* GET RECENT CADDIE BOOKINGS FOR CURRENT USER */
export const getMyRecentCaddies = () => {
  return authAxios.get("/bookings/me/recent-caddies");
};

/* CANCEL CURRENT USER BOOKING */
export const cancelMyBooking = (bookingId) => {
  return authAxios.patch(`/bookings/me/${bookingId}/cancel`);
};

/* RATE CURRENT USER BOOKING */
export const rateMyBooking = (bookingId, rating) => {
  return authAxios.patch(`/bookings/me/${bookingId}/rate`, { rating });
};
