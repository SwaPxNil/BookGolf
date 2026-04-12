import { authAxios } from "./axiosInstance";

/* GET CURRENT USER PAYMENTS */
export const getMyPayments = () => {
  return authAxios.get("/payments/me");
};

export const processAdvanceBookingPayment = (payload) => {
  return authAxios.post("/payments/bookings/advance", payload);
};

export const initiateAdvanceBookingPayment = (payload) => {
  return authAxios.post("/payments/bookings/advance/initiate", payload);
};

export const verifyEsewaAdvancePayment = (payload) => {
  return authAxios.post("/payments/esewa/verify", payload);
};

export const verifyKhaltiAdvancePayment = (payload) => {
  return authAxios.post("/payments/khalti/verify", payload);
};
