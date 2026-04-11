import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMyProfile, login as loginRequest, resendTwoFactor, verifyTwoFactor } from "../api/authAPI";
import { clearTokens, setAccessToken, setRefreshToken } from "../api/tokenStorage";

const AuthContext = createContext(null);

const mapRole = (backendRole) => {
  if (backendRole === "SUPER_ADMIN") return "superadmin";
  if (backendRole === "COURSE_ADMIN") return "courseAdmin";
  return "user";
};

const normalizeUser = (profile) => ({
  id: profile?._id,
  email: profile?.email,
  name: profile?.full_name || "User",
  role: mapRole(profile?.role),
  roleRaw: profile?.role,
  image: profile?.profile_img || "",
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const profile = await getMyProfile();
        if (mounted) {
          setUser(normalizeUser(profile));
        }
      } catch (error) {
        clearTokens();
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    const result = await loginRequest({ email, password });
    return {
      tempToken: result?.temp_token,
      message: result?.msg,
    };
  };

  const completeTwoFactorLogin = async ({ tempToken, code }) => {
    const verification = await verifyTwoFactor({
      temp_token: tempToken,
      two_factor_code: code,
    });

    setAccessToken(verification?.access_token);
    setRefreshToken(verification?.refresh_token);

    const profile = await getMyProfile();
    const normalized = normalizeUser(profile);
    setUser(normalized);
    return normalized;
  };

  const resendTwoFactorCode = async ({ tempToken }) => {
    const result = await resendTwoFactor({ temp_token: tempToken });
    return {
      tempToken: result?.temp_token,
      message: result?.msg,
    };
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, authLoading, login, completeTwoFactorLogin, resendTwoFactorCode, logout }),
    [user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
