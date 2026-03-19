import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
} from "../api/courseAPI";

/* PUBLIC QUERIES */

export const useCourses = (options = {}) => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    ...options,
  });
};

export const useCourse = (id, options = {}) => {
  return useQuery({
    queryKey: ["courses", id],
    queryFn: () => getCourseById(id),
    enabled: !!id,
    ...options,
  });
};

/* MUTATIONS */

export const useCreateCourse = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    ...options,
  });
};

export const useUpdateCourse = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCourse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", variables.id] });
    },
    ...options,
  });
};

export const useDeleteCourse = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    ...options,
  });
};

export const useUpdateCourseStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateCourseStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", variables.id] });
    },
    ...options,
  });
};
