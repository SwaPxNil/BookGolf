import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCoaches,
  getCoachById,
  getCoachLessons,
  getCoachAvailability,
  createCoach,
  updateCoach,
  deleteCoach,
  bookCoachLesson,
  cancelCoachLessonBooking,
} from "../api/coachAPI";

/* PUBLIC QUERIES */

export const useCoaches = (options = {}) => {
  return useQuery({
    queryKey: ["coaches"],
    queryFn: getCoaches,
    ...options,
  });
};

export const useCoach = (id, options = {}) => {
  return useQuery({
    queryKey: ["coaches", id],
    queryFn: () => getCoachById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCoachLessons = (id, options = {}) => {
  return useQuery({
    queryKey: ["coaches", id, "lessons"],
    queryFn: () => getCoachLessons(id),
    enabled: !!id,
    ...options,
  });
};

export const useCoachAvailability = (id, options = {}) => {
  return useQuery({
    queryKey: ["coaches", id, "availability"],
    queryFn: () => getCoachAvailability(id),
    enabled: !!id,
    ...options,
  });
};

/* COURSE_ADMIN MUTATIONS */

export const useCreateCoach = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
    },
    ...options,
  });
};

export const useUpdateCoach = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCoach(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coaches", variables.id] });
    },
    ...options,
  });
};

export const useDeleteCoach = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
    },
    ...options,
  });
};

/* USER MUTATIONS */

export const useBookCoachLesson = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookCoachLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
    ...options,
  });
};

export const useCancelCoachLessonBooking = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelCoachLessonBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
    ...options,
  });
};
