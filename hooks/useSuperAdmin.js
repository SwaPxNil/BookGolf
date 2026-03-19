import { useQuery } from "@tanstack/react-query";
import { getCourseAdmins } from "../api/superadminAPI";

export const useCourseAdmins = (options = {}) => {
  return useQuery({
    queryKey: ["courseAdmins"],
    queryFn: getCourseAdmins,
    ...options,
  });
};
