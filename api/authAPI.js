import { authAxios, publicAxios } from "./axiosInstance";

/* REGISTER */
export const registerUser = (data) => {
  // data: { full_name, email, password, role }
  return publicAxios.post("/auth/register", data);
};

/* LOGIN */
export const loginUser = (data) => {
  // data: { email, password }
  return publicAxios.post("/auth/login", data);
};

/* VERIFY 2FA */
export const verify2FA = (data) => {
  // data: { temp_token, two_factor_code }
  return publicAxios.post("/auth/verify-2fa", data);
};

/* REFRESH TOKEN */
export const refreshAccessToken = (data) => {
  // data: { refresh_token }
  return publicAxios.post("/auth/refresh", data);
};

/* GET PROFILE */
export const getMyProfile = (accessToken) => {
  if (!accessToken) {
    return authAxios.get("/auth/me");
  }
  return authAxios.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
