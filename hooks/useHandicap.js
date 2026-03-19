import { useMutation } from "@tanstack/react-query";
import { calculateHandicap } from "../api/handicapAPI";

/* CALCULATE HANDICAP */
export const useCalculateHandicap = (options = {}) => {
  return useMutation({
    mutationFn: calculateHandicap,
    ...options,
  });
};
