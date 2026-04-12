import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyPayments,
  initiateAdvanceBookingPayment,
  processAdvanceBookingPayment,
  verifyEsewaAdvancePayment,
  verifyKhaltiAdvancePayment,
} from "../api/paymentAPI";

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

export const useInitiateAdvanceBookingPayment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: initiateAdvanceBookingPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "me"] });
    },
    ...options,
  });
};

export const useVerifyEsewaAdvancePayment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyEsewaAdvancePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "me"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
    ...options,
  });
};

export const useVerifyKhaltiAdvancePayment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyKhaltiAdvancePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "me"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
    ...options,
  });
};
