import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyBookings,
  getMyRecentLessons,
  getMyRecentCaddies,
  cancelMyBooking,
  rateMyBooking,
} from "../api/bookingAPI";

/* GET CURRENT USER BOOKINGS */
export const useMyBookings = (options = {}) => {
  return useQuery({
    queryKey: ["bookings", "me"],
    queryFn: getMyBookings,
    ...options,
  });
};

/* GET RECENT LESSON BOOKINGS FOR CURRENT USER */
export const useMyRecentLessons = (options = {}) => {
  return useQuery({
    queryKey: ["bookings", "me", "recent-lessons"],
    queryFn: getMyRecentLessons,
    ...options,
  });
};

/* GET RECENT CADDIE BOOKINGS FOR CURRENT USER */
export const useMyRecentCaddies = (options = {}) => {
  return useQuery({
    queryKey: ["bookings", "me", "recent-caddies"],
    queryFn: getMyRecentCaddies,
    ...options,
  });
};

/* CANCEL CURRENT USER BOOKING */
export const useCancelMyBooking = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelMyBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me", "recent-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me", "recent-caddies"] });
    },
    ...options,
  });
};

/* RATE CURRENT USER BOOKING */
export const useRateMyBooking = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, rating }) => rateMyBooking(bookingId, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me", "recent-lessons"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me", "recent-caddies"] });
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["caddies"] });
    },
    ...options,
  });
};
