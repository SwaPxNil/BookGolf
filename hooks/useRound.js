import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRound,
  getMyRounds,
  getRoundById,
} from "../api/roundAPI";

/* GET CURRENT USER ROUNDS */
export const useMyRounds = (options = {}) => {
  return useQuery({
    queryKey: ["rounds", "me"],
    queryFn: getMyRounds,
    ...options,
  });
};

/* GET SINGLE ROUND */
export const useRound = (roundId, options = {}) => {
  return useQuery({
    queryKey: ["rounds", roundId],
    queryFn: () => getRoundById(roundId),
    enabled: !!roundId,
    ...options,
  });
};

/* CREATE ROUND */
export const useCreateRound = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRound,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rounds", "me"] });
    },
    ...options,
  });
};
