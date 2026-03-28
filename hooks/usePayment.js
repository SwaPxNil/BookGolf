import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyPayments, processAdvanceBookingPayment } from "../api/paymentAPI";

/* GET CURRENT USER PAYMENTS */
export const useMyPayments = (options = {}) => {
  return useQuery({
    queryKey: ["payments", "me"],
    queryFn: getMyPayments,
    ...options,
  });
};

export const useProcessAdvanceBookingPayment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: processAdvanceBookingPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "me"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
    ...options,
  });
};
