import { useMutation, useQuery } from "@tanstack/react-query";
import { getMyProfile, loginUser, refreshAccessToken, registerUser, resend2FA, updateMyProfile, verify2FA } from "../api/authAPI";


/* REGISTER */
export const useRegister = (options = {}) => {
  return useMutation({
    mutationFn: registerUser,
    ...options,
  });
};

/* LOGIN */
export const useLogin = (options = {}) => {
  return useMutation({
    mutationFn: loginUser,
    ...options,
  });
};

/* VERIFY 2FA */
export const useVerify2FA = (options = {}) => {
  return useMutation({
    mutationFn: verify2FA,
    ...options,
  });
};

/* RESEND 2FA */
export const useResend2FA = (options = {}) => {
  return useMutation({
    mutationFn: resend2FA,
    ...options,
  });
};

/* REFRESH ACCESS TOKEN */
export const useRefreshToken = (options = {}) => {
  return useMutation({
    mutationFn: refreshAccessToken,
    ...options,
  });
};

/* GET CURRENT USER PROFILE */
export const useMyProfile = (options = {}) => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMyProfile,
    ...options,
  });
};

/* UPDATE CURRENT USER PROFILE */
export const useUpdateMyProfile = (options = {}) => {
  return useMutation({
    mutationFn: updateMyProfile,
    ...options,
  });
};
