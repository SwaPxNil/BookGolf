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

/* RESEND 2FA */
export const resend2FA = (data) => {
  // data: { temp_token }
  return publicAxios.post("/auth/resend-2fa", data);
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

/* UPDATE PROFILE */
export const updateMyProfile = (data) => {
  // data: { full_name?, email?, profile_img?, current_password?, new_password?, image? }
  const hasImage = Boolean(data?.image);

  if (!hasImage) {
    return authAxios.put("/auth/me", data);
  }

  const formData = new FormData();

  if (typeof data?.full_name === "string") formData.append("full_name", data.full_name);
  if (typeof data?.email === "string") formData.append("email", data.email);
  if (typeof data?.profile_img === "string") formData.append("profile_img", data.profile_img);
  if (typeof data?.current_password === "string") formData.append("current_password", data.current_password);
  if (typeof data?.new_password === "string") formData.append("new_password", data.new_password);

  formData.append("image", {
    uri: data.image.uri,
    name: data.image.name || "profile.jpg",
    type: data.image.type || "image/jpeg",
  });

  return authAxios.put("/auth/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
