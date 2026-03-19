import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "../api/bookingAPI";

/* GET CURRENT USER BOOKINGS */
export const useMyBookings = (options = {}) => {
  return useQuery({
    queryKey: ["bookings", "me"],
    queryFn: getMyBookings,
    ...options,
  });
};
