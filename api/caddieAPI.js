import { publicAxios, authAxios } from "./axiosInstance";

/* PUBLIC */

// get all caddies
export const getCaddies = () => {
  return publicAxios.get("/caddies");
};

// get single caddie
export const getCaddieById = (id) => {
  return publicAxios.get(`/caddies/${id}`);
};

// get caddie availability
export const getCaddieAvailability = (id) => {
  return publicAxios.get(`/caddies/${id}/availability`);
};

/* COURSE_ADMIN */

// create caddie
export const createCaddie = (data) => {
  return authAxios.post("/caddies", data);
};

// update caddie
export const updateCaddie = (id, data) => {
  return authAxios.put(`/caddies/${id}`, data);
};

// delete caddie
export const deleteCaddie = (id) => {
  return authAxios.delete(`/caddies/${id}`);
};

/* USER */

// book caddie
export const bookCaddie = (data) => {
  // data: { caddieId, slot }
  return authAxios.post("/caddies/book", data);
};

// cancel caddie booking
export const cancelCaddieBooking = (bookingId) => {
  return authAxios.delete(`/caddies/book/${bookingId}`);
};
