import { useQuery } from "@tanstack/react-query";
import { getAdminLogs } from "../api/adminlogAPI";

/* GET ADMIN LOGS */
export const useAdminLogs = (options = {}) => {
  return useQuery({
    queryKey: ["admin-logs"],
    queryFn: getAdminLogs,
    ...options,
  });
};
