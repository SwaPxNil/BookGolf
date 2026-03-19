import { useQuery } from "@tanstack/react-query";
import { getMyPayments } from "../api/paymentAPI";

/* GET CURRENT USER PAYMENTS */
export const useMyPayments = (options = {}) => {
  return useQuery({
    queryKey: ["payments", "me"],
    queryFn: getMyPayments,
    ...options,
  });
};
