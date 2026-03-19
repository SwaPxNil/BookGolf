import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../api/dashboardAPI";

/* GET DASHBOARD DATA */
export const useDashboard = (options = {}) => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
    ...options,
  });
};
