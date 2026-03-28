import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = ({ email }) => {
    const role = String(email || "").toLowerCase().includes("superadmin") ? "superadmin" : "courseAdmin";
    setUser({ email, role, name: role === "superadmin" ? "Super Admin" : "Course Admin" });
    return role;
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
