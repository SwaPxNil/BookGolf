import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCaddies,
  getCaddieById,
  getCaddieAvailability,
  createCaddie,
  updateCaddie,
  deleteCaddie,
  bookCaddie,
  cancelCaddieBooking,
} from "../api/caddieAPI";

/* PUBLIC QUERIES */

export const useCaddies = (options = {}) => {
  return useQuery({
    queryKey: ["caddies"],
    queryFn: getCaddies,
    ...options,
  });
};

export const useCaddie = (id, options = {}) => {
  return useQuery({
    queryKey: ["caddies", id],
    queryFn: () => getCaddieById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCaddieAvailability = (id, options = {}) => {
  return useQuery({
    queryKey: ["caddies", id, "availability"],
    queryFn: () => getCaddieAvailability(id),
    enabled: !!id,
    ...options,
  });
};

/* COURSE_ADMIN MUTATIONS */

export const useCreateCaddie = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCaddie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caddies"] });
    },
    ...options,
  });
};

export const useUpdateCaddie = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCaddie(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["caddies"] });
      queryClient.invalidateQueries({ queryKey: ["caddies", variables.id] });
    },
    ...options,
  });
};

export const useDeleteCaddie = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCaddie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caddies"] });
    },
    ...options,
  });
};

/* USER MUTATIONS */

export const useBookCaddie = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookCaddie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caddies"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
    ...options,
  });
};

export const useCancelCaddieBooking = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelCaddieBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caddies"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
    },
    ...options,
  });
};
