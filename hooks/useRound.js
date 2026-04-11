import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRound,
  getMyRounds,
  getRoundById,
  updateRoundScorecard,
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

/* UPDATE ROUND SCORECARD */
export const useUpdateRoundScorecard = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roundId, payload }) => updateRoundScorecard(roundId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rounds", "me"] });
      if (variables?.roundId) {
        queryClient.invalidateQueries({ queryKey: ["rounds", variables.roundId] });
      }
    },
    ...options,
  });
};
