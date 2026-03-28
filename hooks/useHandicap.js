import { useMutation } from "@tanstack/react-query";
import { calculateHandicap, getHandicapRating } from "../api/handicapAPI";

/* CALCULATE HANDICAP */
export const useCalculateHandicap = (options = {}) => {
  return useMutation({
    mutationFn: calculateHandicap,
    ...options,
  });
};

export const useHandicapRating = (options = {}) => {
  return useMutation({
    mutationFn: getHandicapRating,
    ...options,
  });
};
