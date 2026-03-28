import { authAxios } from "./axiosInstance";

/* GET CURRENT USER PAYMENTS */
export const getMyPayments = () => {
  return authAxios.get("/payments/me");
};

export const processAdvanceBookingPayment = (payload) => {
  return authAxios.post("/payments/bookings/advance", payload);
};
