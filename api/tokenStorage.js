import AsyncStorage from "@react-native-async-storage/async-storage";

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export const saveAuthTokens = async ({ accessToken, refreshToken }) => {
  const entries = [];
  if (accessToken) {
    entries.push([ACCESS_TOKEN_KEY, accessToken]);
  }
  if (refreshToken) {
    entries.push([REFRESH_TOKEN_KEY, refreshToken]);
  }
  if (entries.length > 0) {
    await AsyncStorage.multiSet(entries);
  }
};

export const getAccessToken = async () => {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async () => {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearAuthTokens = async () => {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
};
