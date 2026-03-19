import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTeeTimesForCourse,
  createTeeTime,
  bookTeeTime,
} from "../api/teetimeAPI";

/* GET TEE TIMES FOR COURSE */
export const useTeeTimesForCourse = (courseId, options = {}) => {
  return useQuery({
    queryKey: ["teeTimes", courseId],
    queryFn: () => getTeeTimesForCourse(courseId),
    enabled: !!courseId,
    ...options,
  });
};

/* CREATE TEE TIME */
export const useCreateTeeTime = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeeTime,
    onSuccess: (_, variables) => {
      const courseId = variables?.course_id ?? variables?.courseId;
      if (courseId) {
        queryClient.invalidateQueries({
          queryKey: ["teeTimes", courseId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["teeTimes"] });
      }
    },
    ...options,
  });
};

/* BOOK TEE TIME */
export const useBookTeeTime = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookTeeTime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teeTimes"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
    ...options,
  });
};
